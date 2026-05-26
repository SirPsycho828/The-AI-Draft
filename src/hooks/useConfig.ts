import { useEffect, useState } from 'react';
import type { AppConfig } from '../types';
import { subscribeConfig } from '../services/firestore';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeConfig((data) => {
      setConfig(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { config, loading };
}
