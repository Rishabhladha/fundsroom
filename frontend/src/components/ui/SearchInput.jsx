import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative" style={{ minWidth: '260px' }}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--ink-muted)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input"
        style={{ paddingLeft: '34px', paddingRight: '34px' }}
        id="search-input"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors"
          style={{ color: 'var(--ink-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-dark)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
