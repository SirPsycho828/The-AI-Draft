import { useEffect, useState } from 'react';
import { getRecentPublishedMoves } from '../services/firestore';
import type { MoveEvent, MoveType } from '../types';

interface TickerMove {
  type: string;
  text: string;
  color: string;
}

const TYPE_META: Record<MoveType, { label: string; color: string }> = {
  departure: { label: 'DEPARTURE', color: 'text-destructive' },
  new_hire: { label: 'NEW HIRE', color: 'text-success' },
  founded_startup: { label: 'FOUNDED', color: 'text-move-founded' },
  went_academic: { label: 'ACADEMIC', color: 'text-move-academic' },
  returned: { label: 'RETURNED', color: 'text-move-returned' },
  role_change: { label: 'ROLE CHG', color: 'text-move-role-change' },
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

export function useLandingMoves(): TickerMove[] {
  const [moves, setMoves] = useState<TickerMove[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    getRecentPublishedMoves(8).then((events) => {
      if (cancelled) return;
      if (events.length === 0) return; // keep fallback
      setMoves(
        events.map((e) => {
          const meta = TYPE_META[e.type];
          return {
            type: meta.label,
            text: buildText(e),
            color: meta.color,
          };
        })
      );
    });
    return () => { cancelled = true; };
  }, []);

  return moves;
}
