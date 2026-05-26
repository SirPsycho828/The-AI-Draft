import { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Activity } from 'lucide-react';
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
import { CommandStatsBar } from '../components/dashboard/CommandStatsBar';
import { LiveTickerBar } from '../components/dashboard/LiveTickerBar';
import { FeedSkeleton } from '../components/common/Skeleton';
import { hotScore } from '../utils/hotScore';
import { TIER_ORDER } from '../utils/tierOrder';
import { selectFeaturedPerson } from '../utils/selectFeaturedPerson';
import type { Person } from '../types';

const feedContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const feedItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const springConfig = { stiffness: 300, damping: 30 };

function AnimatedFeedCount({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, springConfig);
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

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

    return result;
  }, [events, filters, peopleMap, sortMode]);

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

  const featuredPersonId = useMemo(
    () => selectFeaturedPerson(events, peopleMap)?.person.id,
    [events, peopleMap]
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Command Stats Bar — full width */}
      <CommandStatsBar events={events} totalPeople={people.length} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 flex flex-col flex-1 min-h-0 w-full">
        <HorizontalFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          sortMode={sortMode}
          onSortChange={setSortMode}
          companies={companies}
        />

        {/* Live Ticker Bar */}
        <div className="mt-4 -mx-4 sm:-mx-8">
          <LiveTickerBar events={events} people={peopleMap} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6 flex-1 min-h-0">
          {/* Feed column */}
          <div className="w-full lg:w-3/5 overflow-y-auto pr-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-primary" />
              <h2 className="font-heading text-lg tracking-[0.05em] text-foreground">
                LIVE FEED
              </h2>
              <span className="text-[0.625rem] font-600 tracking-[0.06em] text-muted-foreground">
                (<AnimatedFeedCount value={filteredEvents.length} />)
              </span>
            </div>

            {loading ? (
              <FeedSkeleton count={5} />
            ) : filteredEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center">
                <p className="font-heading text-lg text-foreground">NO MOVES DETECTED</p>
                <p className="text-sm text-muted-foreground mt-1">Adjust your filters to see the latest talent moves</p>
              </div>
            ) : (
              <motion.div
                className="space-y-3"
                initial="hidden"
                animate="show"
                variants={feedContainer}
              >
                {filteredEvents.map((event) => (
                  <motion.div key={event.id} variants={feedItem}>
                    <ExpandableMoveCard
                      event={event}
                      person={peopleMap.get(event.personId)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Spotlight column */}
          <div className="w-full lg:w-2/5 overflow-y-auto pl-0 lg:pl-1 mt-6 lg:mt-0">
            <FeaturedPersonHero events={events} people={peopleMap} />
            <PersonRoster
              people={filteredPeople}
              excludePersonId={featuredPersonId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
