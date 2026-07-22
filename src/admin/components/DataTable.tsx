interface Column {
  key: string
  label: string
  render?: (val: any, row: any) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  pageSize?: number
}

export function DataTable({ columns, data, pageSize = 50 }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th key={col.key} className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider pb-2 pr-4 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, pageSize).map((row, i) => (
            <tr key={row.id || i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 pr-4 text-sm text-zinc-300 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-sm text-zinc-600">
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {data.length > pageSize && (
        <p className="text-xs text-zinc-600 mt-2">Showing {pageSize} of {data.length} entries</p>
      )}
    </div>
  )
}
