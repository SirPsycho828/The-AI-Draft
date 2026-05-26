import type { MoveEvent } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

export function MoveTimeline({ events }: { events: MoveEvent[] }) {
  if (events.length === 0) {
    return <p className="text-gray-500">No moves detected yet.</p>;
  }

  return (
    <div className="space-y-6">
      {events.map((event, i) => (
        <div key={event.id} className="relative pl-8">
          {i < events.length - 1 && (
            <div className="absolute left-[11px] top-8 bottom-0 w-px bg-gray-800" />
          )}
          <div className="absolute left-1 top-2 w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-600" />

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MoveTypeBadge type={event.type} />
              <ConfidenceBadge confidence={event.confidence} />
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(event.detectedAt.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {event.fromOrg && <span>{event.fromOrg}</span>}
              {event.fromOrg && event.toOrg && <span className="mx-2">→</span>}
              {event.toOrg && <span>{event.toOrg}</span>}
            </div>
            <p className="text-sm text-gray-300">{event.aiSummary}</p>
            {event.signals.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                  {event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}
                </summary>
                <ul className="mt-2 space-y-1">
                  {event.signals.map((s, j) => (
                    <li key={j} className="text-xs text-gray-500">
                      [{s.source}] {s.description}
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
