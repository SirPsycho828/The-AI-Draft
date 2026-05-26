import { Link } from 'react-router-dom';
import type { Person, Tier } from '../../types';
import { PersonAvatar } from '../common/PersonAvatar';
import { SocialIcons } from '../common/SocialIcons';

const TIER_DOT: Record<Tier, string> = {
  legendary: 'bg-amber-400',
  senior: 'bg-blue-400',
  notable: 'bg-gray-400',
  emerging: 'bg-green-400',
};

const TIER_LETTER: Record<Tier, string> = {
  legendary: 'L',
  senior: 'S',
  notable: 'N',
  emerging: 'E',
};

interface PersonRosterRowProps {
  person: Person;
}

export function PersonRosterRow({ person }: PersonRosterRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 px-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <PersonAvatar
        name={person.name}
        photoUrl={person.photoUrl}
        tier={person.tier}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/person/${person.slug}`}
            className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate"
          >
            {person.name}
          </Link>
          <span className="flex items-center gap-1 shrink-0">
            <span className={`w-2 h-2 rounded-full ${TIER_DOT[person.tier]}`} />
            <span className="text-xs text-gray-500 font-medium">{TIER_LETTER[person.tier]}</span>
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {person.currentTitle ?? person.currentOrg}
        </p>
        <SocialIcons sources={person.sources} className="mt-1" />
      </div>
    </div>
  );
}
