import { useState } from 'react';
import type { CollectorConfig } from '../../types';
import { triggerCollector } from '../../services/firestore';

const TRIGGERABLE = ['semantic_scholar', 'github', 'news', 'linkedin', 'x', 'arxiv', 'company_site'];
const PAID = ['linkedin', 'x'];

interface Props {
  name: string;
  config: CollectorConfig;
}

export function CollectorStatusCard({ name, config }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const lastRun = config.lastRunAt
    ? new Date(config.lastRunAt.seconds * 1000).toLocaleString()
    : 'Never';

  const canTrigger = TRIGGERABLE.includes(name);

  async function handleRunNow() {
    setRunning(true);
    setResult(null);
    try {
      const msg = await triggerCollector(name);
      setResult(msg);
    } catch (err: unknown) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-600 text-foreground capitalize">{name.replace(/_/g, ' ')}</h3>
        <span
          className={`text-[0.625rem] font-600 tracking-[0.06em] uppercase px-2 py-0.5 rounded-[var(--radius-sm)] ${
            config.enabled
              ? 'bg-success/10 text-success'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {config.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground space-y-1">
        <p>Schedule: {config.cronSchedule}</p>
        <p>Last run: {lastRun}</p>
        {config.lastRunStatus && (
          <p>
            Status:{' '}
            <span className={config.lastRunStatus === 'success' ? 'text-success' : 'text-destructive'}>
              {config.lastRunStatus}
            </span>
          </p>
        )}
        {result && (
          <p className={result.startsWith('Error') ? 'text-destructive' : 'text-primary'}>{result}</p>
        )}
      </div>
      {canTrigger && (
        <button
          onClick={handleRunNow}
          disabled={running}
          className={`mt-3 w-full text-xs font-600 tracking-[0.06em] uppercase px-3 py-1.5 rounded-[var(--radius-md)] disabled:opacity-50 transition-all duration-[var(--duration-fast)] ${
            PAID.includes(name)
              ? 'bg-accent text-accent-foreground hover:brightness-110'
              : 'bg-primary text-primary-foreground hover:brightness-110'
          }`}
        >
          {running ? 'Running...' : PAID.includes(name) ? 'Run Now (paid)' : 'Run Now'}
        </button>
      )}
    </div>
  );
}
