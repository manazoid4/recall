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
  google: 'https://generativelanguage.googleapis.com/vbeta/models',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  together: 'https://api.together.xyz/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cohere: 'https://api.cohere.ai/v1/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

const FETCH_TIMEOUT_MS = 30_000;

function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

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

// Block private IPs, localhost (except for Ollama dev), link-local, and cloud metadata
function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Allow localhost and 127.0.0.1 for local Ollama development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return false;
    }

    // Block IPv6 localhost
    if (hostname === '::1' || hostname === '0:0:0:0:0:0:0:1') {
      return true;
    }

    // Block link-local (169.254.x.x) - includes AWS, GCP, Azure metadata
    if (hostname.startsWith('169.254.')) {
      return true;
    }

    // Block private Class A (10.0.0.0/8)
    if (hostname.startsWith('10.')) {
      return true;
    }

    // Block private Class C (192.168.0.0/16)
    if (hostname.startsWith('192.168.')) {
      return true;
    }

    // Block private Class B (172.16.0.0/12)
    if (hostname.startsWith('172.')) {
      const second = parseInt(hostname.split('.')[1], 10);
      if (second >= 16 && second <= 31) {
        return true;
      }
    }

    // Block cloud metadata hostnames
    if (
      hostname === 'metadata.google.internal' ||
      hostname.includes('169.254.169.254') ||
      hostname === 'metadata.internal' ||
      hostname === 'kubernetes.default.svc'
    ) {
      return true;
    }

    // Block internal/private hostnames that could resolve to private IPs
    const lowerHostname = hostname.toLowerCase();
    if (
      lowerHostname.includes('internal') ||
      lowerHostname.includes('private') ||
      lowerHostname.includes('intranet') ||
      lowerHostname.includes('lan') ||
      lowerHostname.includes('localnetwork')
    ) {
      return true;
    }

    return false;
  } catch {
    // Invalid URLs are blocked
    return true;
  }
}

async function callOllama(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const baseUrl = await getSetting('ollama_url', 'http://localhost:11434');

  // SSRF protection: validate URL before making request
  if (isBlockedUrl(baseUrl)) {
    throw new Error(
      'Ollama URL is blocked for security reasons. Only localhost URLs are allowed.'
    );
  }

  const res = await fetchWithTimeout(`${baseUrl}/api/generate`, {
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
  if (typeof data?.response !== 'string') throw new Error('Ollama: unexpected response shape');
  return data.response;
}

async function callAnthropic(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
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
  const text = data?.content?.[0]?.text;
  if (typeof text !== 'string') throw new Error('Anthropic: unexpected response shape');
  return text;
}

async function callGoogle(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${apiKey}`;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: opts.temperature, maxOutputTokens: opts.maxTokens },
    }),
  });
  if (!res.ok) throw new Error(`Google error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') throw new Error('Google: unexpected response shape');
  return text;
}

async function callCohere(
  prompt: string,
  opts: { model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const res = await fetchWithTimeout('https://api.cohere.ai/v1/chat', {
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
  if (typeof data?.text !== 'string') throw new Error('Cohere: unexpected response shape');
  return data.text;
}

async function callOpenAICompatible(
  prompt: string,
  opts: { provider: string; model: string; temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = await getSetting('llm_api_key', '');
  const endpoint = PROVIDER_ENDPOINTS[opts.provider];
  if (!endpoint) throw new Error(`Unknown provider: ${opts.provider}`);

  const res = await fetchWithTimeout(endpoint, {
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
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error(`${opts.provider}: unexpected response shape`);
  return content;
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
