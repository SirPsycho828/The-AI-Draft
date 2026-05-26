import type { Person } from '../../types';
import { PersonAvatar } from '../common/PersonAvatar';
import { TierBadge } from '../common/TierBadge';
import { CareerTrail } from '../common/CareerTrail';

export function PersonHeader({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-6">
      <PersonAvatar
        name={person.name}
        photoUrl={person.photoUrl}
        tier={person.tier}
        size="lg"
        showRing
      />
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-3xl tracking-[0.02em] text-foreground">{person.name}</h1>
          <TierBadge tier={person.tier} />
        </div>
        <p className="mt-1 text-card-foreground">
          {person.currentTitle && <span>{person.currentTitle} at </span>}
          <span className="text-foreground font-600">{person.currentOrg}</span>
        </p>
        {person.previousOrgs.length > 0 && (
          <div className="mt-1.5">
            <CareerTrail previousOrgs={person.previousOrgs} currentOrg={person.currentOrg} />
          </div>
        )}
      </div>
    </div>
  );
}
