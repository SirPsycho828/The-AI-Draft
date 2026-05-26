import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPersonBySlug, getMoveEventsForPerson } from '../services/firestore';
import { PersonHeader } from '../components/person/PersonHeader';
import { SourceLinks } from '../components/person/SourceLinks';
import { MoveTimeline } from '../components/person/MoveTimeline';
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
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-800 rounded w-48" />
            <div className="h-4 bg-gray-800 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Person not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <PersonHeader person={person} />
      <SourceLinks sources={person.sources} />
      <div>
        <h2 className="text-xl font-semibold mb-4">Move History</h2>
        <MoveTimeline events={events} />
      </div>
    </div>
  );
}
