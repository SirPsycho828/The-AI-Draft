import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addPerson, updatePerson } from '../../services/firestore';
import type { Person, Tier, AddedBy } from '../../types';

interface Props {
  person?: Person;
  onClose: () => void;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function PersonFormModal({ person, onClose }: Props) {
  const [name, setName] = useState(person?.name ?? '');
  const [currentOrg, setCurrentOrg] = useState(person?.currentOrg ?? '');
  const [currentTitle, setCurrentTitle] = useState(person?.currentTitle ?? '');
  const [tier, setTier] = useState<Tier>(person?.tier ?? 'notable');
  const [githubUsername, setGithubUsername] = useState(person?.sources.githubUsername ?? '');
  const [linkedinSlug, setLinkedinSlug] = useState(person?.sources.linkedinSlug ?? '');
  const [xHandle, setXHandle] = useState(person?.sources.xHandle ?? '');
  const [semanticScholarId, setSemanticScholarId] = useState(person?.sources.semanticScholarId ?? '');
  const [photoUrl, setPhotoUrl] = useState(person?.photoUrl ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      name: name.trim(),
      slug: slugify(name),
      currentOrg: currentOrg.trim(),
      currentTitle: currentTitle.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      tier,
      sources: {
        githubUsername: githubUsername.trim() || undefined,
        linkedinSlug: linkedinSlug.trim() || undefined,
        xHandle: xHandle.trim() || undefined,
        semanticScholarId: semanticScholarId.trim() || undefined,
      },
    };

    if (person) {
      await updatePerson(person.id, data);
    } else {
      await addPerson({
        ...data,
        previousOrgs: [],
        addedBy: 'seed' as AddedBy,
        communityVotes: 0,
        lastScannedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{person ? 'Edit Person' : 'Add Person'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input type="text" value={currentOrg} onChange={(e) => setCurrentOrg(e.target.value)} required placeholder="Current Organization" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="Title (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="legendary">Legendary</option>
            <option value="senior">Senior</option>
            <option value="notable">Notable</option>
            <option value="emerging">Emerging</option>
          </select>
          <div className="border-t border-gray-800 pt-3 mt-3">
            <p className="text-xs text-gray-400 mb-2">Source Links</p>
            <input type="text" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="GitHub username" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mb-2" />
            <input type="text" value={linkedinSlug} onChange={(e) => setLinkedinSlug(e.target.value)} placeholder="LinkedIn slug" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mb-2" />
            <input type="text" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="X handle" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mb-2" />
            <input type="text" value={semanticScholarId} onChange={(e) => setSemanticScholarId(e.target.value)} placeholder="Semantic Scholar ID" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving...' : person ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
