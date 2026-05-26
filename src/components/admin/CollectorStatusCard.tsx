import type { CollectorConfig } from '../../types';

interface Props {
  name: string;
  config: CollectorConfig;
}

export function CollectorStatusCard({ name, config }: Props) {
  const lastRun = config.lastRunAt
    ? new Date(config.lastRunAt.seconds * 1000).toLocaleString()
    : 'Never';

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
      </div>
    </div>
  );
}
