import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MoveEvent, Person } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { TierBadge } from '../common/TierBadge';
import { PersonAvatar } from '../common/PersonAvatar';
import { SocialIcons } from '../common/SocialIcons';
import { CareerTrail } from '../common/CareerTrail';
import { timeAgo } from '../../utils/timeAgo';

interface ExpandableMoveCardProps {
  event: MoveEvent;
  person: Person | undefined;
}

function orgLine(event: MoveEvent): string {
  switch (event.type) {
    case 'founded_startup':
      return `Founded ${event.toOrg ?? 'a startup'}`;
    case 'departure':
      return event.toOrg ? `${event.fromOrg} \u2192 ${event.toOrg}` : `Left ${event.fromOrg}`;
    case 'went_academic':
      return event.toOrg ? `Joined ${event.toOrg} (academia)` : 'Moved to academia';
    default:
      return [event.fromOrg, event.toOrg].filter(Boolean).join(' \u2192 ');
  }
}

export function ExpandableMoveCard({ event, person }: ExpandableMoveCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all cursor-pointer"
      onClick={() => setExpanded((prev) => !prev)}
    >
      {/* Collapsed: always visible */}
      <div className="flex items-start gap-3">
        <PersonAvatar
          name={person?.name ?? 'Unknown'}
          photoUrl={person?.photoUrl}
          tier={person?.tier ?? 'emerging'}
          size={expanded ? 'md' : 'md'}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Link
              to={`/person/${person?.slug ?? ''}`}
              className="font-semibold text-white hover:text-blue-400 transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {person?.name ?? 'Unknown Person'}
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <MoveTypeBadge type={event.type} />
              <ConfidenceBadge confidence={event.confidence} />
            </div>
          </div>
          <p className="text-sm text-gray-400">{orgLine(event)}</p>
          {!expanded && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {event.aiSummary}
            </p>
          )}
        </div>
      </div>

      {/* Footer: always visible */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>{event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2">
          <span>{timeAgo(event.detectedAt)}</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Expanded: detail section */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-800 pt-4 space-y-3">
          {person && (
            <div className="flex items-center gap-2">
              <TierBadge tier={person.tier} />
              {person.currentTitle && (
                <span className="text-sm text-gray-400">
                  {person.currentTitle} at {person.currentOrg}
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-gray-300">{event.aiSummary}</p>

          {person && person.previousOrgs.length > 0 && (
            <CareerTrail
              previousOrgs={person.previousOrgs}
              currentOrg={person.currentOrg}
            />
          )}

          {event.signals.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Signals</p>
              {event.signals.map((signal, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0" />
                  <span>{signal.description}</span>
                  <span className="text-gray-600">{timeAgo(signal.detectedAt)}</span>
                </div>
              ))}
            </div>
          )}

          {person && <SocialIcons sources={person.sources} className="pt-1" />}
        </div>
      </div>
    </div>
  );
}
