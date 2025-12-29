import React from 'react';

const POStatusBadge = ({ status }) => {
  const statusMap = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
    purchased: { label: 'Purchased', color: 'bg-purple-100 text-purple-800' },
    partially_received: { label: 'Partially Received', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusMap[status]?.color || 'bg-gray-100'}`}>
      {statusMap[status]?.label || status}
    </span>
  );
};

export default POStatusBadge;
