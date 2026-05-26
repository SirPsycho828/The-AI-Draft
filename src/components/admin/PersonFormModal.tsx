import { useState, useCallback, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { functions, storage } from '../../config/firebase';
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
  idle: 'border-border',
  checking: 'border-warning/50',
  valid: 'border-success/50',
  invalid: 'border-destructive/50',
};

const STATUS_ICON: Record<VerifyStatus, string> = {
  idle: '',
  checking: '...',
  valid: '\u2713',
  invalid: '\u2717',
};

const STATUS_COLOR: Record<VerifyStatus, string> = {
  idle: 'text-muted-foreground',
  checking: 'text-warning',
  valid: 'text-success',
  invalid: 'text-destructive',
};

const inputClass = 'w-full bg-secondary border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors duration-[var(--duration-fast)] placeholder-muted-foreground/60';
const labelClass = 'block text-xs font-600 text-muted-foreground mb-1';

export function PersonFormModal({ person, onClose }: Props) {
  const [name, setName] = useState(person?.name ?? '');
  const [currentOrg, setCurrentOrg] = useState(person?.currentOrg ?? '');
  const [currentTitle, setCurrentTitle] = useState(person?.currentTitle ?? '');
  const [tier, setTier] = useState<Tier>(person?.tier ?? 'notable');
  const [photoUrl, setPhotoUrl] = useState(person?.photoUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const slug = slugify(name || 'person');
      const storageRef = ref(storage, `people-photos/${slug}-${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoUrl(url);
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const inputBase = 'flex-1 bg-secondary rounded-[var(--radius-md)] px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none border transition-colors duration-[var(--duration-fast)]';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="font-heading text-xl tracking-[0.03em] text-foreground mb-4">
          {person ? 'EDIT PERSON' : 'ADD PERSON'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Mira Murati" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Organization *</label>
            <input type="text" value={currentOrg} onChange={(e) => setCurrentOrg(e.target.value)} required placeholder="e.g. Thinking Machines Lab" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="e.g. CEO & Co-founder" className={inputClass} />
          </div>

          {/* Photo section */}
          <div>
            <label className={labelClass}>Profile Photo</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-14 h-14 rounded-full bg-secondary border-2 border-dashed border-border hover:border-primary/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors duration-[var(--duration-fast)]"
                title="Click to upload photo"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className={`${inputClass} !text-xs`}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-primary hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload file'}
                  </button>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className={inputClass}>
              <option value="legendary">Legendary</option>
              <option value="senior">Senior</option>
              <option value="notable">Notable</option>
              <option value="emerging">Emerging</option>
            </select>
          </div>

          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground mb-2 font-600">Source Links — verify before saving</p>

            <SourceField
              label="GitHub"
              placeholder="username"
              url={github.value.trim() ? `https://github.com/${github.value.trim()}` : undefined}
              state={github}
              onChange={(v) => setGithub({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('github', github.value, setGithub)}
              inputBase={inputBase}
            />

            <SourceField
              label="LinkedIn"
              placeholder="slug (e.g. john-doe-1234)"
              url={linkedin.value.trim() ? `https://linkedin.com/in/${linkedin.value.trim()}` : undefined}
              state={linkedin}
              onChange={(v) => setLinkedin({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('linkedin', linkedin.value, setLinkedin)}
              inputBase={inputBase}
            />

            <SourceField
              label="X / Twitter"
              placeholder="@handle"
              url={xHandle.value.trim() ? `https://x.com/${xHandle.value.trim().replace('@', '')}` : undefined}
              state={xHandle}
              onChange={(v) => setXHandle({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('x', xHandle.value, setXHandle)}
              inputBase={inputBase}
            />

            <SourceField
              label="Semantic Scholar"
              placeholder="Author ID (numeric)"
              url={scholar.value.trim() ? `https://www.semanticscholar.org/author/${scholar.value.trim()}` : undefined}
              state={scholar}
              onChange={(v) => setScholar({ value: v, status: 'idle', label: undefined })}
              onVerify={() => verify('semanticScholar', scholar.value, setScholar)}
              inputBase={inputBase}
            />
          </div>

          {hasInvalidSources && (
            <p className="text-destructive text-xs">Fix invalid sources before saving.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-[var(--duration-fast)]">Cancel</button>
            {hasUnverifiedSources && (
              <button
                type="button"
                onClick={() => {
                  if (github.value.trim() && github.status === 'idle') verify('github', github.value, setGithub);
                  if (linkedin.value.trim() && linkedin.status === 'idle') verify('linkedin', linkedin.value, setLinkedin);
                  if (xHandle.value.trim() && xHandle.status === 'idle') verify('x', xHandle.value, setXHandle);
                  if (scholar.value.trim() && scholar.status === 'idle') verify('semanticScholar', scholar.value, setScholar);
                }}
                className="px-4 py-2 text-sm text-warning border border-warning/30 hover:bg-warning/10 rounded-[var(--radius-md)] transition-all duration-[var(--duration-fast)]"
              >
                Verify All
              </button>
            )}
            <button
              type="submit"
              disabled={saving || hasInvalidSources}
              className="bg-primary text-primary-foreground disabled:opacity-50 px-4 py-2 rounded-[var(--radius-md)] text-sm font-700 tracking-[0.06em] uppercase hover:brightness-110 transition-all duration-[var(--duration-fast)]"
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
  label,
  placeholder,
  url,
  state,
  onChange,
  onVerify,
  inputBase,
}: {
  label: string;
  placeholder: string;
  url?: string;
  state: SourceFieldState;
  onChange: (v: string) => void;
  onVerify: () => void;
  inputBase: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs font-600 text-muted-foreground">{label}</label>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:brightness-110 transition-all" title={url}>
            &#8599;
          </a>
        )}
      </div>
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
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border border-border hover:border-muted-foreground/50 text-sm font-bold transition-all duration-[var(--duration-fast)] disabled:opacity-50"
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
