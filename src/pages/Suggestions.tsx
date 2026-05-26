import { Link } from 'react-router-dom';
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionCard } from '../components/suggestions/SuggestionCard';

export default function Suggestions() {
  const { suggestions, loading } = useSuggestions();

  const sorted = [...suggestions].sort((a, b) => b.upvotes.length - a.upvotes.length);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Suggestions</h1>
        <Link
          to="/suggest"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Suggest Someone
        </Link>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No suggestions yet. Be the first!</p>
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
