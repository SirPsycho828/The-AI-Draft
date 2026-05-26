import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMoveEvents } from '../hooks/useMoveEvents';
import { subscribePeople } from '../services/firestore';
import { MoveEventFeed } from '../components/dashboard/MoveEventFeed';
import { FilterSidebar, type Filters } from '../components/dashboard/FilterSidebar';
import { StatsBar } from '../components/dashboard/StatsBar';
import { TierBadge } from '../components/common/TierBadge';
import type { Person } from '../types';

const TIER_ORDER = { legendary: 0, senior: 1, notable: 2, emerging: 3 } as const;

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
    for (const p of people) {
      if (p.currentOrg) set.add(p.currentOrg);
    }
    for (const e of events) {
      if (e.fromOrg) set.add(e.fromOrg);
      if (e.toOrg) set.add(e.toOrg);
    }
    return [...set].sort();
  }, [events, people]);

  const filteredPeople = useMemo(() => {
    let result = [...people];
    if (filters.tiers.length > 0) {
      result = result.filter((p) => filters.tiers.includes(p.tier));
    }
    if (filters.company) {
      result = result.filter((p) => p.currentOrg === filters.company || p.previousOrgs?.includes(filters.company));
    }
    return result.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.name.localeCompare(b.name));
  }, [people, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} companies={companies} />
        <div className="flex-1 min-w-0">
          <MoveEventFeed events={filteredEvents} people={peopleMap} loading={loading} />
          <StatsBar events={events} totalPeople={people.length} />

          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Tracked People ({filteredPeople.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPeople.map((person) => (
                <Link
                  key={person.id}
                  to={`/person/${person.slug}`}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{person.name}</p>
                      <p className="text-sm text-gray-400 truncate">{person.currentTitle ?? person.currentOrg}</p>
                      {person.currentTitle && (
                        <p className="text-xs text-gray-500 truncate">{person.currentOrg}</p>
                      )}
                    </div>
                    <TierBadge tier={person.tier} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
