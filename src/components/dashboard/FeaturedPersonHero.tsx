import { useMemo } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <PersonAvatar
          name={person.name}
          photoUrl={person.photoUrl}
          tier={person.tier}
          size="lg"
          showRing
        />
        <div>
          <Link
            to={`/person/${person.slug}`}
            className="text-lg font-bold text-white hover:text-blue-400 transition-colors"
          >
            {person.name}
          </Link>
          <div className="flex items-center justify-center gap-2 mt-1">
            <TierBadge tier={person.tier} />
          </div>
          {person.currentTitle && (
            <p className="text-sm text-gray-400 mt-1">
              {person.currentTitle} at {person.currentOrg}
            </p>
          )}
          {!person.currentTitle && (
            <p className="text-sm text-gray-400 mt-1">{person.currentOrg}</p>
          )}
        </div>
      </div>

      {person.previousOrgs.length > 0 && (
        <div className="mt-4 flex justify-center">
          <CareerTrail
            previousOrgs={person.previousOrgs}
            currentOrg={person.currentOrg}
          />
        </div>
      )}

      <div className="mt-4 bg-gray-800/50 rounded-lg p-3 text-left">
        <div className="flex items-center gap-2 mb-2">
          <MoveTypeBadge type={event.type} />
          <span className="text-xs text-gray-500">{timeAgo(event.detectedAt)}</span>
        </div>
        <p className="text-sm text-gray-300 line-clamp-3">{event.aiSummary}</p>
      </div>

      <SocialIcons sources={person.sources} className="justify-center mt-4" />

      <Link
        to={`/person/${person.slug}`}
        className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        View Profile &rarr;
      </Link>
    </div>
  );
}
