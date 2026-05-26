import type { MoveType, Confidence, Tier } from '../../types';

export interface DashboardFilters {
  types: MoveType[];
  confidences: Confidence[];
  tiers: Tier[];
  company: string;
}

export type SortMode = 'recent' | 'hottest';

interface HorizontalFilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  companies: string[];
}

const MOVE_TYPES: { value: MoveType; label: string; activeClass: string }[] = [
  { value: 'departure', label: 'Departure', activeClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'new_hire', label: 'New Hire', activeClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'founded_startup', label: 'Startup', activeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'went_academic', label: 'Academic', activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'returned', label: 'Returned', activeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'role_change', label: 'Role Change', activeClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
];

const CONFIDENCES: { value: Confidence; label: string; activeClass: string }[] = [
  { value: 'confirmed', label: 'Confirmed', activeClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'high', label: 'High', activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'speculative', label: 'Spec', activeClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

const TIERS: { value: Tier; label: string; activeClass: string }[] = [
  { value: 'legendary', label: 'L', activeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'senior', label: 'S', activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'notable', label: 'N', activeClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  { value: 'emerging', label: 'E', activeClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
];

const INACTIVE_CHIP = 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600';

function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function HorizontalFilterBar({
  filters,
  onFiltersChange,
  sortMode,
  onSortChange,
  companies,
}: HorizontalFilterBarProps) {
  const hasFilters =
    filters.types.length > 0 ||
    filters.confidences.length > 0 ||
    filters.tiers.length > 0 ||
    filters.company !== '';

  function clearAll() {
    onFiltersChange({ types: [], confidences: [], tiers: [], company: '' });
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center flex-wrap gap-3">
        {/* Company dropdown */}
        <select
          value={filters.company}
          onChange={(e) =>
            onFiltersChange({ ...filters, company: e.target.value })
          }
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-600"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Move type chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {MOVE_TYPES.map((mt) => (
            <button
              key={mt.value}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  types: toggleInArray(filters.types, mt.value),
                })
              }
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                filters.types.includes(mt.value) ? mt.activeClass : INACTIVE_CHIP
              }`}
            >
              {mt.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Confidence chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CONFIDENCES.map((c) => (
            <button
              key={c.value}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  confidences: toggleInArray(filters.confidences, c.value),
                })
              }
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                filters.confidences.includes(c.value) ? c.activeClass : INACTIVE_CHIP
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Tier chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIERS.map((t) => (
            <button
              key={t.value}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  tiers: toggleInArray(filters.tiers, t.value),
                })
              }
              className={`text-xs font-semibold w-7 h-7 rounded-full border transition-colors ${
                filters.tiers.includes(t.value) ? t.activeClass : INACTIVE_CHIP
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right side: sort toggle + clear */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Sort toggle */}
          <div className="flex bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => onSortChange('recent')}
              className={`text-xs font-medium px-3 py-1.5 transition-colors ${
                sortMode === 'recent'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => onSortChange('hottest')}
              className={`text-xs font-medium px-3 py-1.5 transition-colors ${
                sortMode === 'hottest'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Hottest
            </button>
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
