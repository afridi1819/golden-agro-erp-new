const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-green-500/20 text-green-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-green-500/20 text-green-400',
    unpaid: 'bg-red-500/20 text-red-400',
    partial: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-theme-border text-theme-muted'}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  );
};

export default StatusBadge;