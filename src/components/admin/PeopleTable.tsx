import { useState, useMemo } from 'react';
import type { Person } from '../../types';
import { TierBadge } from '../common/TierBadge';
import { deletePerson } from '../../services/firestore';
import { PersonFormModal } from './PersonFormModal';

interface Props {
  people: Person[];
}

export function PeopleTable({ people }: Props) {
  const [search, setSearch] = useState('');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return people;
    const q = search.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.currentOrg.toLowerCase().includes(q)
    );
  }, [people, search]);

  const handleDelete = async (person: Person) => {
    if (!confirm(`Delete ${person.name}?`)) return;
    await deletePerson(person.id);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or org..."
          className="flex-1 bg-secondary border border-border rounded-[var(--radius-md)] px-4 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors duration-[var(--duration-fast)] placeholder-muted-foreground/60"
        />
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-md)] text-[0.8125rem] font-700 tracking-[0.06em] uppercase hover:brightness-110 transition-all duration-[var(--duration-fast)] whitespace-nowrap"
        >
          Add Person
        </button>
      </div>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-600 w-12"></th>
              <th className="px-4 py-3 font-600">Name</th>
              <th className="px-4 py-3 font-600">Organization</th>
              <th className="px-4 py-3 font-600">Tier</th>
              <th className="px-4 py-3 font-600">Sources</th>
              <th className="px-4 py-3 font-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => {
              const sourceCount = [
                person.sources.githubUsername,
                person.sources.linkedinSlug,
                person.sources.xHandle,
                person.sources.semanticScholarId,
              ].filter(Boolean).length;

              return (
                <tr key={person.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                      {person.photoUrl ? (
                        <img src={person.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground font-500">
                          {person.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-500 text-foreground">{person.name}</td>
                  <td className="px-4 py-2 text-card-foreground">{person.currentOrg}</td>
                  <td className="px-4 py-2"><TierBadge tier={person.tier} /></td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{sourceCount}/4 linked</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPerson(person)}
                        className="px-2.5 py-1 text-xs font-500 text-primary border border-primary/30 hover:bg-primary/10 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(person)}
                        className="px-2.5 py-1 text-xs text-muted-foreground hover:text-destructive border border-border hover:border-destructive/30 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No people found.</p>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{filtered.length} of {people.length} people</p>

      {showAdd && <PersonFormModal onClose={() => setShowAdd(false)} />}
      {editingPerson && <PersonFormModal person={editingPerson} onClose={() => setEditingPerson(null)} />}
    </>
  );
}
