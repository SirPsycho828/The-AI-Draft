import type { MoveEvent, Person } from '../types';
import { TIER_ORDER } from './tierOrder';

interface FeaturedResult {
  event: MoveEvent;
  person: Person;
}

export function selectFeaturedPerson(
  events: MoveEvent[],
  people: Map<string, Person>
): FeaturedResult | null {
  const now = Date.now();
  const thirtyDaysMs = 30 * 86_400_000;

  const candidates = events
    .filter((e) => people.has(e.personId))
    .map((e) => ({
      event: e,
      person: people.get(e.personId)!,
      isRecent: now - e.detectedAt.toDate().getTime() < thirtyDaysMs,
    }));

  const recent = candidates.filter((c) => c.isRecent);
  const pool = recent.length > 0 ? recent : candidates;

  pool.sort((a, b) => {
    const tierDiff = TIER_ORDER[a.person.tier] - TIER_ORDER[b.person.tier];
    if (tierDiff !== 0) return tierDiff;
    return b.event.detectedAt.toDate().getTime() - a.event.detectedAt.toDate().getTime();
  });

  return pool[0] ?? null;
}
