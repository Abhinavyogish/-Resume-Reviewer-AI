import { z } from 'zod';
import { sendChatCompletion } from './openrouter.client.js';

export const CandidateProfileSchema = z.object({
  skills: z.array(z.string()),
  years_experience: z.number(),
  education: z.array(z.string()),
  seniority_level: z.string(),
  industries: z.array(z.string()),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

export const JobRequirementsSchema = z.object({
  required_skills: z.array(z.string()),
  years_experience_required: z.number(),
  preferred_education: z.array(z.string()),
  seniority_level: z.string(),
  industries: z.array(z.string()),
});

export type JobRequirements = z.infer<typeof JobRequirementsSchema>;

const EXTRACTION_PROMPT = `Extract structured candidate profile from the following resume text.
Return ONLY valid JSON, no markdown or code blocks.
Schema:
{
  "skills": ["skill1", "skill2"],
  "years_experience": number,
  "education": ["degree", "institution"],
  "seniority_level": "entry" | "mid" | "senior" | "lead" | "executive",
  "industries": ["industry1", "industry2"]
}`;

const CORRECTION_PROMPT = `The previous extraction returned invalid JSON.
Resume text:
---
{resume}
---

Previous response:
---
{response}
---

Fix and return ONLY valid JSON matching the schema.`;

export async function extractCandidateProfile(resumeText: string): Promise<CandidateProfile> {
  const content = `${EXTRACTION_PROMPT}\n\nResume:\n${resumeText.slice(0, 12000)}`;
  let raw = await sendChatCompletion([
    { role: 'system', content: 'You are a precise data extraction assistant. Output only valid JSON.' },
    { role: 'user', content },
  ]);

  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  const parsed = parseJsonSafe(raw);
  const result = CandidateProfileSchema.safeParse(parsed);

  if (result.success) {
    return result.data;
  }

  const correction = CORRECTION_PROMPT
    .replace('{resume}', resumeText.slice(0, 4000))
    .replace('{response}', raw);
  const fixed = await sendChatCompletion([
    { role: 'system', content: 'Fix the JSON. Output only valid JSON.' },
    { role: 'user', content: correction },
  ]);
  const fixedRaw = fixed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const fixedParsed = parseJsonSafe(fixedRaw);
  const fixedResult = CandidateProfileSchema.safeParse(fixedParsed);

  if (fixedResult.success) {
    return fixedResult.data;
  }
  throw new Error(`Failed to extract valid profile: ${fixedResult.error.message}`);
}

export async function extractJobRequirements(title: string, description: string): Promise<JobRequirements> {
  const content = `Extract structured job requirements from this job description.
Return ONLY valid JSON:
{
  "required_skills": ["skill1", "skill2"],
  "years_experience_required": number,
  "preferred_education": ["degree", "level"],
  "seniority_level": "entry" | "mid" | "senior" | "lead" | "executive",
  "industries": ["industry1"]
}

Job Title: ${title}

Description:
${description.slice(0, 8000)}`;

  const raw = await sendChatCompletion([
    { role: 'system', content: 'You are a precise data extraction assistant. Output only valid JSON.' },
    { role: 'user', content },
  ]);
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = parseJsonSafe(cleaned);
  const result = JobRequirementsSchema.safeParse(parsed);
  if (result.success) return result.data;
  throw new Error(`Failed to extract job requirements: ${result.error.message}`);
}

function parseJsonSafe(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    throw new Error('Invalid JSON in LLM response');
  }
}
