const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const CHAT_URL = `${OPENROUTER_BASE}/chat/completions`;
const EMBEDDING_URL = `${OPENROUTER_BASE}/embeddings`;

const DEFAULT_CHAT_MODEL = 'openai/gpt-4o-mini';
const DEFAULT_EMBEDDING_MODEL = 'openai/text-embedding-3-small';

const TIMEOUT_MS = 60_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface EmbeddingOptions {
  model?: string;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        const body = await res.text();
        throw new Error(`OpenRouter API error ${res.status}: ${body}`);
      }
      lastError = new Error(`OpenRouter API error ${res.status}: ${await res.text()}`);
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
      }
    }
  }
  throw lastError ?? new Error('Unknown OpenRouter error');
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key?.trim()) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }
  return key;
}

export async function sendChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const { model = DEFAULT_CHAT_MODEL, temperature = 0.3, maxTokens = 4096 } = options;
  const res = await fetchWithRetry(
    CHAT_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
        'HTTP-Referer': process.env.API_BASE_URL ?? 'http://localhost:3001',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    }
  );

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (json.error) {
    throw new Error(`OpenRouter error: ${json.error.message ?? JSON.stringify(json.error)}`);
  }

  const content = json.choices?.[0]?.message?.content;
  if (content == null) {
    throw new Error('OpenRouter returned empty response');
  }
  return content;
}

export async function createEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  const { model = DEFAULT_EMBEDDING_MODEL } = options;
  const res = await fetchWithRetry(
    EMBEDDING_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model,
        input: text.slice(0, 8192),
      }),
    }
  );

  const json = (await res.json()) as {
    data?: Array<{ embedding?: number[] }>;
    error?: { message?: string };
  };

  if (json.error) {
    throw new Error(`OpenRouter embedding error: ${json.error.message ?? JSON.stringify(json.error)}`);
  }

  const embedding = json.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) {
    throw new Error('OpenRouter returned invalid embedding');
  }
  return embedding;
}
