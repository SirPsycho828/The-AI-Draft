import type { Confidence, MoveType, Tier } from '../../types';

interface Filters {
  types: MoveType[];
  confidences: Confidence[];
  tiers: Tier[];
  company: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  companies: string[];
}

const moveTypes: { value: MoveType; label: string }[] = [
  { value: 'departure', label: 'Departure' },
  { value: 'new_hire', label: 'New Hire' },
  { value: 'founded_startup', label: 'Founded Startup' },
  { value: 'went_academic', label: 'Went Academic' },
  { value: 'returned', label: 'Returned' },
  { value: 'role_change', label: 'Role Change' },
];

const confidences: { value: Confidence; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'speculative', label: 'Speculative' },
];

const tiers: { value: Tier; label: string }[] = [
  { value: 'legendary', label: 'Legendary' },
  { value: 'senior', label: 'Senior' },
  { value: 'notable', label: 'Notable' },
  { value: 'emerging', label: 'Emerging' },
];

function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  const toggle = (value: T) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2">{label}</h3>
      <div className="space-y-1">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onChange, companies }: Props) {
  return (
    <aside className="w-56 shrink-0 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Company</h3>
        <select
          value={filters.company}
          onChange={(e) => onChange({ ...filters, company: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <CheckboxGroup
        label="Move Type"
        options={moveTypes}
        selected={filters.types}
        onChange={(types) => onChange({ ...filters, types })}
      />

      <CheckboxGroup
        label="Confidence"
        options={confidences}
        selected={filters.confidences}
        onChange={(confidences) => onChange({ ...filters, confidences })}
      />

      <CheckboxGroup
        label="Tier"
        options={tiers}
        selected={filters.tiers}
        onChange={(tiers) => onChange({ ...filters, tiers })}
      />

      {(filters.types.length > 0 || filters.confidences.length > 0 || filters.tiers.length > 0 || filters.company) && (
        <button
          onClick={() => onChange({ types: [], confidences: [], tiers: [], company: '' })}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}

export type { Filters };
