import type { Person } from '../../types';
import { TierBadge } from '../common/TierBadge';

export function PersonHeader({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-6">
      {person.photoUrl ? (
        <img src={person.photoUrl} alt={person.name} className="w-20 h-20 rounded-full object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-500">
          {person.name.charAt(0)}
        </div>
      )}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{person.name}</h1>
          <TierBadge tier={person.tier} />
        </div>
        <p className="mt-1 text-gray-400">
          {person.currentTitle && <span>{person.currentTitle} at </span>}
          <span className="text-white font-medium">{person.currentOrg}</span>
        </p>
        {person.previousOrgs.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            Previously: {person.previousOrgs.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
