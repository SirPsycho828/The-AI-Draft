import { SuggestionForm } from '../components/suggestions/SuggestionForm';

export default function SuggestPerson() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Suggest a Person to Track</h1>
      <p className="text-gray-400 mb-6">
        Know someone in the AI industry we should be watching? Submit their info and the community can upvote.
      </p>
      <SuggestionForm />
    </div>
  );
}
