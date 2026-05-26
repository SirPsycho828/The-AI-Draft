import { useMemo } from 'react';
import type { MoveEvent, Person } from '../../types';

interface StatsFooterProps {
  events: MoveEvent[];
  people: Map<string, Person>;
  totalPeople: number;
}

export function StatsFooter({ events, people, totalPeople }: StatsFooterProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 86_400_000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const weekEvents = events.filter(
      (e) => now - e.detectedAt.toDate().getTime() < weekMs
    );

    // Most active company this week
    const companyCounts = new Map<string, number>();
    for (const e of weekEvents) {
      if (e.toOrg) companyCounts.set(e.toOrg, (companyCounts.get(e.toOrg) ?? 0) + 1);
      if (e.fromOrg) companyCounts.set(e.fromOrg, (companyCounts.get(e.fromOrg) ?? 0) + 1);
    }
    let topCompany = '';
    let topCount = 0;
    for (const [name, count] of companyCounts) {
      if (count > topCount) {
        topCompany = name;
        topCount = count;
      }
    }

    // Legendary moves today
    const legendaryToday = events.filter((e) => {
      const person = people.get(e.personId);
      return (
        person?.tier === 'legendary' &&
        e.detectedAt.toDate().getTime() >= todayMs
      );
    }).length;

    return {
      totalPeople,
      movesThisWeek: weekEvents.length,
      topCompany,
      topCount,
      legendaryToday,
    };
  }, [events, people, totalPeople]);

  return (
    <div className="bg-gray-900/50 border-t border-gray-800 px-6 py-3 flex items-center flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
      <span>{stats.totalPeople} people tracked</span>
      <span>{stats.movesThisWeek} moves this week</span>
      {stats.topCompany && (
        <span>
          Most active: {stats.topCompany} ({stats.topCount})
        </span>
      )}
      {stats.legendaryToday > 0 && (
        <span>{stats.legendaryToday} legendary move{stats.legendaryToday !== 1 ? 's' : ''} today</span>
      )}
    </div>
  );
}
