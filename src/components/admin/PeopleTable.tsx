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
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          Add Person
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Added By</th>
              <th className="px-4 py-3 font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => (
              <tr key={person.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-3 font-medium">{person.name}</td>
                <td className="px-4 py-3 text-gray-400">{person.currentOrg}</td>
                <td className="px-4 py-3"><TierBadge tier={person.tier} /></td>
                <td className="px-4 py-3 text-gray-500">{person.addedBy}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPerson(person)} className="text-gray-500 hover:text-blue-400 text-xs">Edit</button>
                    <button onClick={() => handleDelete(person)} className="text-gray-500 hover:text-red-400 text-xs">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No people found.</p>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">{filtered.length} of {people.length} people</p>

      {showAdd && <PersonFormModal onClose={() => setShowAdd(false)} />}
      {editingPerson && <PersonFormModal person={editingPerson} onClose={() => setEditingPerson(null)} />}
    </>
  );
}
