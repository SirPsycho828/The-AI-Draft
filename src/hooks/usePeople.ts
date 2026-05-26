import { useEffect, useState } from 'react';
import type { Person } from '../types';
import { subscribePeople } from '../services/firestore';

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribePeople((data) => {
      setPeople(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { people, loading };
}
