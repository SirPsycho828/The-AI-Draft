import { useEffect, useState } from 'react';
import type { Suggestion } from '../types';
import { subscribeSuggestions } from '../services/firestore';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSuggestions((data) => {
      setSuggestions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { suggestions, loading };
}
