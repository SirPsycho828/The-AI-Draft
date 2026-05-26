import { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { MoveEvent, MoveType } from '../../types';

interface CommandStatsBarProps {
  events: MoveEvent[];
  totalPeople: number;
}

const springConfig = { stiffness: 300, damping: 30 };

function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, springConfig);
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

const MOVE_TYPE_COLORS: Record<MoveType, string> = {
  departure: 'bg-move-departure',
  new_hire: 'bg-move-new-hire',
  founded_startup: 'bg-move-founded',
  went_academic: 'bg-move-academic',
  returned: 'bg-move-returned',
  role_change: 'bg-move-role-change',
};

export function CommandStatsBar({ events, totalPeople }: CommandStatsBarProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());

  useEffect(() => {
    if (events.length > 0) {
      setLastEventTime(Date.now());
      setSecondsAgo(0);
    }
  }, [events]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastEventTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastEventTime]);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 86_400_000;

    const weekEvents = events.filter(
      (e) => now - e.detectedAt.toDate().getTime() < weekMs
    );

    const typeCounts = new Map<MoveType, number>();
    for (const e of weekEvents) {
      typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
    }

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

    return {
      movesThisWeek: weekEvents.length,
      typeCounts,
      weekTotal: weekEvents.length,
      topCompany,
      topCount,
    };
  }, [events]);

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  };

  return (
    <div className="bg-card/80 border-b border-border px-4 sm:px-6 py-2.5 flex items-center gap-4 sm:gap-6 overflow-x-auto text-nowrap">
      {/* LIVE pulse */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-[0.625rem] font-700 tracking-[0.1em] uppercase text-success">
          LIVE
        </span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Total tracked */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-heading text-base text-foreground">
          <AnimatedCounter value={totalPeople} />
        </span>
        <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">
          tracked
        </span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Moves this week */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-heading text-base text-foreground">
          <AnimatedCounter value={stats.movesThisWeek} />
        </span>
        <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">
          this week
        </span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Move type breakdown bars */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">
          types
        </span>
        <div className="flex h-3 w-24 rounded-[var(--radius-sm)] overflow-hidden bg-secondary">
          {stats.weekTotal > 0 &&
            (Object.entries(MOVE_TYPE_COLORS) as [MoveType, string][]).map(([type, colorClass]) => {
              const count = stats.typeCounts.get(type) ?? 0;
              if (count === 0) return null;
              const pct = (count / stats.weekTotal) * 100;
              return (
                <div
                  key={type}
                  className={`${colorClass} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                  title={`${type.replace('_', ' ')}: ${count}`}
                />
              );
            })}
        </div>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Last updated */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">
          updated
        </span>
        <span className="font-heading text-sm text-foreground tabular-nums">
          {formatTime(secondsAgo)}
        </span>
      </div>

      {/* Most active company */}
      {stats.topCompany && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground">
              most active
            </span>
            <span className="text-[0.8125rem] font-600 text-accent">
              {stats.topCompany}
            </span>
            <span className="text-[0.625rem] text-muted-foreground">
              ({stats.topCount})
            </span>
          </div>
        </>
      )}
    </div>
  );
}
