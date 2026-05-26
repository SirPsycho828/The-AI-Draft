import { ChevronUp } from 'lucide-react';
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
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4 flex items-start gap-4">
      <button
        onClick={handleVote}
        disabled={!user}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-[var(--radius-md)] transition-all duration-[var(--duration-fast)] ${
          hasUpvoted
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        <ChevronUp size={18} />
        <span className="text-sm font-600">{suggestion.upvotes.length}</span>
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-600 text-foreground">{suggestion.personName}</h3>
        <p className="mt-1 text-sm text-card-foreground">{suggestion.reason}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {suggestion.linkedinUrl && (
            <a href={suggestion.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-[var(--duration-fast)]">
              LinkedIn
            </a>
          )}
          {suggestion.xHandle && (
            <a href={`https://x.com/${suggestion.xHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-[var(--duration-fast)]">
              X
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
