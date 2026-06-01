export default function DataTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
      <table className="w-full min-w-[800px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-cyan-300">
          <tr>
            {columns.map((column) => (
              <th key={column.key || column} className="px-5 py-4">
                {column.label || column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr className="border-t border-white/10">
              <td
                colSpan={columns.length || 1}
                className="px-5 py-8 text-center text-slate-500"
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="border-t border-white/10 text-slate-300">
                {columns.map((column) => {
                  const key = column.key || column;

                  return (
                    <td key={key} className="px-5 py-4">
                      {row[key] || "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}