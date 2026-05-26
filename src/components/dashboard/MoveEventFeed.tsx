import type { MoveEvent, Person } from '../../types';
import { MoveEventCard } from './MoveEventCard';

interface Props {
  events: MoveEvent[];
  people: Map<string, Person>;
  loading: boolean;
}

export function MoveEventFeed({ events, people, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
            <div className="h-5 bg-gray-800 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-32 mb-3" />
            <div className="h-12 bg-gray-800 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No moves detected yet.</p>
        <p className="mt-1 text-sm">Check back soon — collectors are scanning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <MoveEventCard
          key={event.id}
          event={event}
          person={people.get(event.personId)}
        />
      ))}
    </div>
  );
}
