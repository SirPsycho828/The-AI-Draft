import { useEffect, useState, useMemo } from 'react';
import { useMoveEvents } from '../hooks/useMoveEvents';
import { subscribePeople } from '../services/firestore';
import { MoveEventFeed } from '../components/dashboard/MoveEventFeed';
import { FilterSidebar, type Filters } from '../components/dashboard/FilterSidebar';
import { StatsBar } from '../components/dashboard/StatsBar';
import type { Person } from '../types';

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    types: [],
    confidences: [],
    tiers: [],
    company: '',
  });

  const { events, loading } = useMoveEvents({ status: 'published', maxResults: 100 });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    return subscribePeople(setPeople);
  }, []);

  const peopleMap = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filters.types.length > 0 && !filters.types.includes(e.type)) return false;
      if (filters.confidences.length > 0 && !filters.confidences.includes(e.confidence)) return false;
      if (filters.company) {
        if (e.fromOrg !== filters.company && e.toOrg !== filters.company) return false;
      }
      if (filters.tiers.length > 0) {
        const person = peopleMap.get(e.personId);
        if (!person || !filters.tiers.includes(person.tier)) return false;
      }
      return true;
    });
  }, [events, filters, peopleMap]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (e.fromOrg) set.add(e.fromOrg);
      if (e.toOrg) set.add(e.toOrg);
    }
    return [...set].sort();
  }, [events]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} companies={companies} />
        <div className="flex-1 min-w-0">
          <MoveEventFeed events={filteredEvents} people={peopleMap} loading={loading} />
          <StatsBar events={events} totalPeople={people.length} />
        </div>
      </div>
    </div>
  );
}
