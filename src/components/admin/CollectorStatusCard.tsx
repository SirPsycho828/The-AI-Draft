import { useState } from 'react';
import type { CollectorConfig } from '../../types';
import { triggerCollector } from '../../services/firestore';

const TRIGGERABLE = ['semantic_scholar', 'github', 'news', 'linkedin', 'x'];
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium capitalize">{name.replace(/_/g, ' ')}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            config.enabled
              ? 'bg-green-500/10 text-green-400'
              : 'bg-gray-500/10 text-gray-500'
          }`}
        >
          {config.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>Schedule: {config.cronSchedule}</p>
        <p>Last run: {lastRun}</p>
        {config.lastRunStatus && (
          <p>
            Status:{' '}
            <span className={config.lastRunStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
              {config.lastRunStatus}
            </span>
          </p>
        )}
        {result && (
          <p className={result.startsWith('Error') ? 'text-red-400' : 'text-blue-400'}>{result}</p>
        )}
      </div>
      {canTrigger && (
        <button
          onClick={handleRunNow}
          disabled={running}
          className={`mt-3 w-full text-xs px-3 py-1.5 rounded-lg disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors ${
            PAID.includes(name)
              ? 'bg-amber-600 hover:bg-amber-500'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {running ? 'Running...' : PAID.includes(name) ? 'Run Now (paid)' : 'Run Now'}
        </button>
      )}
    </div>
  );
}
