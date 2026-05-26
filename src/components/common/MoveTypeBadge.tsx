import type { MoveType } from '../../types';

const config: Record<MoveType, { label: string; className: string }> = {
  departure: { label: 'Departure', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  new_hire: { label: 'New Hire', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  founded_startup: { label: 'Founded Startup', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  went_academic: { label: 'Went Academic', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  returned: { label: 'Returned', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  role_change: { label: 'Role Change', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export function MoveTypeBadge({ type }: { type: MoveType }) {
  const { label, className } = config[type];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
