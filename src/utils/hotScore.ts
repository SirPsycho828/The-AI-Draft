import { Timestamp } from 'firebase/firestore';
import type { Tier, Confidence } from '../types';

const TIER_WEIGHT: Record<Tier, number> = {
  legendary: 4,
  senior: 3,
  notable: 2,
  emerging: 1,
};

const CONFIDENCE_WEIGHT: Record<Confidence, number> = {
  confirmed: 4,
  high: 3,
  medium: 2,
  speculative: 1,
};

export function hotScore(
  tier: Tier,
  confidence: Confidence,
  detectedAt: Timestamp
): number {
  const daysSince = Math.floor(
    (Date.now() - detectedAt.toDate().getTime()) / 86_400_000
  );
  const recency = Math.max(0, 30 - daysSince);
  return TIER_WEIGHT[tier] * 10 + CONFIDENCE_WEIGHT[confidence] * 5 + recency;
}
