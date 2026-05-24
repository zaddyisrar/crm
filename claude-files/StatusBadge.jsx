export default function StatusBadge({ status }) {
  const statusConfig = {
    'New': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    'Contacted': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    'Interested': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    'Qualified': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
    'Booked': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    'Follow Up': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
    'No Answer': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
    'Callback': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
    'Not Interested': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
    'Active': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    'Inactive': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
    'Confirmed': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    'Pending': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
    'Completed': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    'Calling': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
    'Break': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
    'Washroom': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' }
  };

  const config = statusConfig[status] || statusConfig['New'];

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {status}
    </span>
  );
}
