import type { Confidence } from '../../types';

const config: Record<Confidence, { label: string; className: string }> = {
  confirmed: { label: 'CONFIRMED', className: 'text-success' },
  high: { label: 'HIGH', className: 'text-tier-senior' },
  medium: { label: 'MEDIUM', className: 'text-warning' },
  speculative: { label: 'SPEC', className: 'text-muted-foreground' },
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { label, className } = config[confidence];
  return (
    <span className={`text-[0.625rem] font-600 tracking-[0.06em] ${className}`}>
      {label}
    </span>
  );
}
