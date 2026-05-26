import type { Tier } from '../../types';

const config: Record<Tier, { label: string; className: string }> = {
  legendary: { label: 'Legendary', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  senior: { label: 'Senior', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  notable: { label: 'Notable', className: 'bg-gray-500/10 text-gray-300 border-gray-500/20' },
  emerging: { label: 'Emerging', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
};

export function TierBadge({ tier }: { tier: Tier }) {
  const { label, className } = config[tier];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
