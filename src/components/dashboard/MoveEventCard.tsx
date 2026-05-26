import { Link } from 'react-router-dom';
import type { MoveEvent, Person } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { timeAgo } from '../../utils/timeAgo';

interface Props {
  event: MoveEvent;
  person?: Person;
}

export function MoveEventCard({ event, person }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MoveTypeBadge type={event.type} />
            <ConfidenceBadge confidence={event.confidence} />
          </div>
          <Link
            to={`/person/${person?.slug ?? event.personId}`}
            className="text-lg font-semibold hover:text-blue-400 transition-colors"
          >
            {person?.name ?? 'Unknown'}
          </Link>
          <div className="mt-1 text-sm text-gray-400">
            {event.fromOrg && <span>{event.fromOrg}</span>}
            {event.fromOrg && event.toOrg && <span className="mx-2">→</span>}
            {event.toOrg && <span>{event.toOrg}</span>}
          </div>
          <p className="mt-3 text-sm text-gray-300 line-clamp-3">{event.aiSummary}</p>
        </div>
        {person?.photoUrl && (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span>{event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}</span>
        <span>{timeAgo(event.detectedAt)}</span>
      </div>
    </div>
  );
}
