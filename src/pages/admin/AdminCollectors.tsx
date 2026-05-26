import { useState } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { CollectorStatusCard } from '../../components/admin/CollectorStatusCard';
import { triggerCollector } from '../../services/firestore';

const FREE_TRIGGERABLE = ['semantic_scholar', 'github', 'news', 'arxiv', 'company_site'];
const ALL_TRIGGERABLE = ['semantic_scholar', 'github', 'news', 'linkedin', 'x', 'arxiv', 'company_site'];

export default function AdminCollectors() {
  const { config, loading } = useConfig();
  const [runningAll, setRunningAll] = useState(false);
  const [runningFree, setRunningFree] = useState(false);
  const [allResult, setAllResult] = useState<string | null>(null);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const collectors = config?.collectors ?? {};

  async function handleRunAll() {
    setRunningAll(true);
    setAllResult(null);
    try {
      await Promise.all(ALL_TRIGGERABLE.map((name) => triggerCollector(name)));
      setAllResult('All collectors completed (including paid)');
    } catch (err: unknown) {
      setAllResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRunningAll(false);
    }
  }

  async function handleRunFree() {
    setRunningFree(true);
    setAllResult(null);
    try {
      await Promise.all(FREE_TRIGGERABLE.map((name) => triggerCollector(name)));
      setAllResult('Free collectors completed');
    } catch (err: unknown) {
      setAllResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRunningFree(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Collector Status</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRunFree}
            disabled={runningFree || runningAll}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm transition-colors"
          >
            {runningFree ? 'Running...' : 'Run Free'}
          </button>
          <button
            onClick={handleRunAll}
            disabled={runningAll || runningFree}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm transition-colors"
          >
            {runningAll ? 'Running...' : 'Run All (incl. paid)'}
          </button>
        </div>
      </div>
      {allResult && (
        <p className={`mb-4 text-sm ${allResult.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {allResult}
        </p>
      )}
      {Object.keys(collectors).length === 0 ? (
        <p className="text-gray-500">No collectors configured yet. They'll appear here once Cloud Functions are deployed.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(collectors).map(([name, cfg]) => (
            <CollectorStatusCard key={name} name={name} config={cfg} />
          ))}
        </div>
      )}
    </div>
  );
}
