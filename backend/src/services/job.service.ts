import { prisma } from '../db/prisma.js';
import { extractJobRequirements } from '../ai/extraction.service.js';
import { generateEmbedding } from '../ai/embedding.service.js';

export async function createJob(title: string, description: string) {
  const [requirements, embedding] = await Promise.all([
    extractJobRequirements(title, description),
    generateEmbedding(description),
  ]);

  const job = await prisma.jobDescription.create({
    data: {
      title,
      description,
      embedding: JSON.stringify(embedding),
      structuredRequirements: JSON.stringify(requirements),
    },
  });

  return {
    ...job,
    structuredRequirements: job.structuredRequirements ? JSON.parse(job.structuredRequirements) : null,
  };
}

export async function listJobs() {
  const rows = await prisma.jobDescription.findMany({
    select: { id: true, title: true, description: true, structuredRequirements: true, createdAt: true },
  });
  return rows.map((r) => ({
    ...r,
    structuredRequirements: r.structuredRequirements ? JSON.parse(r.structuredRequirements) : null,
  }));
}

export async function getJob(id: string) {
  const r = await prisma.jobDescription.findUniqueOrThrow({
    where: { id },
    select: { id: true, title: true, description: true, structuredRequirements: true, createdAt: true },
  });
  return { ...r, structuredRequirements: r.structuredRequirements ? JSON.parse(r.structuredRequirements) : null };
}

export async function deleteJob(id: string) {
  await prisma.jobDescription.delete({ where: { id } });
}
