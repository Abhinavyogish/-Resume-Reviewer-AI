import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { authPlugin } from './plugins/auth.plugin.js';
import { resumeRoutes } from './routes/resume.routes.js';
import { jobRoutes } from './routes/job.routes.js';
import { rankingRoutes } from './routes/ranking.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  await app.register(cors, { origin: true });
  await app.register(authPlugin);
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
    attachFieldsToBody: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(resumeRoutes);
  await app.register(jobRoutes, { prefix: '' });
  await app.register(rankingRoutes, { prefix: '' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
