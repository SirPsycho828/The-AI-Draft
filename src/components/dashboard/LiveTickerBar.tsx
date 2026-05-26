import { useMemo } from 'react';
import type { MoveEvent, MoveType, Person } from '../../types';

interface LiveTickerBarProps {
  events: MoveEvent[];
  people: Map<string, Person>;
}

const MOVE_TYPE_META: Record<MoveType, { label: string; colorClass: string; dotClass: string }> = {
  departure: { label: 'DEPARTURE', colorClass: 'text-move-departure', dotClass: 'bg-move-departure' },
  new_hire: { label: 'NEW HIRE', colorClass: 'text-move-new-hire', dotClass: 'bg-move-new-hire' },
  founded_startup: { label: 'FOUNDED', colorClass: 'text-move-founded', dotClass: 'bg-move-founded' },
  went_academic: { label: 'ACADEMIC', colorClass: 'text-move-academic', dotClass: 'bg-move-academic' },
  returned: { label: 'RETURNED', colorClass: 'text-move-returned', dotClass: 'bg-move-returned' },
  role_change: { label: 'ROLE CHG', colorClass: 'text-move-role-change', dotClass: 'bg-move-role-change' },
};

function orgText(event: MoveEvent): string {
  switch (event.type) {
    case 'founded_startup':
      return `founded ${event.toOrg ?? 'a startup'}`;
    case 'departure':
      return event.toOrg ? `${event.fromOrg} → ${event.toOrg}` : `left ${event.fromOrg}`;
    case 'went_academic':
      return event.toOrg ? `joined ${event.toOrg}` : 'moved to academia';
    default:
      return [event.fromOrg, event.toOrg].filter(Boolean).join(' → ');
  }
}

export function LiveTickerBar({ events, people }: LiveTickerBarProps) {
  const tickerItems = useMemo(() => {
    return events.slice(0, 8).map((e) => {
      const person = people.get(e.personId);
      const meta = MOVE_TYPE_META[e.type];
      return {
        id: e.id,
        label: meta.label,
        colorClass: meta.colorClass,
        dotClass: meta.dotClass,
        personName: person?.name ?? 'Unknown',
        org: orgText(e),
      };
    });
  }, [events, people]);

  if (tickerItems.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...tickerItems, ...tickerItems];

  return (
    <div className="overflow-hidden border-y border-border bg-card/50 py-2.5">
      <div className="animate-ticker flex whitespace-nowrap gap-10 hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center gap-2 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass} shrink-0`} />
            <span className={`font-body text-[0.625rem] font-700 tracking-[0.06em] uppercase ${item.colorClass}`}>
              {item.label}
            </span>
            <span className="text-foreground text-xs font-body font-600">
              {item.personName}
            </span>
            <span className="text-muted-foreground text-xs font-body">
              {item.org}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
