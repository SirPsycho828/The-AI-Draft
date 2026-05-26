import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

  const isBreaking = useMemo(() => {
    const ms = Date.now() - event.detectedAt.toDate().getTime();
    return ms < 24 * 60 * 60 * 1000;
  }, [event.detectedAt]);

  return (
    <div
      className={`bg-card border rounded-[var(--radius-lg)] p-5 cursor-pointer transition-all duration-150 ease-out group
        ${isBreaking
          ? 'border-l-2 border-l-primary border-t-border border-r-border border-b-border animate-flash-border'
          : 'border-border'}
        hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-md`}
      onClick={() => setExpanded((prev) => !prev)}
    >
      {/* Collapsed: always visible */}
      <div className="flex items-start gap-3">
        <div className="transition-transform duration-150 group-hover:scale-105">
          <PersonAvatar
            name={person?.name ?? 'Unknown'}
            photoUrl={person?.photoUrl}
            tier={person?.tier ?? 'emerging'}
            size="md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Link
              to={`/person/${person?.slug ?? ''}`}
              className="font-600 text-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {person?.name ?? 'Unknown Person'}
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <MoveTypeBadge type={event.type} />
              <ConfidenceBadge confidence={event.confidence} />
            </div>
          </div>
          <p className="text-sm text-card-foreground">{orgLine(event)}</p>
          {!expanded && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {event.aiSummary}
            </p>
          )}
        </div>
      </div>

      {/* Footer: always visible */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>{event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2">
          {isBreaking && (
            <span className="text-[0.5625rem] font-700 tracking-[0.08em] uppercase text-primary animate-pulse">
              JUST IN
            </span>
          )}
          <span>{timeAgo(event.detectedAt)}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-[var(--duration-normal)] ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded: detail section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              {person && (
                <div className="flex items-center gap-2">
                  <TierBadge tier={person.tier} />
                  {person.currentTitle && (
                    <span className="text-sm text-card-foreground">
                      {person.currentTitle} at {person.currentOrg}
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm text-card-foreground">{event.aiSummary}</p>

              {person && person.previousOrgs.length > 0 && (
                <CareerTrail
                  previousOrgs={person.previousOrgs}
                  currentOrg={person.currentOrg}
                />
              )}

              {event.signals.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[0.625rem] font-600 tracking-[0.08em] uppercase text-muted-foreground">
                    Signals
                  </p>
                  {event.signals.map((signal, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span>{signal.description}</span>
                      <span className="text-muted-foreground/60">{timeAgo(signal.detectedAt)}</span>
                    </div>
                  ))}
                </div>
              )}

              {person && (
                <div className="flex items-center justify-between pt-1">
                  <SocialIcons sources={person.sources} />
                  <Link
                    to={`/person/${person.slug}`}
                    className="text-[0.625rem] font-700 tracking-[0.08em] uppercase text-primary hover:brightness-110 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Full Profile &rarr;
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
