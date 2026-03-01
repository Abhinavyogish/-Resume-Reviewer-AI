import { createEmbedding as openRouterEmbedding } from './openrouter.client.js';
import { normalizeText } from '../utils/text.utils.js';

export async function generateEmbedding(text: string): Promise<number[]> {
  const normalized = normalizeText(text);
  if (!normalized.trim()) {
    throw new Error('Cannot embed empty text');
  }
  return openRouterEmbedding(normalized);
}
