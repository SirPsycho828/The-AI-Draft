import { useEffect, useState } from 'react';
import type { MoveEvent } from '../types';
import { subscribeMoveEvents, type MoveEventFilters } from '../services/firestore';

export function useMoveEvents(filters: MoveEventFilters = {}) {
  const [events, setEvents] = useState<MoveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeMoveEvents(filters, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { events, loading };
}
