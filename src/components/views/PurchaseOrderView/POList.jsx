import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import POStatusBadge from './POStatusBadge';

export default function POList({ 
  purchaseOrders, 
  onSelectPO, 
  onCreateNew, 
  currentUser 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.items?.some(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter = statusFilter === 'all' || po.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search POs..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-white border rounded-md pl-3 pr-8 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="purchased">Purchased</option>
              <option value="partially_received">Partially Received</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {(currentUser.role === 'OWNER' || currentUser.role === 'MANAGER') && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New PO
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        {filteredPOs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No matching purchase orders found.' 
              : 'No purchase orders yet. Create your first PO to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPOs.map((po) => (
                  <tr 
                    key={po.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectPO(po)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {po.poNumber || `PO-${po.id.slice(0, 8)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {po.supplier?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {po.items?.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <POStatusBadge status={po.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{po.items?.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPO(po);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
