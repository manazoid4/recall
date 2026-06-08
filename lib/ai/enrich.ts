import { getSetting } from '../settings';
import { callLLM } from './providers';

export async function enrichItem(
  item: { title: string | null; url: string; rawData: string | null },
): Promise<{
  summary: string;
  tags: string[];
  sentiment: string;
  topics: string[];
  entities: string[];
  qualityScore: number;
  provider: string;
  model: string;
}> {
  const provider = await getSetting('llm_provider', 'openai');
  const model = await getSetting('llm_model', 'gpt-4o-mini');

  const prompt = `Analyze the following saved content and return a JSON object with:
- summary: 2-3 sentence summary
- tags: 5-8 relevant tags (lowercase, hyphenated)
- sentiment: one of "positive", "neutral", "negative"
- topics: 3-5 main topics
- entities: named entities (people, orgs, products)
- qualityScore: 0-100 score of content quality/informativeness

Title: ${item.title || 'Untitled'}
URL: ${item.url}
Content: ${item.rawData || '(no content available)'}

Return ONLY valid JSON.`;

  const result = await callLLM(prompt, { provider, model, temperature: 0.3, maxTokens: 500 });

  try {
    const jsonStr = result.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return {
      summary: parsed.summary || '',
      tags: parsed.tags || [],
      sentiment: parsed.sentiment || 'neutral',
      topics: parsed.topics || [],
      entities: parsed.entities || [],
      qualityScore: parsed.qualityScore || 50,
      provider,
      model,
    };
  } catch {
    return {
      summary: result.slice(0, 300),
      tags: ['unparsed'],
      sentiment: 'neutral',
      topics: [],
      entities: [],
      qualityScore: 20,
      provider,
      model,
    };
  }
}

export async function enrichBatch(
  items: Array<{ id: string; title: string | null; url: string; rawData: string | null }>,
): Promise<Record<string, Awaited<ReturnType<typeof enrichItem>>>> {
  const results: Record<string, Awaited<ReturnType<typeof enrichItem>>> = {};
  const concurrency = 3;

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const promises = batch.map(async (item) => {
      results[item.id] = await enrichItem(item);
    });
    await Promise.all(promises);
  }

  return results;
}
