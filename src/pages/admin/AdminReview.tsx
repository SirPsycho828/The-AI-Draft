import { useEffect, useState, useMemo } from 'react';
import { useMoveEvents } from '../../hooks/useMoveEvents';
import { subscribePeople } from '../../services/firestore';
import { ReviewCard } from '../../components/admin/ReviewCard';
import type { Person } from '../../types';

export default function AdminReview() {
  const { events, loading } = useMoveEvents({ status: 'pending_review' });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    return subscribePeople(setPeople);
  }, []);

  const peopleMap = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people]
  );

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Review Queue</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No pending reviews. All clear!</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <ReviewCard key={e.id} event={e} person={peopleMap.get(e.personId)} />
          ))}
        </div>
      )}
    </div>
  );
}
