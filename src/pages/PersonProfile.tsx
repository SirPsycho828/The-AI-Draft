import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPersonBySlug, getMoveEventsForPerson } from '../services/firestore';
import { PersonHeader } from '../components/person/PersonHeader';
import { SourceLinks } from '../components/person/SourceLinks';
import { MoveTimeline } from '../components/person/MoveTimeline';
import { Skeleton } from '../components/common/Skeleton';
import type { Person, MoveEvent } from '../types';

export default function PersonProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [events, setEvents] = useState<MoveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const p = await getPersonBySlug(slug);
      setPerson(p);
      if (p) {
        const e = await getMoveEventsForPerson(p.id);
        setEvents(e);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 animate-pulse">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 text-center">
        <p className="font-heading text-lg text-foreground">PERSON NOT FOUND</p>
        <p className="text-sm text-muted-foreground mt-1">This profile doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      <PersonHeader person={person} />
      <SourceLinks sources={person.sources} />
      <div>
        <h2 className="font-heading text-xl tracking-[0.03em] text-foreground mb-4">MOVE HISTORY</h2>
        <MoveTimeline events={events} />
      </div>
    </div>
  );
}
