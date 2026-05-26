import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Person } from '../../types';
import { PersonRosterRow } from './PersonRosterRow';
import { TIER_ORDER } from '../../utils/tierOrder';

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
    <div className="bg-card border border-border rounded-[var(--radius-lg)] mt-4">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
        <h3 className="text-[0.6875rem] font-700 tracking-[0.08em] uppercase text-foreground">
          Tracked ({filtered.length})
        </h3>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border border-border text-xs text-card-foreground rounded-[var(--radius-md)] pl-7 pr-2.5 py-1.5 w-32 focus:outline-none focus:border-primary/40 placeholder-muted-foreground/60 transition-colors duration-[var(--duration-fast)]"
          />
        </div>
      </div>
      <div className="max-h-[calc(100vh-420px)] overflow-y-auto divide-y divide-border/50">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">No people found</p>
        ) : (
          filtered.map((person) => (
            <PersonRosterRow key={person.id} person={person} />
          ))
        )}
      </div>
    </div>
  );
}
