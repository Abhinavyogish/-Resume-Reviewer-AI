import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  parsePdf,
  parseDocx,
  parseImage,
  createResumeFromText,
  listResumes,
  getResume,
} from '../services/resume.service.js';

export async function resumeRoutes(app: FastifyInstance) {
  app.post('/resume/upload', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as Record<string, { value?: string; toBuffer?: () => Promise<Buffer> }>;
      const filePart = body?.file;
      const namePart = body?.name;

      if (!filePart?.toBuffer) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const buffer = await filePart.toBuffer();
      const name = (typeof namePart?.value === 'string' ? namePart.value : '')?.trim() || 'Untitled';

      const mimetype = (filePart as { mimetype?: string }).mimetype ?? '';
      const filename = (filePart as { filename?: string }).filename ?? '';
      let text: string;

      const ext = filename.toLowerCase().split('.').pop() ?? '';
      if (mimetype.includes('pdf') || ext === 'pdf') {
        text = await parsePdf(buffer);
      } else if (
        mimetype.includes('word') ||
        mimetype.includes('docx') ||
        ext === 'docx'
      ) {
        text = await parseDocx(buffer);
      } else if (
        mimetype.includes('png') ||
        mimetype.includes('jpeg') ||
        mimetype.includes('jpg') ||
        ext === 'png' ||
        ext === 'jpg' ||
        ext === 'jpeg'
      ) {
        text = await parseImage(buffer);
      } else {
        return reply.status(400).send({
          error: 'Unsupported format. Use PDF, DOCX, PNG, or JPG.',
        });
      }

      const resume = await createResumeFromText(text, name);
      return reply.status(201).send(resume);
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        error: err instanceof Error ? err.message : 'Failed to process resume',
      });
    }
  });

  app.get('/resume', async (_req, reply) => {
    const resumes = await listResumes();
    return reply.send(resumes);
  });

  app.get<{ Params: { id: string } }>('/resume/:id', async (req, reply) => {
    try {
      const resume = await getResume(req.params.id);
      return reply.send(resume);
    } catch {
      return reply.status(404).send({ error: 'Resume not found' });
    }
  });
}
