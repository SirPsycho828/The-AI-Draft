import type { OpenRouterModel } from '../types';

interface OpenRouterApiModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
  const data = await res.json();
  return data.data.map((m: OpenRouterApiModel) => ({
    id: m.id,
    name: m.name,
    pricing: m.pricing,
    context_length: m.context_length,
  }));
}
