import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addSuggestion } from '../../services/firestore';

const inputClass = 'w-full bg-secondary border border-border rounded-[var(--radius-md)] px-4 py-2 text-foreground focus:border-primary/40 focus:outline-none transition-colors duration-[var(--duration-fast)] placeholder-muted-foreground/60';
const labelClass = 'block text-[0.8125rem] font-600 text-card-foreground mb-1';

export function SuggestionForm() {
  const { user } = useAuth();
  const [personName, setPersonName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !personName.trim() || !reason.trim()) return;

    setSubmitting(true);
    await addSuggestion({
      personName: personName.trim(),
      linkedinUrl: linkedinUrl.trim() || undefined,
      xHandle: xHandle.trim() || undefined,
      reason: reason.trim(),
      submittedBy: user.uid,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-success/10 border border-success/20 rounded-[var(--radius-lg)] p-6 text-center">
        <p className="text-success font-600">Suggestion submitted!</p>
        <p className="text-sm text-card-foreground mt-1">It will appear in the suggestions list for others to upvote.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setPersonName('');
            setLinkedinUrl('');
            setXHandle('');
            setReason('');
          }}
          className="mt-4 text-sm text-primary hover:brightness-110 font-600 transition-all duration-[var(--duration-fast)]"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Person Name *</label>
        <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} required className={inputClass} placeholder="e.g. Andrej Karpathy" />
      </div>
      <div>
        <label className={labelClass}>LinkedIn URL</label>
        <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/..." />
      </div>
      <div>
        <label className={labelClass}>X Handle</label>
        <input type="text" value={xHandle} onChange={(e) => setXHandle(e.target.value)} className={inputClass} placeholder="@handle" />
      </div>
      <div>
        <label className={labelClass}>Why should we track this person? *</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} className={`${inputClass} resize-none`} placeholder="e.g. Lead researcher at xAI, formerly at DeepMind" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-primary-foreground disabled:opacity-50 px-6 py-2 rounded-[var(--radius-md)] font-700 tracking-[0.06em] uppercase text-[0.8125rem] hover:brightness-110 transition-all duration-[var(--duration-fast)]"
      >
        {submitting ? 'Submitting...' : 'Submit Suggestion'}
      </button>
    </form>
  );
}
