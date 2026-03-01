import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { prisma } from '../db/prisma.js';
import { normalizeText, collapseWhitespace } from '../utils/text.utils.js';
import { extractCandidateProfile } from '../ai/extraction.service.js';
import { generateEmbedding } from '../ai/embedding.service.js';

export async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseImage(buffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, 'eng');
  return data.text;
}

export function normalizeResumeText(text: string): string {
  return collapseWhitespace(normalizeText(text));
}

export async function createResumeFromText(rawText: string, name: string): Promise<{
  id: string;
  rawText: string;
  structuredData: unknown;
}> {
  const normalized = normalizeResumeText(rawText);
  if (!normalized.trim()) {
    throw new Error('Resume text is empty after normalization');
  }

  const profile = await extractCandidateProfile(normalized);
  const embedding = await generateEmbedding(normalized);

  const resume = await prisma.resume.create({
    data: {
      name: name.trim() || 'Untitled',
      rawText,
      structuredData: JSON.stringify(profile),
      embedding: JSON.stringify(embedding),
    },
  });

  return {
    id: resume.id,
    name: resume.name,
    rawText: resume.rawText,
    structuredData: resume.structuredData ? JSON.parse(resume.structuredData) : null,
  };
}

export async function listResumes() {
  const rows = await prisma.resume.findMany({
    select: { id: true, name: true, rawText: true, structuredData: true, createdAt: true },
  });
  return rows.map((r) => ({
    ...r,
    structuredData: r.structuredData ? JSON.parse(r.structuredData) : null,
  }));
}

export async function getResume(id: string) {
  const r = await prisma.resume.findUniqueOrThrow({
    where: { id },
    select: { id: true, name: true, rawText: true, structuredData: true, createdAt: true },
  });
  return { ...r, structuredData: r.structuredData ? JSON.parse(r.structuredData) : null };
}
