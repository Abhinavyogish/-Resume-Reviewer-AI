import type { CandidateProfile } from '../ai/extraction.service.js';
import type { JobRequirements } from '../ai/extraction.service.js';
import { normalizeText } from '../utils/text.utils.js';

export const WEIGHTS = {
  skill: 0.4,
  experience: 0.2,
  semantic: 0.25,
  education: 0.1,
  industry: 0.05,
} as const;

export interface ScoreBreakdown {
  skillScore: number;
  experienceScore: number;
  semanticScore: number;
  educationScore: number;
  industryScore: number;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: ScoreBreakdown;
}

function skillMatchScore(
  candidateSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;
  const candSet = new Set(candidateSkills.map((s) => normalizeText(s)));
  const matched = requiredSkills.filter((s) => candSet.has(normalizeText(s)));
  return (matched.length / requiredSkills.length) * 100;
}

function experienceScore(candidateYears: number, requiredYears: number): number {
  if (requiredYears === 0) return 100;
  if (candidateYears >= requiredYears) {
    const excess = candidateYears - requiredYears;
    return Math.min(100, 100 - excess * 2);
  }
  const ratio = candidateYears / requiredYears;
  return Math.max(0, ratio * 80);
}

function semanticToScore(cosineSimilarity: number): number {
  return Math.max(0, Math.min(100, cosineSimilarity * 100));
}

function educationScore(
  candidateEducation: string[],
  preferredEducation: string[]
): number {
  if (preferredEducation.length === 0) return 100;
  const candNorm = new Set(candidateEducation.map((e) => normalizeText(e)));
  const matched = preferredEducation.filter((e) => candNorm.has(normalizeText(e)));
  if (matched.length > 0) return 100;
  const candStr = [...candNorm].join(' ');
  const hasOverlap = preferredEducation.some((p) => {
    const words = normalizeText(p).split(/\s+/);
    return words.some((w) => w.length > 4 && candStr.includes(w));
  });
  return hasOverlap ? 60 : 0;
}

function industryScore(
  candidateIndustries: string[],
  jobIndustries: string[]
): number {
  if (jobIndustries.length === 0) return 100;
  const candSet = new Set(candidateIndustries.map((i) => normalizeText(i)));
  const matched = jobIndustries.filter((i) => candSet.has(normalizeText(i)));
  return (matched.length / jobIndustries.length) * 100;
}

export function computeScore(
  candidate: CandidateProfile,
  job: JobRequirements,
  cosineSimilarity: number
): ScoringResult {
  const skillScore = skillMatchScore(candidate.skills, job.required_skills);
  const experienceScoreVal = experienceScore(
    candidate.years_experience,
    job.years_experience_required
  );
  const semanticScoreVal = semanticToScore(cosineSimilarity);
  const educationScoreVal = educationScore(
    candidate.education,
    job.preferred_education
  );
  const industryScoreVal = industryScore(
    candidate.industries,
    job.industries
  );

  const breakdown: ScoreBreakdown = {
    skillScore,
    experienceScore: experienceScoreVal,
    semanticScore: semanticScoreVal,
    educationScore: educationScoreVal,
    industryScore: industryScoreVal,
  };

  const totalScore =
    skillScore * WEIGHTS.skill +
    experienceScoreVal * WEIGHTS.experience +
    semanticScoreVal * WEIGHTS.semantic +
    educationScoreVal * WEIGHTS.education +
    industryScoreVal * WEIGHTS.industry;

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown,
  };
}
