import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const API_KEY_HEADER = 'x-api-key';
const AUTH_HEADER = 'authorization';

const PROTECTED_PATHS = ['/resume/upload', '/job'];
const PROTECTED_METHODS = ['POST'];

function isProtectedRoute(url: string, method: string): boolean {
  if (!PROTECTED_METHODS.includes(method)) return false;
  if (PROTECTED_PATHS.some((p) => url === p || url.startsWith(p + '?'))) return true;
  if (/^\/ranking\/[^/]+$/.test(url) && method === 'POST') return true;
  return false;
}

export async function authPlugin(app: FastifyInstance) {
  const secret = process.env.API_SECRET_KEY?.trim();
  if (!secret) return;

  app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!isProtectedRoute(req.url, req.method)) return;
    const key =
      (req.headers[API_KEY_HEADER] as string) ??
      (req.headers[AUTH_HEADER] as string)?.replace(/^Bearer\s+/i, '');
    if (key !== secret) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}
