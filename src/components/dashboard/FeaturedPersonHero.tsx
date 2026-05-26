import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import type { MoveEvent, Person } from '../../types';
import { PersonAvatar } from '../common/PersonAvatar';
import { TierBadge } from '../common/TierBadge';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { SocialIcons } from '../common/SocialIcons';
import { CareerTrail } from '../common/CareerTrail';
import { timeAgo } from '../../utils/timeAgo';
import { selectFeaturedPerson } from '../../utils/selectFeaturedPerson';

interface FeaturedPersonHeroProps {
  events: MoveEvent[];
  people: Map<string, Person>;
}

export function FeaturedPersonHero({ events, people }: FeaturedPersonHeroProps) {
  const featured = useMemo(
    () => selectFeaturedPerson(events, people),
    [events, people]
  );

  if (!featured) return null;

  const { event, person } = featured;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
      {/* SPOTLIGHT header bar */}
      <div className="bg-primary/8 border-b border-primary/15 px-4 py-2.5 flex items-center gap-2">
        <Crosshair size={13} className="text-primary" />
        <h3 className="font-heading text-sm tracking-[0.08em] text-primary">SPOTLIGHT</h3>
      </div>

      <div className="p-5">
        {/* Person info — side-by-side layout */}
        <div className="flex items-start gap-4">
          <PersonAvatar
            name={person.name}
            photoUrl={person.photoUrl}
            tier={person.tier}
            size="lg"
            showRing
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/person/${person.slug}`}
              className="font-heading text-2xl tracking-[0.02em] text-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] block leading-tight"
            >
              {person.name}
            </Link>
            <div className="flex items-center gap-2 mt-1.5">
              <TierBadge tier={person.tier} />
            </div>
            {person.currentTitle ? (
              <p className="text-sm text-card-foreground mt-1.5">
                {person.currentTitle} at {person.currentOrg}
              </p>
            ) : (
              <p className="text-sm text-card-foreground mt-1.5">{person.currentOrg}</p>
            )}
          </div>
        </div>

        {/* Career trail */}
        {person.previousOrgs.length > 0 && (
          <div className="mt-4">
            <CareerTrail
              previousOrgs={person.previousOrgs}
              currentOrg={person.currentOrg}
            />
          </div>
        )}

        {/* Latest move card */}
        <div className="mt-4 bg-secondary rounded-[var(--radius-md)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <MoveTypeBadge type={event.type} />
            <span className="text-[0.625rem] text-muted-foreground">{timeAgo(event.detectedAt)}</span>
          </div>
          <p className="text-sm text-card-foreground line-clamp-3">{event.aiSummary}</p>
        </div>

        {/* Social icons + View Profile CTA */}
        <div className="flex items-center justify-between mt-4">
          <SocialIcons sources={person.sources} />
          <Link
            to={`/person/${person.slug}`}
            className="text-[0.6875rem] font-700 tracking-[0.08em] uppercase text-primary hover:brightness-110 transition-all duration-[var(--duration-fast)]"
          >
            View Profile &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
