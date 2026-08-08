// ─────────────────────────────────────────────────────────────────────────────
// DataTable — reusable table component
//
// Props:
//   columns — [{ key, header, render?, align?, mono? }]
//   data    — array of row objects
//   loading — boolean
//   emptyMessage — string (system voice, not "Oops!")
//   onRowClick — (row) => void (optional)
// ─────────────────────────────────────────────────────────────────────────────

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No records found.',
  onRowClick,
}) {
  if (loading) {
    return <TableSkeleton columns={columns} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full ledger-table">
        <thead>
          <tr className="border-b border-steel">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/60 ${col.align === 'right' ? 'text-right' : ''
                  }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-slate-text/50 italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-steel/40 ${onRowClick ? 'cursor-pointer' : ''
                  }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.mono ? 'font-mono text-sm' : ''
                      }`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Loading skeleton — shows ghost rows while data is fetching
function TableSkeleton({ columns }) {
  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="w-full">
        <thead>
          <tr className="border-b border-steel">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                <div className="h-3 bg-steel rounded w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-steel/40">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4">
                  <div className="h-3 bg-steel/50 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
