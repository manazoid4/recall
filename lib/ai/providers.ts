import { getSetting } from '../settings';

interface CallLLMOptions {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  together: 'https://api.together.xyz/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cohere: 'https://api.cohere.ai/v1/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

export async function callLLM(
  prompt: string,
  options: CallLLMOptions,
): Promise<string> {
  const { provider, model, temperature = 0.3, maxTokens = 1000 } = options;

  if (provider === 'ollama') {
    return callOllama(prompt, { model, temperature, maxTokens });
  }

  if (provider === 'anthropic') {
    return callAnthropic(prompt, { model, temperature, maxTokens });
  }

  if (provider === 'google') {
    return callGoogle(prompt, { model, temperature, maxTokens });
  }

  if (provider === 'cohere') {
    return callCohere(prompt, { model, temperature, maxTokens });
  }

  return callOpenAICompatible(prompt, { provider, model, temperature, maxTokens });
}

async function callOllama(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const baseUrl = await getSetting('ollama_url', 'http://localhost:11434');
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model,
      prompt,
      stream: false,
      options: { temperature: opts.temperature, num_predict: opts.maxTokens },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.response;
}

async function callAnthropic(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callGoogle(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: opts.temperature, maxOutputTokens: opts.maxTokens },
    }),
  });
  if (!res.ok) throw new Error(`Google error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callCohere(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const res = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      message: prompt,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`Cohere error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.text;
}

async function callOpenAICompatible(
  prompt: string,
  opts: { provider: string; model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const endpoint = PROVIDER_ENDPOINTS[opts.provider];
  if (!endpoint) throw new Error(`Unknown provider: ${opts.provider}`);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`${opts.provider} error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function testConnection(
  provider: string,
  model: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await callLLM('Say "ok"', { provider, model, temperature: 0, maxTokens: 5 });
    return { success: result.length > 0 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
