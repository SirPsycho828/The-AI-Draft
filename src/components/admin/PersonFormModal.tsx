import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { addPerson, updatePerson } from '../../services/firestore';
import type { Person, Tier, AddedBy } from '../../types';

interface Props {
  person?: Person;
  onClose: () => void;
}

type VerifyStatus = 'idle' | 'checking' | 'valid' | 'invalid';

interface SourceFieldState {
  value: string;
  status: VerifyStatus;
  label?: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const STATUS_STYLES: Record<VerifyStatus, string> = {
  idle: 'border-gray-700',
  checking: 'border-yellow-500/50',
  valid: 'border-green-500/50',
  invalid: 'border-red-500/50',
};

const STATUS_ICON: Record<VerifyStatus, string> = {
  idle: '',
  checking: '...',
  valid: '\u2713',
  invalid: '\u2717',
};

const STATUS_COLOR: Record<VerifyStatus, string> = {
  idle: 'text-gray-500',
  checking: 'text-yellow-400',
  valid: 'text-green-400',
  invalid: 'text-red-400',
};

export function PersonFormModal({ person, onClose }: Props) {
  const [name, setName] = useState(person?.name ?? '');
  const [currentOrg, setCurrentOrg] = useState(person?.currentOrg ?? '');
  const [currentTitle, setCurrentTitle] = useState(person?.currentTitle ?? '');
  const [tier, setTier] = useState<Tier>(person?.tier ?? 'notable');
  const [photoUrl, setPhotoUrl] = useState(person?.photoUrl ?? '');
  const [saving, setSaving] = useState(false);

  const [github, setGithub] = useState<SourceFieldState>({
    value: person?.sources.githubUsername ?? '', status: 'idle',
  });
  const [linkedin, setLinkedin] = useState<SourceFieldState>({
    value: person?.sources.linkedinSlug ?? '', status: 'idle',
  });
  const [xHandle, setXHandle] = useState<SourceFieldState>({
    value: person?.sources.xHandle ?? '', status: 'idle',
  });
  const [scholar, setScholar] = useState<SourceFieldState>({
    value: person?.sources.semanticScholarId ?? '', status: 'idle',
  });

  const verify = useCallback(
    async (
      type: 'github' | 'linkedin' | 'semanticScholar' | 'x',
      value: string,
      setter: React.Dispatch<React.SetStateAction<SourceFieldState>>
    ) => {
      if (!value.trim()) return;
      setter((s) => ({ ...s, status: 'checking' }));
      try {
        const fn = httpsCallable<
          { type: string; value: string },
          { valid: boolean; label?: string }
        >(functions, 'verifySource');
        const result = await fn({ type, value: value.trim() });
        setter((s) => ({
          ...s,
          status: result.data.valid ? 'valid' : 'invalid',
          label: result.data.label,
        }));
      } catch {
        setter((s) => ({ ...s, status: 'invalid', label: 'Verification failed' }));
      }
    },
    []
  );

  const hasUnverifiedSources = [github, linkedin, xHandle, scholar].some(
    (s) => s.value.trim() && s.status === 'idle'
  );
  const hasInvalidSources = [github, linkedin, xHandle, scholar].some(
    (s) => s.status === 'invalid'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasInvalidSources) return;
    setSaving(true);

    const data = {
      name: name.trim(),
      slug: slugify(name),
      currentOrg: currentOrg.trim(),
      currentTitle: currentTitle.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      tier,
      sources: {
        githubUsername: github.value.trim() || undefined,
        linkedinSlug: linkedin.value.trim() || undefined,
        xHandle: xHandle.value.trim() || undefined,
        semanticScholarId: scholar.value.trim() || undefined,
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

  const inputBase = 'flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none border';

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
            <p className="text-xs text-gray-400 mb-2">Source Links — verify before saving</p>

            {/* GitHub */}
            <SourceField
              placeholder="GitHub username"
              state={github}
              onChange={(v) => setGithub({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('github', github.value, setGithub)}
              inputBase={inputBase}
            />

            {/* LinkedIn */}
            <SourceField
              placeholder="LinkedIn slug (e.g. john-doe-1234)"
              state={linkedin}
              onChange={(v) => setLinkedin({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('linkedin', linkedin.value, setLinkedin)}
              inputBase={inputBase}
            />

            {/* X Handle */}
            <SourceField
              placeholder="X handle (e.g. @username)"
              state={xHandle}
              onChange={(v) => setXHandle({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('x', xHandle.value, setXHandle)}
              inputBase={inputBase}
            />

            {/* Semantic Scholar */}
            <SourceField
              placeholder="Semantic Scholar ID (numeric)"
              state={scholar}
              onChange={(v) => setScholar({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('semanticScholar', scholar.value, setScholar)}
              inputBase={inputBase}
            />
          </div>

          {hasInvalidSources && (
            <p className="text-red-400 text-xs">Fix invalid sources before saving.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            {hasUnverifiedSources && (
              <button
                type="button"
                onClick={() => {
                  if (github.value.trim() && github.status === 'idle') verify('github', github.value, setGithub);
                  if (linkedin.value.trim() && linkedin.status === 'idle') verify('linkedin', linkedin.value, setLinkedin);
                  if (xHandle.value.trim() && xHandle.status === 'idle') verify('x', xHandle.value, setXHandle);
                  if (scholar.value.trim() && scholar.status === 'idle') verify('semanticScholar', scholar.value, setScholar);
                }}
                className="px-4 py-2 text-sm text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 rounded-lg transition-colors"
              >
                Verify All
              </button>
            )}
            <button
              type="submit"
              disabled={saving || hasInvalidSources}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : person ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SourceField({
  placeholder,
  state,
  onChange,
  onVerify,
  inputBase,
}: {
  placeholder: string;
  state: SourceFieldState;
  onChange: (v: string) => void;
  onVerify: () => void;
  inputBase: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex gap-1.5 items-center">
        <input
          type="text"
          value={state.value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputBase} ${STATUS_STYLES[state.status]}`}
        />
        {state.value.trim() && (
          <button
            type="button"
            onClick={onVerify}
            disabled={state.status === 'checking'}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 hover:border-gray-500 text-sm font-bold transition-colors disabled:opacity-50"
            title="Verify"
          >
            <span className={STATUS_COLOR[state.status]}>
              {STATUS_ICON[state.status] || '\u2192'}
            </span>
          </button>
        )}
      </div>
      {state.label && (
        <p className={`text-xs mt-0.5 ml-1 ${STATUS_COLOR[state.status]}`}>{state.label}</p>
      )}
    </div>
  );
}
