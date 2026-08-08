import { Search, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SearchInput — with debounce and clear button
// Props:
//   value     — string
//   onChange  — (value: string) => void
//   placeholder — string
// ─────────────────────────────────────────────────────────────────────────────

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text/50 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input pl-9 pr-8"
        style={{ width: '260px' }}
        id="search-input"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-text/50 hover:text-slate-text transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
