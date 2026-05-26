import type { Suggestion } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { upvoteSuggestion, removeUpvote } from '../../services/firestore';

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const { user } = useAuth();
  const hasUpvoted = user ? suggestion.upvotes.includes(user.uid) : false;

  const handleVote = async () => {
    if (!user) return;
    if (hasUpvoted) {
      await removeUpvote(suggestion.id, user.uid);
    } else {
      await upvoteSuggestion(suggestion.id, user.uid);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
      <button
        onClick={handleVote}
        disabled={!user}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
          hasUpvoted
            ? 'text-blue-400 bg-blue-500/10'
            : 'text-gray-500 hover:text-white hover:bg-gray-800'
        }`}
      >
        <span className="text-lg leading-none">^</span>
        <span className="text-sm font-medium">{suggestion.upvotes.length}</span>
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{suggestion.personName}</h3>
        <p className="mt-1 text-sm text-gray-400">{suggestion.reason}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {suggestion.linkedinUrl && (
            <a href={suggestion.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              LinkedIn
            </a>
          )}
          {suggestion.xHandle && (
            <a href={`https://x.com/${suggestion.xHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              X
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
