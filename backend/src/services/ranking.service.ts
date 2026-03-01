import { prisma } from '../db/prisma.js';
import { sendChatCompletion } from '../ai/openrouter.client.js';
import { computeScore, type JobRequirements } from '../scoring/scoring.engine.js';
import { analyzeBias } from '../bias/bias.analyzer.js';
import { cosineSimilarity } from '../utils/vector.utils.js';
import type { CandidateProfile } from '../ai/extraction.service.js';

export interface RankedCandidate {
  resumeId: string;
  jobId: string;
  totalScore: number;
  breakdown: {
    skillScore: number;
    experienceScore: number;
    semanticScore: number;
    educationScore: number;
    industryScore: number;
  };
  biasFlags: { code: string; category: string; message: string; severity: string }[];
  explanation: string;
  structuredData: CandidateProfile | null;
  rawTextPreview: string;
}

function parseJson<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function getCosineSimilarityFromEmbeddings(
  resumeEmbedding: string | null,
  jobEmbedding: string | null
): number {
  const a = parseJson<number[]>(resumeEmbedding, []);
  const b = parseJson<number[]>(jobEmbedding, []);
  return cosineSimilarity(a, b);
}

async function generateExplanation(
  candidate: CandidateProfile,
  jobReqs: JobRequirements,
  breakdown: { skillScore: number; experienceScore: number; semanticScore: number; educationScore: number; industryScore: number }
): Promise<string> {
  const prompt = `Explain why this candidate scored ${breakdown.skillScore.toFixed(0)}% on skills, ${breakdown.experienceScore.toFixed(0)}% on experience, ${breakdown.semanticScore.toFixed(0)}% on fit for the job.
Candidate skills: ${candidate.skills.slice(0, 15).join(', ')}
Candidate experience: ${candidate.years_experience} years
Job required skills: ${jobReqs.required_skills.slice(0, 15).join(', ')}
Job required experience: ${jobReqs.years_experience_required} years

Return 2-3 concise bullets for recruiters. Be factual.`;
  try {
    return await sendChatCompletion([
      { role: 'system', content: 'You are a recruiter assistant. Write clear, concise bullet points.' },
      { role: 'user', content: prompt },
    ], { maxTokens: 300 });
  } catch {
    return 'Explanation unavailable.';
  }
}

export async function rankCandidates(
  jobId: string,
  limit = 50
): Promise<RankedCandidate[]> {
  const job = await prisma.jobDescription.findUniqueOrThrow({
    where: { id: jobId },
    select: { id: true, embedding: true, structuredRequirements: true },
  });
  const resumes = await prisma.resume.findMany({
    select: { id: true, rawText: true, structuredData: true, embedding: true },
  });

  if (resumes.length === 0) {
    return [];
  }

  if (!job.embedding) {
    throw new Error('Job has no embedding. Re-create the job to fix this.');
  }
  const jobReqs = parseJson<JobRequirements & Record<string, unknown>>(
    job.structuredRequirements,
    {}
  );

  if (!jobReqs.required_skills) jobReqs.required_skills = [];
  if (typeof jobReqs.years_experience_required !== 'number') jobReqs.years_experience_required = 0;
  if (!jobReqs.preferred_education) jobReqs.preferred_education = [];
  if (!jobReqs.seniority_level) jobReqs.seniority_level = '';
  if (!jobReqs.industries) jobReqs.industries = [];

  const results: Array<{
    resumeId: string;
    rawText: string;
    structuredData: CandidateProfile | null;
    totalScore: number;
    breakdown: RankedCandidate['breakdown'];
    biasFlags: RankedCandidate['biasFlags'];
  }> = [];
  const seenContent = new Set<string>();

  for (const resume of resumes) {
    const contentKey = resume.rawText.trim();
    if (seenContent.has(contentKey)) continue;
    seenContent.add(contentKey);
    const similarity = getCosineSimilarityFromEmbeddings(resume.embedding, job.embedding);

    const candidate = parseJson<Partial<CandidateProfile> & Record<string, unknown>>(
      resume.structuredData,
      {}
    );
    const profile: CandidateProfile = {
      skills: Array.isArray(candidate.skills) ? candidate.skills : [],
      years_experience: typeof candidate.years_experience === 'number' ? candidate.years_experience : 0,
      education: Array.isArray(candidate.education) ? candidate.education : [],
      seniority_level: String(candidate.seniority_level ?? ''),
      industries: Array.isArray(candidate.industries) ? candidate.industries : [],
    };
    const { totalScore, breakdown } = computeScore(profile, jobReqs, similarity);
    const biasFlags = analyzeBias(resume.rawText).map((f) => ({
      code: f.code,
      category: f.category,
      message: f.message,
      severity: f.severity,
    }));

    results.push({
      resumeId: resume.id,
      rawText: resume.rawText,
      structuredData: profile,
      totalScore,
      breakdown,
      biasFlags,
    });
  }

  results.sort((a, b) => b.totalScore - a.totalScore);
  const top = results.slice(0, limit);

  const withExplanations: RankedCandidate[] = [];
  for (const r of top) {
    const explanation = await generateExplanation(r.structuredData!, jobReqs, r.breakdown);
    withExplanations.push({
      resumeId: r.resumeId,
      jobId,
      totalScore: r.totalScore,
      breakdown: r.breakdown,
      biasFlags: r.biasFlags,
      explanation,
      structuredData: r.structuredData,
      rawTextPreview: r.rawText.slice(0, 300),
    });
  }

  for (const r of withExplanations) {
    await prisma.candidateScore.upsert({
      where: { resumeId_jobId: { resumeId: r.resumeId, jobId } },
      create: {
        resumeId: r.resumeId,
        jobId,
        totalScore: r.totalScore,
        skillScore: r.breakdown.skillScore,
        experienceScore: r.breakdown.experienceScore,
        semanticScore: r.breakdown.semanticScore,
        educationScore: r.breakdown.educationScore,
        industryScore: r.breakdown.industryScore,
        biasFlags: JSON.stringify(r.biasFlags),
        explanation: r.explanation,
      },
      update: {
        totalScore: r.totalScore,
        skillScore: r.breakdown.skillScore,
        experienceScore: r.breakdown.experienceScore,
        semanticScore: r.breakdown.semanticScore,
        educationScore: r.breakdown.educationScore,
        industryScore: r.breakdown.industryScore,
        biasFlags: JSON.stringify(r.biasFlags),
        explanation: r.explanation,
      },
    });
  }

  return withExplanations;
}

export async function getSavedRankings(jobId: string): Promise<RankedCandidate[]> {
  const scores = await prisma.candidateScore.findMany({
    where: { jobId },
    orderBy: { totalScore: 'desc' },
    include: { resume: true },
  });

  return scores.map((s) => ({
    resumeId: s.resumeId,
    jobId,
    totalScore: s.totalScore,
    breakdown: {
      skillScore: s.skillScore,
      experienceScore: s.experienceScore,
      semanticScore: s.semanticScore,
      educationScore: s.educationScore,
      industryScore: s.industryScore,
    },
    biasFlags: parseJson<RankedCandidate['biasFlags']>(s.biasFlags, []),
    explanation: s.explanation ?? 'Explanation unavailable.',
    structuredData: parseJson<CandidateProfile | null>(s.resume.structuredData, null),
    rawTextPreview: s.resume.rawText.slice(0, 300),
  }));
}
