import { useState, useMemo } from 'react';
import type { Person } from '../../types';
import { PersonRosterRow } from './PersonRosterRow';

const TIER_ORDER = { legendary: 0, senior: 1, notable: 2, emerging: 3 } as const;

interface PersonRosterProps {
  people: Person[];
  excludePersonId?: string;
}

export function PersonRoster({ people, excludePersonId }: PersonRosterProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = excludePersonId
      ? people.filter((p) => p.id !== excludePersonId)
      : people;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    return result.sort(
      (a, b) =>
        TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
        a.name.localeCompare(b.name)
    );
  }, [people, excludePersonId, search]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl mt-4">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300">
          Tracked People ({filtered.length})
        </h3>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 w-32 focus:outline-none focus:border-gray-600 placeholder-gray-600"
        />
      </div>
      <div className="max-h-[calc(100vh-420px)] overflow-y-auto divide-y divide-gray-800/50">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 p-4 text-center">No people found</p>
        ) : (
          filtered.map((person) => (
            <PersonRosterRow key={person.id} person={person} />
          ))
        )}
      </div>
    </div>
  );
}
