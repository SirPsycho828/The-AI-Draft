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
  { value: 'departure', label: 'Departure', activeClass: 'bg-move-departure/20 text-move-departure border-move-departure/30' },
  { value: 'new_hire', label: 'New Hire', activeClass: 'bg-move-new-hire/20 text-move-new-hire border-move-new-hire/30' },
  { value: 'founded_startup', label: 'Startup', activeClass: 'bg-move-founded/20 text-move-founded border-move-founded/30' },
  { value: 'went_academic', label: 'Academic', activeClass: 'bg-move-academic/20 text-move-academic border-move-academic/30' },
  { value: 'returned', label: 'Returned', activeClass: 'bg-move-returned/20 text-move-returned border-move-returned/30' },
  { value: 'role_change', label: 'Role Chg', activeClass: 'bg-move-role-change/20 text-move-role-change border-move-role-change/30' },
];

const CONFIDENCES: { value: Confidence; label: string; activeClass: string }[] = [
  { value: 'confirmed', label: 'Confirmed', activeClass: 'bg-success/20 text-success border-success/30' },
  { value: 'high', label: 'High', activeClass: 'bg-tier-senior/20 text-tier-senior border-tier-senior/30' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-warning/20 text-warning border-warning/30' },
  { value: 'speculative', label: 'Spec', activeClass: 'bg-muted text-muted-foreground border-border' },
];

const TIERS: { value: Tier; label: string; activeClass: string }[] = [
  { value: 'legendary', label: 'L', activeClass: 'bg-tier-legendary/20 text-tier-legendary border-tier-legendary/30' },
  { value: 'senior', label: 'S', activeClass: 'bg-tier-senior/20 text-tier-senior border-tier-senior/30' },
  { value: 'notable', label: 'N', activeClass: 'bg-tier-notable/20 text-tier-notable border-tier-notable/30' },
  { value: 'emerging', label: 'E', activeClass: 'bg-tier-emerging/20 text-tier-emerging border-tier-emerging/30' },
];

const INACTIVE_CHIP = 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground/30';

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
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4 space-y-3">
      <div className="flex items-center flex-wrap gap-3">
        {/* Company dropdown */}
        <select
          value={filters.company}
          onChange={(e) =>
            onFiltersChange({ ...filters, company: e.target.value })
          }
          className="bg-secondary border border-border text-[0.8125rem] text-card-foreground rounded-[var(--radius-md)] px-3 py-1.5 focus:outline-none focus:border-primary/40 transition-colors duration-[var(--duration-fast)]"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-border" />

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
              className={`text-[0.6875rem] font-600 px-2.5 py-1 rounded-full border transition-all duration-[var(--duration-fast)] ${
                filters.types.includes(mt.value) ? mt.activeClass : INACTIVE_CHIP
              }`}
            >
              {mt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

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
              className={`text-[0.6875rem] font-600 px-2.5 py-1 rounded-full border transition-all duration-[var(--duration-fast)] ${
                filters.confidences.includes(c.value) ? c.activeClass : INACTIVE_CHIP
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

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
              className={`text-[0.6875rem] font-700 w-7 h-7 rounded-full border transition-all duration-[var(--duration-fast)] ${
                filters.tiers.includes(t.value) ? t.activeClass : INACTIVE_CHIP
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right side: sort toggle + clear */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex bg-secondary rounded-[var(--radius-md)] border border-border overflow-hidden">
            <button
              onClick={() => onSortChange('recent')}
              className={`text-[0.6875rem] font-600 tracking-[0.04em] uppercase px-3 py-1.5 transition-all duration-[var(--duration-fast)] ${
                sortMode === 'recent'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => onSortChange('hottest')}
              className={`text-[0.6875rem] font-600 tracking-[0.04em] uppercase px-3 py-1.5 transition-all duration-[var(--duration-fast)] ${
                sortMode === 'hottest'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hottest
            </button>
          </div>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-[var(--duration-fast)]"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
