export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No records found.',
  onRowClick,
}) {
  if (loading) return <TableSkeleton columns={columns} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full ledger-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === 'right' ? 'text-right' : ''}
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
                className="px-4 py-14 text-center text-sm italic"
                style={{ color: 'var(--ink-muted)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${col.align === 'right' ? 'text-right' : ''} ${col.mono ? 'font-mono text-sm' : ''}`}
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

function TableSkeleton({ columns }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full ledger-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                <div className="skeleton h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 7 }).map((_, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>
                  <div className="skeleton h-3" style={{ width: `${55 + (i * 7) % 35}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
