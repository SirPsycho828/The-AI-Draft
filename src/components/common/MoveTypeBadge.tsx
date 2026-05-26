import type { MoveType } from '../../types';

const config: Record<MoveType, { label: string; className: string }> = {
  departure: { label: 'DEPARTURE', className: 'bg-move-departure/10 text-move-departure border-move-departure/20' },
  new_hire: { label: 'NEW HIRE', className: 'bg-move-new-hire/10 text-move-new-hire border-move-new-hire/20' },
  founded_startup: { label: 'FOUNDED', className: 'bg-move-founded/10 text-move-founded border-move-founded/20' },
  went_academic: { label: 'ACADEMIC', className: 'bg-move-academic/10 text-move-academic border-move-academic/20' },
  returned: { label: 'RETURNED', className: 'bg-move-returned/10 text-move-returned border-move-returned/20' },
  role_change: { label: 'ROLE CHG', className: 'bg-move-role-change/10 text-move-role-change border-move-role-change/20' },
};

export function MoveTypeBadge({ type }: { type: MoveType }) {
  const { label, className } = config[type];
  return (
    <span className={`text-[0.625rem] font-700 tracking-[0.08em] px-2 py-0.5 rounded-[var(--radius-sm)] border ${className}`}>
      {label}
    </span>
  );
}
