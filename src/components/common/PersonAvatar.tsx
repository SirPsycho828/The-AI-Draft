import type { Tier } from '../../types';

const TIER_RING: Record<Tier, string> = {
  legendary: 'ring-tier-legendary/60',
  senior: 'ring-tier-senior/60',
  notable: 'ring-tier-notable/60',
  emerging: 'ring-tier-emerging/60',
};

const TIER_BG: Record<Tier, string> = {
  legendary: 'bg-tier-legendary/20 text-tier-legendary',
  senior: 'bg-tier-senior/20 text-tier-senior',
  notable: 'bg-tier-notable/20 text-tier-notable',
  emerging: 'bg-tier-emerging/20 text-tier-emerging',
};

interface PersonAvatarProps {
  name: string;
  photoUrl?: string;
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
  showRing?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-24 h-24 text-2xl',
} as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PersonAvatar({
  name,
  photoUrl,
  tier,
  size = 'md',
  showRing = false,
}: PersonAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const ringClass = showRing ? `ring-2 ${TIER_RING[tier]}` : '';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${ringClass}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full ${TIER_BG[tier]} ${ringClass} flex items-center justify-center font-semibold shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
