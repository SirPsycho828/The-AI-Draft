import { Link } from 'react-router-dom';
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionCard } from '../components/suggestions/SuggestionCard';
import { CardSkeleton } from '../components/common/Skeleton';

export default function Suggestions() {
  const { suggestions, loading } = useSuggestions();
  const sorted = [...suggestions].sort((a, b) => b.upvotes.length - a.upvotes.length);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl tracking-[0.03em] text-foreground">COMMUNITY SUGGESTIONS</h1>
        <Link
          to="/suggest"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-md)] text-[0.8125rem] font-700 tracking-[0.06em] uppercase hover:brightness-110 transition-all duration-[var(--duration-fast)]"
        >
          Suggest Someone
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center">
          <p className="font-heading text-lg text-foreground">NO SUGGESTIONS YET</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to suggest someone to track.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  );
}
