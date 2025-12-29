import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Plus, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export default function PurchaseRequestView() {
  const { createPurchaseRequest, purchaseRequests } = useSystem();
  const [formData, setFormData] = useState({
    item: '', 
    quantity: '',
    unit: 'pcs',
    price: '',
    purpose: '',
    neededBy: ''
  });
  const [errors, setErrors] = useState({});

  const units = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'box', label: 'Box' },
    { value: 'set', label: 'Set' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'l', label: 'Liter' },
    { value: 'm', label: 'Meter' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.item) newErrors.item = 'Item description is required';
    if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) 
      newErrors.quantity = 'Valid quantity is required';
    if (!formData.price || isNaN(formData.price) || formData.price <= 0)
      newErrors.price = 'Valid price is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.neededBy) newErrors.neededBy = 'Required date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    createPurchaseRequest({
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      total: parseFloat(formData.quantity) * parseFloat(formData.price)
    });
    
    // Reset form
    setFormData({
      item: '',
      quantity: '',
      unit: 'pcs',
      price: '',
      purpose: '',
      neededBy: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Purchase Requests</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" />
              New Purchase Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Item Description *</label>
                <input 
                  type="text" 
                  name="item"
                  className={`w-full border ${errors.item ? 'border-red-300' : 'border-slate-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                  placeholder="e.g. Office Supplies, Equipment, etc."
                  value={formData.item}
                  onChange={handleChange}
                />
                {errors.item && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="mr-1" size={12} /> {errors.item}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Quantity *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="quantity"
                      className={`w-full border ${errors.quantity ? 'border-red-300' : 'border-slate-300'} rounded-lg px-4 py-2 pr-16 focus:ring-2 focus:ring-indigo-500 outline-none`}
                      placeholder="0"
                      min="1"
                      step="0.01"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                    <select 
                      name="unit"
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-100 text-slate-600 text-xs rounded-md px-2 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.unit}
                      onChange={handleChange}
                    >
                      {units.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.quantity && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="mr-1" size={12} /> {errors.quantity}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Unit Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₱</span>
                    <input 
                      type="number" 
                      name="price"
                      className={`w-full border ${errors.price ? 'border-red-300' : 'border-slate-300'} rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none`}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="mr-1" size={12} /> {errors.price}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Estimated Total</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-lg font-bold text-slate-800">
                  ₱{(formData.quantity && formData.price ? (formData.quantity * formData.price).toFixed(2) : '0.00')}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Purpose *</label>
                <textarea
                  name="purpose"
                  rows="3"
                  className={`w-full border ${errors.purpose ? 'border-red-300' : 'border-slate-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                  placeholder="Please describe the purpose of this purchase..."
                  value={formData.purpose}
                  onChange={handleChange}
                />
                {errors.purpose && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="mr-1" size={12} /> {errors.purpose}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Needed By *</label>
                <div className="relative">
                  <input 
                    type="date" 
                    name="neededBy"
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full border ${errors.neededBy ? 'border-red-300' : 'border-slate-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none`}
                    value={formData.neededBy}
                    onChange={handleChange}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
                {errors.neededBy && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="mr-1" size={12} /> {errors.neededBy}</p>}
              </div>
              
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Submit Purchase Request
              </button>
            </form>
          </div>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">My Purchase Requests</h3>
              <span className="text-sm text-slate-500">{purchaseRequests.length} requests</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {purchaseRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FileText size={48} className="mx-auto mb-3 text-slate-200" />
                  <p>No purchase requests found.</p>
                  <p className="text-sm mt-1">Create your first purchase request using the form</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {purchaseRequests.slice().reverse().map((request) => (
                        <tr key={request.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{request.item}</div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">{request.purpose}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{request.quantity} {request.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">₱{parseFloat(request.price).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-900">₱{parseFloat(request.total).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(request.requestDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
