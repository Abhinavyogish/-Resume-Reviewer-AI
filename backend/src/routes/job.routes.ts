import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createJob, listJobs, getJob, deleteJob } from '../services/job.service.js';

const CreateJobSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
});

export async function jobRoutes(app: FastifyInstance) {
  app.post('/job', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = CreateJobSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }
    try {
      const job = await createJob(body.data.title, body.data.description);
      return reply.status(201).send(job);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: err instanceof Error ? err.message : 'Failed to create job',
      });
    }
  });

  app.get('/job', async (_req, reply) => {
    const jobs = await listJobs();
    return reply.send(jobs);
  });

  app.get<{ Params: { id: string } }>('/job/:id', async (req, reply) => {
    try {
      const job = await getJob(req.params.id);
      return reply.send(job);
    } catch {
      return reply.status(404).send({ error: 'Job not found' });
    }
  });

  app.delete<{ Params: { id: string } }>('/job/:id', async (req, reply) => {
    try {
      await deleteJob(req.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Job not found' });
    }
  });
}
