import type { MoveEvent } from '../../types';

interface Props {
  events: MoveEvent[];
  totalPeople: number;
}

export function StatsBar({ events, totalPeople }: Props) {
  const now = Date.now() / 1000;
  const weekAgo = now - 7 * 86400;
  const thisWeek = events.filter((e) => e.detectedAt.seconds > weekAgo);

  const companyCounts = new Map<string, number>();
  for (const e of thisWeek) {
    if (e.fromOrg) companyCounts.set(e.fromOrg, (companyCounts.get(e.fromOrg) ?? 0) + 1);
    if (e.toOrg) companyCounts.set(e.toOrg, (companyCounts.get(e.toOrg) ?? 0) + 1);
  }
  const mostActive = [...companyCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="border-t border-gray-800 mt-8 pt-4 flex items-center gap-6 text-sm text-gray-500">
      <span>{totalPeople} people tracked</span>
      <span className="text-gray-700">|</span>
      <span>{thisWeek.length} move{thisWeek.length !== 1 ? 's' : ''} this week</span>
      {mostActive && (
        <>
          <span className="text-gray-700">|</span>
          <span>Most active: {mostActive[0]} ({mostActive[1]})</span>
        </>
      )}
    </div>
  );
}
