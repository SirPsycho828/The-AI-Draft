import { SuggestionForm } from '../components/suggestions/SuggestionForm';

export default function SuggestPerson() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="font-heading text-2xl tracking-[0.03em] text-foreground mb-2">SUGGEST A PERSON TO TRACK</h1>
      <p className="text-card-foreground mb-6">
        Know someone in the AI industry we should be watching? Submit their info and the community can upvote.
      </p>
      <SuggestionForm />
    </div>
  );
}
