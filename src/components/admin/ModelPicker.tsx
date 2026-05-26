import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { AppConfig } from '../../types';
import { updateConfig } from '../../services/firestore';
import { fetchOpenRouterModels } from '../../services/openrouter';

interface Props {
  config: AppConfig;
}

export function ModelPicker({ config }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleRefreshModels = async () => {
    const key = apiKey.trim();
    if (!key) {
      setError('Enter your OpenRouter API key first.');
      return;
    }
    setRefreshing(true);
    setError('');
    try {
      const models = await fetchOpenRouterModels(key);
      await updateConfig({
        openrouter: {
          ...config.openrouter,
          availableModels: models,
          lastModelRefresh: Timestamp.now(),
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch models');
    }
    setRefreshing(false);
  };

  const handleSelectModel = async (modelId: string) => {
    await updateConfig({
      openrouter: {
        ...config.openrouter,
        activeModel: modelId,
      },
    });
  };

  const activeModel = config.openrouter.availableModels.find(
    (m) => m.id === config.openrouter.activeModel
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">OpenRouter Configuration</h3>

      <div>
        <label className="block text-sm text-gray-400 mb-1">API Key</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleRefreshModels}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {refreshing ? 'Loading...' : 'Refresh Models'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Key is used client-side to fetch the model list. Functions use the key stored in Secret Manager.
        </p>
      </div>

      {activeModel && (
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-400">Active Model</p>
          <p className="font-medium">{activeModel.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Prompt: ${activeModel.pricing.prompt}/token | Completion: ${activeModel.pricing.completion}/token | Context: {activeModel.context_length.toLocaleString()}
          </p>
        </div>
      )}

      {config.openrouter.availableModels.length > 0 && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Select Model</label>
          <select
            value={config.openrouter.activeModel}
            onChange={(e) => handleSelectModel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            {config.openrouter.availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (${m.pricing.prompt}/tok)
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {config.openrouter.availableModels.length} models available.
            {config.openrouter.lastModelRefresh && (
              <> Last refreshed: {new Date(config.openrouter.lastModelRefresh.seconds * 1000).toLocaleString()}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
