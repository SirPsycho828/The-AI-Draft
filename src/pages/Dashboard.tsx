import { useEffect, useState, useMemo } from 'react';
import { useMoveEvents } from '../hooks/useMoveEvents';
import { subscribePeople } from '../services/firestore';
import {
  HorizontalFilterBar,
  type DashboardFilters,
  type SortMode,
} from '../components/dashboard/HorizontalFilterBar';
import { ExpandableMoveCard } from '../components/dashboard/ExpandableMoveCard';
import { FeaturedPersonHero } from '../components/dashboard/FeaturedPersonHero';
import { PersonRoster } from '../components/dashboard/PersonRoster';
import { StatsFooter } from '../components/dashboard/StatsFooter';
import { hotScore } from '../utils/hotScore';
import { TIER_ORDER } from '../utils/tierOrder';
import { selectFeaturedPerson } from '../utils/selectFeaturedPerson';
import type { Person } from '../types';

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    types: [],
    confidences: [],
    tiers: [],
    company: '',
  });
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const { events, loading } = useMoveEvents({ status: 'published', maxResults: 100 });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    return subscribePeople(setPeople);
  }, []);

  const peopleMap = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people]
  );

  // Filtered events
  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => {
      if (filters.types.length > 0 && !filters.types.includes(e.type)) return false;
      if (filters.confidences.length > 0 && !filters.confidences.includes(e.confidence))
        return false;
      if (filters.company) {
        if (e.fromOrg !== filters.company && e.toOrg !== filters.company) return false;
      }
      if (filters.tiers.length > 0) {
        const person = peopleMap.get(e.personId);
        if (!person || !filters.tiers.includes(person.tier)) return false;
      }
      return true;
    });

    // Sort
    if (sortMode === 'hottest') {
      result = [...result].sort((a, b) => {
        const personA = peopleMap.get(a.personId);
        const personB = peopleMap.get(b.personId);
        const scoreA = hotScore(
          personA?.tier ?? 'emerging',
          a.confidence,
          a.detectedAt
        );
        const scoreB = hotScore(
          personB?.tier ?? 'emerging',
          b.confidence,
          b.detectedAt
        );
        return scoreB - scoreA;
      });
    }
    // 'recent' is already sorted by detectedAt desc from the Firestore query

    return result;
  }, [events, filters, peopleMap, sortMode]);

  // Companies for dropdown
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

  // Filtered people for roster
  const filteredPeople = useMemo(() => {
    let result = [...people];
    if (filters.tiers.length > 0) {
      result = result.filter((p) => filters.tiers.includes(p.tier));
    }
    if (filters.company) {
      result = result.filter(
        (p) =>
          p.currentOrg === filters.company ||
          p.previousOrgs?.includes(filters.company)
      );
    }
    return result.sort(
      (a, b) =>
        TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.name.localeCompare(b.name)
    );
  }, [people, filters]);

  // Featured person ID (to exclude from roster)
  const featuredPersonId = useMemo(
    () => selectFeaturedPerson(events, peopleMap)?.person.id,
    [events, peopleMap]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-64px)]">
      {/* Filter bar */}
      <HorizontalFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        sortMode={sortMode}
        onSortChange={setSortMode}
        companies={companies}
      />

      {/* Split view */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 flex-1 min-h-0">
        {/* Left column: Feed */}
        <div className="w-full lg:w-3/5 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                    <div className="h-3 bg-gray-800 rounded w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No moves found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <ExpandableMoveCard
                key={event.id}
                event={event}
                person={peopleMap.get(event.personId)}
              />
            ))
          )}
        </div>

        {/* Right column: Spotlight — below feed on mobile, beside it on desktop */}
        <div className="w-full lg:w-2/5 overflow-y-auto pl-0 lg:pl-1 mt-6 lg:mt-0">
          <FeaturedPersonHero events={events} people={peopleMap} />
          <PersonRoster
            people={filteredPeople}
            excludePersonId={featuredPersonId}
          />
        </div>
      </div>

      {/* Stats footer */}
      <div className="mt-6 -mx-4 rounded-none">
        <StatsFooter
          events={events}
          people={peopleMap}
          totalPeople={people.length}
        />
      </div>
    </div>
  );
}
