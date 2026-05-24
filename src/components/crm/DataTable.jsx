import StatusBadge from './StatusBadge';
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';

export default function DataTable({ columns, data, showActions = true }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyan-500/20 bg-slate-900/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {showActions && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id}
              className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors duration-200"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4 text-slate-300">
                  {col.render ? col.render(row[col.key], row) : 
                   ['status', 'Status', 'status'].includes(col.key) ? (
                    <StatusBadge status={row[col.key]} />
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
              {showActions && (
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-cyan-500/10 rounded transition-colors duration-200">
                      <Eye size={16} className="text-cyan-400" />
                    </button>
                    <button className="p-1 hover:bg-cyan-500/10 rounded transition-colors duration-200">
                      <Edit2 size={16} className="text-cyan-400" />
                    </button>
                    <button className="p-1 hover:bg-red-500/10 rounded transition-colors duration-200">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
