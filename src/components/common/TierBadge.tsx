import type { Tier } from '../../types';

const config: Record<Tier, { label: string; className: string }> = {
  legendary: { label: 'LEGENDARY', className: 'bg-tier-legendary/10 text-tier-legendary border-tier-legendary/20' },
  senior: { label: 'SENIOR', className: 'bg-tier-senior/10 text-tier-senior border-tier-senior/20' },
  notable: { label: 'NOTABLE', className: 'bg-tier-notable/10 text-tier-notable border-tier-notable/20' },
  emerging: { label: 'EMERGING', className: 'bg-tier-emerging/10 text-tier-emerging border-tier-emerging/20' },
};

export function TierBadge({ tier }: { tier: Tier }) {
  const { label, className } = config[tier];
  return (
    <span className={`text-[0.625rem] font-700 tracking-[0.08em] px-2 py-0.5 rounded-[var(--radius-sm)] border ${className}`}>
      {label}
    </span>
  );
}
