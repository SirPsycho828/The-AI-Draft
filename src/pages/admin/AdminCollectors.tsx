import { useConfig } from '../../hooks/useConfig';
import { CollectorStatusCard } from '../../components/admin/CollectorStatusCard';

export default function AdminCollectors() {
  const { config, loading } = useConfig();

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const collectors = config?.collectors ?? {};

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Collector Status</h1>
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
