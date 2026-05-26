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
    <div className="bg-card/80 border-t border-border px-6 py-3 flex items-center gap-6 overflow-x-auto">
      {/* LIVE indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-[0.625rem] font-700 tracking-[0.1em] uppercase text-success">LIVE</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-heading text-base text-foreground">{stats.totalPeople}</span>
        <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">tracked</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-heading text-base text-foreground">{stats.movesThisWeek}</span>
        <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">this week</span>
      </div>

      {stats.topCompany && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">most active:</span>
            <span className="text-[0.8125rem] font-600 text-accent">{stats.topCompany}</span>
            <span className="text-[0.625rem] text-muted-foreground">({stats.topCount})</span>
          </div>
        </>
      )}

      {stats.legendaryToday > 0 && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-heading text-base text-tier-legendary">{stats.legendaryToday}</span>
            <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-tier-legendary">
              legendary today
            </span>
          </div>
        </>
      )}
    </div>
  );
}
