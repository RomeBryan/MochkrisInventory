import React, { useState, useEffect } from 'react';
import { X, User, Search } from 'lucide-react';
import { purchaseOrderService } from '../../../services/purchaseOrderService';

export default function ManagerSelectModal({ onSelect, onAssign, onClose, currentManagerId, title = 'Select Manager' }) {
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(currentManagerId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getManagers();
      setManagers(response.data?.managers || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading managers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedManagerId) {
      alert('Please select a manager');
      return;
    }
    const selectedManager = managers.find(m => m.id === selectedManagerId);
    if (onAssign) {
      onAssign(selectedManagerId, selectedManager);
    } else if (onSelect) {
      onSelect(selectedManagerId);
    }
  };

  const filteredManagers = managers.filter(manager =>
    manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search managers..."
                className="pl-10 pr-4 py-2 border rounded-md w-full text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading managers...</div>
          ) : filteredManagers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No managers found' : 'No managers available'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto mb-4">
              {filteredManagers.map((manager) => (
                <label
                  key={manager.id}
                  className={`flex items-center p-3 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 ${
                    selectedManagerId === manager.id ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="manager"
                    value={manager.id}
                    checked={selectedManagerId === manager.id}
                    onChange={(e) => setSelectedManagerId(parseInt(e.target.value))}
                    className="mr-3"
                  />
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{manager.name}</div>
                    <div className="text-xs text-gray-500">{manager.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || !selectedManagerId
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={loading || !selectedManagerId}
            >
              Select Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

