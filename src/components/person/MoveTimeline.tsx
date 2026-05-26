import type { MoveEvent, MoveType } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

const DOT_COLOR: Record<MoveType, string> = {
  departure: 'bg-move-departure',
  new_hire: 'bg-move-new-hire',
  founded_startup: 'bg-move-founded',
  went_academic: 'bg-move-academic',
  returned: 'bg-move-returned',
  role_change: 'bg-move-role-change',
};

export function MoveTimeline({ events }: { events: MoveEvent[] }) {
  if (events.length === 0) {
    return <p className="text-muted-foreground">No moves detected yet.</p>;
  }

  return (
    <div className="space-y-6">
      {events.map((event, i) => (
        <div key={event.id} className="relative pl-8">
          {i < events.length - 1 && (
            <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
          )}
          <div className={`absolute left-1 top-2 w-3 h-3 rounded-full ${DOT_COLOR[event.type]} ring-2 ring-background`} />

          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <MoveTypeBadge type={event.type} />
              <ConfidenceBadge confidence={event.confidence} />
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(event.detectedAt.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-card-foreground mb-2">
              {event.fromOrg && <span>{event.fromOrg}</span>}
              {event.fromOrg && event.toOrg && <span className="mx-2 text-muted-foreground">&rarr;</span>}
              {event.toOrg && <span>{event.toOrg}</span>}
            </div>
            <p className="text-sm text-card-foreground">{event.aiSummary}</p>
            {event.signals.length > 0 && (
              <details className="mt-3">
                <summary className="text-[0.625rem] font-600 tracking-[0.06em] uppercase text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  {event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}
                </summary>
                <ul className="mt-2 space-y-1">
                  {event.signals.map((s, j) => (
                    <li key={j} className="text-xs text-muted-foreground">
                      <span className="text-muted-foreground/60">[{s.source}]</span> {s.description}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
