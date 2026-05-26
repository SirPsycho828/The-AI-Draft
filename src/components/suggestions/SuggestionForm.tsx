import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addSuggestion } from '../../services/firestore';

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
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
        <p className="text-green-400 font-medium">Suggestion submitted!</p>
        <p className="text-sm text-gray-400 mt-1">It will appear in the suggestions list for others to upvote.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setPersonName('');
            setLinkedinUrl('');
            setXHandle('');
            setReason('');
          }}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Person Name *</label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g. Andrej Karpathy"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn URL</label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="https://linkedin.com/in/..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">X Handle</label>
        <input
          type="text"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="@handle"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Why should we track this person? *</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
          placeholder="e.g. Lead researcher at xAI, formerly at DeepMind"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Suggestion'}
      </button>
    </form>
  );
}
