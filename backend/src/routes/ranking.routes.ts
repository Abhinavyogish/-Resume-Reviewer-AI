import { FastifyInstance } from 'fastify';
import { rankCandidates, getSavedRankings } from '../services/ranking.service.js';

export async function rankingRoutes(app: FastifyInstance) {
  app.post<{
    Params: { jobId: string };
    Querystring: { limit?: string };
  }>('/ranking/:jobId', async (req, reply) => {
    try {
      const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit ?? '50', 10) || 50));
      const ranked = await rankCandidates(req.params.jobId, limit);
      return reply.send(ranked);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: err instanceof Error ? err.message : 'Failed to rank candidates',
      });
    }
  });

  app.get<{ Params: { jobId: string } }>('/ranking/:jobId', async (req, reply) => {
    try {
      const ranked = await getSavedRankings(req.params.jobId);
      return reply.send(ranked);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: err instanceof Error ? err.message : 'Failed to get rankings',
      });
    }
  });
}
