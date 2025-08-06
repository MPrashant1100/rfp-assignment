interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
      case 'Submitted':
        return 'bg-gray-500 text-white';
      case 'Published':
      case 'Under Review':
        return 'bg-yellow-500 text-white';
      case 'Approved':
        return 'bg-green-500 text-white';
      case 'Rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
} 