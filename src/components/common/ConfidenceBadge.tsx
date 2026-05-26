import type { Confidence } from '../../types';

const config: Record<Confidence, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'text-green-400' },
  high: { label: 'High', className: 'text-blue-400' },
  medium: { label: 'Medium', className: 'text-yellow-400' },
  speculative: { label: 'Speculative', className: 'text-gray-500' },
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { label, className } = config[confidence];
  return <span className={`text-xs font-medium ${className}`}>{label}</span>;
}
