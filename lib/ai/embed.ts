import { getSetting } from '../settings';

export async function embedText(
  texts: string[],
): Promise<{ vectors: number[][]; dimension: number; provider: string }> {
  const provider = await getSetting('llm_provider', 'openai');

  if (provider === 'ollama') {
    return embedOllama(texts);
  }

  if (provider === 'openai') {
    return embedOpenAI(texts);
  }

  return embedFallback(texts);
}

async function embedOpenAI(texts: string[]): Promise<{ vectors: number[][]; dimension: number; provider: string }> {
  const apiKey = await getSetting('llm_api_key', '');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const model = await getSetting('embed_model', 'text-embedding-3-small');

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: texts }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI embed failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const vectors = data.data.map((d: { embedding: number[] }) => d.embedding);
  return { vectors, dimension: vectors[0]?.length || 1536, provider: 'openai' };
}

async function embedOllama(texts: string[]): Promise<{ vectors: number[][]; dimension: number; provider: string }> {
  const model = await getSetting('embed_model', 'nomic-embed-text');
  const baseUrl = await getSetting('ollama_url', 'http://localhost:11434');

  const vectors: number[][] = [];
  for (const text of texts) {
    const res = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
    });

    if (!res.ok) {
      throw new Error(`Ollama embed failed: ${res.status}`);
    }

    const data = await res.json();
    vectors.push(data.embedding);
  }

  return { vectors, dimension: vectors[0]?.length || 768, provider: 'ollama' };
}

async function embedFallback(texts: string[]): Promise<{ vectors: number[][]; dimension: number; provider: string }> {
  const vectors = texts.map(() => {
    const v = new Array(384).fill(0);
    for (let i = 0; i < 384; i++) {
      v[i] = Math.random() * 2 - 1;
    }
    return v;
  });
  return { vectors, dimension: 384, provider: 'fallback' };
}
