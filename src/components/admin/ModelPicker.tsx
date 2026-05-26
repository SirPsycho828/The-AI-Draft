import { useState, useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { AppConfig, OpenRouterModel } from '../../types';
import { updateConfig } from '../../services/firestore';
import { fetchOpenRouterModels } from '../../services/openrouter';

interface Props {
  config: AppConfig;
}

function formatPrice(price: string): string {
  const n = parseFloat(price);
  if (n === 0) return 'Free';
  const perMillion = n * 1_000_000;
  if (perMillion < 0.01) return '<$0.01/M';
  return `$${perMillion.toFixed(2)}/M`;
}

function formatContext(ctx: number): string {
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(1)}M`;
  return `${Math.round(ctx / 1000)}K`;
}

export function ModelPicker({ config }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const favorites = config.openrouter.favoriteModelIds ?? [];
  const models = config.openrouter.availableModels ?? [];
  const activeModel = models.find((m) => m.id === config.openrouter.activeModel);

  const handleRefreshModels = async () => {
    const key = apiKey.trim();
    if (!key) {
      setError('Enter your OpenRouter API key first.');
      return;
    }
    setRefreshing(true);
    setError('');
    setSuccess('');
    try {
      const fetched = await fetchOpenRouterModels(key);
      await updateConfig({
        openrouter: {
          ...config.openrouter,
          availableModels: fetched,
          lastModelRefresh: Timestamp.now(),
        },
      });
      setSuccess(`${fetched.length} models loaded`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch models');
    }
    setRefreshing(false);
  };

  const handleSelectModel = async (modelId: string) => {
    await updateConfig({
      openrouter: { ...config.openrouter, activeModel: modelId },
    });
  };

  const toggleFavorite = async (modelId: string) => {
    const next = favorites.includes(modelId)
      ? favorites.filter((id) => id !== modelId)
      : [...favorites, modelId];
    await updateConfig({
      openrouter: { ...config.openrouter, favoriteModelIds: next },
    });
  };

  const filtered = useMemo(() => {
    if (!filter) return models;
    const q = filter.toLowerCase();
    return models.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    );
  }, [models, filter]);

  const favoriteModels = useMemo(
    () => filtered.filter((m) => favorites.includes(m.id)),
    [filtered, favorites]
  );
  const freeModels = useMemo(
    () => filtered.filter((m) => m.pricing.prompt === '0' && !favorites.includes(m.id)),
    [filtered, favorites]
  );
  const paidModels = useMemo(
    () => filtered.filter((m) => m.pricing.prompt !== '0' && !favorites.includes(m.id)),
    [filtered, favorites]
  );

  return (
    <div className="space-y-6">
      {/* API Key */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
        <h3 className="text-[0.6875rem] font-700 tracking-[0.08em] uppercase text-muted-foreground mb-3">
          API Key
        </h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              className="w-full bg-secondary border border-border rounded-[var(--radius-md)] px-3 py-2.5 pr-10 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors duration-[var(--duration-fast)] placeholder-muted-foreground/60"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              {showKey ? '\u25C9' : '\u25CB'}
            </button>
          </div>
          <button
            onClick={handleRefreshModels}
            disabled={refreshing}
            className="bg-primary text-primary-foreground disabled:opacity-50 px-4 py-2.5 rounded-[var(--radius-md)] text-[0.8125rem] font-700 tracking-[0.06em] uppercase hover:brightness-110 transition-all duration-[var(--duration-fast)] whitespace-nowrap"
          >
            {refreshing ? 'Loading...' : 'Refresh Models'}
          </button>
        </div>
        {error && <p className="text-destructive text-xs mt-2">{error}</p>}
        {success && <p className="text-success text-xs mt-2">{success}</p>}
        <p className="text-xs text-muted-foreground/60 mt-2">
          Used client-side to fetch models. The AI Brain uses the key stored in Secret Manager.
        </p>
      </div>

      {/* Active Model */}
      {activeModel && (
        <div className="bg-card border border-primary/30 rounded-[var(--radius-lg)] p-5">
          <p className="text-[0.625rem] font-700 tracking-[0.08em] uppercase text-primary mb-1">
            Active Model
          </p>
          <p className="text-lg font-600 text-foreground">{activeModel.name}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{activeModel.id}</p>
          <div className="flex gap-4 mt-2 text-xs text-card-foreground">
            <span>Prompt: {formatPrice(activeModel.pricing.prompt)}</span>
            <span>Completion: {formatPrice(activeModel.pricing.completion)}</span>
            <span>Context: {formatContext(activeModel.context_length)}</span>
          </div>
        </div>
      )}

      {/* Model List */}
      {models.length > 0 && (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[0.6875rem] font-700 tracking-[0.08em] uppercase text-muted-foreground">
                Select Model
              </h3>
              <span className="text-xs text-muted-foreground/60">
                {models.length} models
                {config.openrouter.lastModelRefresh && (
                  <> &middot; {new Date(config.openrouter.lastModelRefresh.seconds * 1000).toLocaleDateString()}</>
                )}
              </span>
            </div>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter models..."
              className="w-full bg-secondary border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors duration-[var(--duration-fast)] placeholder-muted-foreground/60"
            />
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {favoriteModels.length > 0 && (
              <>
                <div className="sticky top-0 z-10 bg-tier-legendary/10 px-4 py-1.5 text-[0.625rem] font-700 tracking-[0.08em] uppercase text-tier-legendary border-b border-tier-legendary/20">
                  Favorites
                </div>
                {favoriteModels.map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    isActive={m.id === config.openrouter.activeModel}
                    isFavorite={true}
                    onSelect={handleSelectModel}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </>
            )}

            {freeModels.length > 0 && (
              <>
                <div className="sticky top-0 z-10 bg-success/10 px-4 py-1.5 text-[0.625rem] font-700 tracking-[0.08em] uppercase text-success border-b border-success/20">
                  Free Models
                </div>
                {freeModels.map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    isActive={m.id === config.openrouter.activeModel}
                    isFavorite={false}
                    onSelect={handleSelectModel}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </>
            )}

            {paidModels.length > 0 && (
              <>
                <div className="sticky top-0 z-10 bg-secondary px-4 py-1.5 text-[0.625rem] font-700 tracking-[0.08em] uppercase text-muted-foreground border-b border-border">
                  Paid Models
                </div>
                {paidModels.map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    isActive={m.id === config.openrouter.activeModel}
                    isFavorite={false}
                    onSelect={handleSelectModel}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </>
            )}

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No models match &ldquo;{filter}&rdquo;</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelRow({
  model,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  model: OpenRouterModel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const isFree = model.pricing.prompt === '0';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/50 hover:bg-secondary/50 transition-colors duration-[var(--duration-fast)] ${
        isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      }`}
    >
      <button
        onClick={() => onToggleFavorite(model.id)}
        className={`text-lg shrink-0 transition-colors duration-[var(--duration-fast)] ${isFavorite ? 'text-tier-legendary' : 'text-border hover:text-muted-foreground'}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? '\u2605' : '\u2606'}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-500 truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {model.name}
        </p>
        <p className="text-xs text-muted-foreground/60 truncate font-mono">{model.id}</p>
      </div>

      <span className={`text-xs px-2 py-0.5 rounded-[var(--radius-sm)] shrink-0 ${
        isFree ? 'bg-success/10 text-success' : 'text-muted-foreground'
      }`}>
        {formatPrice(model.pricing.prompt)}
      </span>

      <span className="text-xs text-muted-foreground/60 w-14 text-right shrink-0">
        {formatContext(model.context_length)}
      </span>

      <button
        onClick={() => onSelect(model.id)}
        disabled={isActive}
        className={`text-xs px-3 py-1 rounded-[var(--radius-md)] shrink-0 transition-all duration-[var(--duration-fast)] ${
          isActive
            ? 'bg-primary/20 text-primary cursor-default'
            : 'bg-secondary hover:bg-muted text-card-foreground'
        }`}
      >
        {isActive ? '\u2713 Active' : 'Use'}
      </button>
    </div>
  );
}
