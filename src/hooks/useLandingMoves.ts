import { useEffect, useState } from 'react';
import { getRecentPublishedMoves } from '../services/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { MoveEvent, MoveType, Person } from '../types';

interface TickerMove {
  type: string;
  text: string;
  color: string;
}

export interface HeroMove {
  type: MoveType;
  typeLabel: string;
  typeColor: string;
  dotColor: string;
  personName: string;
  photoUrl?: string;
  description: string;
}

const TYPE_META: Record<MoveType, { label: string; color: string; dot: string }> = {
  departure: { label: 'DEPARTURE', color: 'text-destructive', dot: 'bg-destructive' },
  new_hire: { label: 'NEW HIRE', color: 'text-success', dot: 'bg-success' },
  founded_startup: { label: 'FOUNDED', color: 'text-move-founded', dot: 'bg-move-founded' },
  went_academic: { label: 'ACADEMIC', color: 'text-move-academic', dot: 'bg-move-academic' },
  returned: { label: 'RETURNED', color: 'text-move-returned', dot: 'bg-move-returned' },
  role_change: { label: 'ROLE CHG', color: 'text-move-role-change', dot: 'bg-move-role-change' },
};

function buildText(e: MoveEvent): string {
  switch (e.type) {
    case 'departure':
      return e.toOrg
        ? `left ${e.fromOrg} for ${e.toOrg}`
        : `departed ${e.fromOrg}`;
    case 'new_hire':
      return e.fromOrg
        ? `joined ${e.toOrg} from ${e.fromOrg}`
        : `joined ${e.toOrg}`;
    case 'founded_startup':
      return `founded ${e.toOrg ?? 'a new startup'}`;
    case 'went_academic':
      return e.toOrg ? `joined ${e.toOrg} (academia)` : 'moved to academia';
    case 'returned':
      return e.toOrg ? `returned to ${e.toOrg}` : 'returned';
    case 'role_change':
      return e.toOrg ? `new role at ${e.toOrg}` : 'changed roles';
  }
}

const FALLBACK: TickerMove[] = [
  { type: 'DEPARTURE', text: 'Checking for latest moves...', color: 'text-muted-foreground' },
];

export function useLandingMoves(): { tickerMoves: TickerMove[]; heroMoves: HeroMove[] } {
  const [tickerMoves, setTickerMoves] = useState<TickerMove[]>(FALLBACK);
  const [heroMoves, setHeroMoves] = useState<HeroMove[]>([]);

  useEffect(() => {
    let cancelled = false;
    getRecentPublishedMoves(8).then(async (events) => {
      if (cancelled || events.length === 0) return;

      // Build ticker moves (no person lookup needed)
      setTickerMoves(
        events.map((e) => {
          const meta = TYPE_META[e.type];
          return { type: meta.label, text: buildText(e), color: meta.color };
        })
      );

      // Fetch person names for hero cards (top 5)
      const top = events.slice(0, 5);
      const personIds = [...new Set(top.map((e) => e.personId))];
      const personMap = new Map<string, Person>();
      await Promise.all(
        personIds.map(async (id) => {
          const snap = await getDoc(doc(db, 'people', id));
          if (snap.exists()) personMap.set(id, { id: snap.id, ...snap.data() } as Person);
        })
      );

      if (cancelled) return;
      setHeroMoves(
        top.map((e) => {
          const meta = TYPE_META[e.type];
          const person = personMap.get(e.personId);
          return {
            type: e.type,
            typeLabel: meta.label,
            typeColor: meta.color,
            dotColor: meta.dot,
            personName: person?.name ?? 'Unknown',
            photoUrl: person?.photoUrl,
            description: buildText(e),
          };
        })
      );
    });
    return () => { cancelled = true; };
  }, []);

  return { tickerMoves, heroMoves };
}
