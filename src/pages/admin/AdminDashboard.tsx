import { useMoveEvents } from '../../hooks/useMoveEvents';

export default function AdminDashboard() {
  const { events: pending } = useMoveEvents({ status: 'pending_review' });
  const { events: published } = useMoveEvents({ status: 'published', maxResults: 50 });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
          <p className="text-sm text-gray-400 mt-1">Pending Reviews</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-green-400">{published.length}</p>
          <p className="text-sm text-gray-400 mt-1">Published Moves</p>
        </div>
      </div>
    </div>
  );
}
