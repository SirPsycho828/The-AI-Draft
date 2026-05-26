import { Link } from 'react-router-dom';
import type { Person, Tier } from '../../types';
import { PersonAvatar } from '../common/PersonAvatar';
import { SocialIcons } from '../common/SocialIcons';

const TIER_DOT: Record<Tier, string> = {
  legendary: 'bg-tier-legendary',
  senior: 'bg-tier-senior',
  notable: 'bg-tier-notable',
  emerging: 'bg-tier-emerging',
};

const TIER_TEXT: Record<Tier, string> = {
  legendary: 'text-tier-legendary',
  senior: 'text-tier-senior',
  notable: 'text-tier-notable',
  emerging: 'text-tier-emerging',
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
    <div className="flex items-start gap-3 py-3 px-3 hover:bg-secondary/50 transition-colors duration-[var(--duration-fast)]">
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
            className="text-sm font-500 text-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] truncate"
          >
            {person.name}
          </Link>
          <span className="flex items-center gap-1 shrink-0">
            <span className={`w-2 h-2 rounded-full ${TIER_DOT[person.tier]}`} />
            <span className={`text-xs font-500 ${TIER_TEXT[person.tier]}`}>{TIER_LETTER[person.tier]}</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {person.currentTitle ?? person.currentOrg}
        </p>
        <SocialIcons sources={person.sources} className="mt-1" />
      </div>
    </div>
  );
}
