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
      <h1 className="font-heading text-2xl tracking-[0.03em] text-foreground mb-6">REVIEW QUEUE</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : events.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center">
          <p className="font-heading text-lg text-foreground">ALL CLEAR</p>
          <p className="text-sm text-muted-foreground mt-1">No pending reviews.</p>
        </div>
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
