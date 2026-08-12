const Table = ({ columns, data, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-theme-border">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 table-header">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3 table-header">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border">
          {data.map((row, index) => (
            <tr key={row.id || index} className="hover:bg-theme-border/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-theme-muted">No data available</div>
      )}
    </div>
  );
};

export default Table;