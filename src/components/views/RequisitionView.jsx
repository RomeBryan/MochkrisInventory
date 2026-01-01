import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { Plus, PackagePlus, Clock, CheckCircle, XCircle, AlertTriangle, Building2 } from "lucide-react";

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'PENDING APPROVAL': {
      icon: null,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      label: 'PENDING APPROVAL'
    },
    PENDING: { 
      icon: <Clock size={14} className="mr-1" />, 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-800',
      label: 'Pending'
    },
    APPROVED: { 
      icon: <CheckCircle size={14} className="mr-1" />, 
      bg: 'bg-green-50', 
      text: 'text-green-800',
      label: 'Approved'
    },
    REJECTED: { 
      icon: <XCircle size={14} className="mr-1" />, 
      bg: 'bg-red-50', 
      text: 'text-red-800',
      label: 'Rejected'
    },
    default: { 
      icon: <AlertTriangle size={14} className="mr-1" />, 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      label: status
    }
  };
  
  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status === 'PENDING APPROVAL' ? null : config.icon}
      {config.label}
    </span>
  );
};

export default function RequisitionView() {
  const { 
    inventory, 
    createRequisition, 
    requisitions, 
    addNewInventoryItem, 
    suppliers, 
    addNewSupplier 
  } = useSystem();
  
  // Sort requisitions by date (newest first)
  const myRequisitions = [...requisitions]
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [notes, setNotes] = useState('');
  
  // New supplier form state
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: ''
  });
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    qty: 1,
    unit: 'pcs',
    restockThreshold: 3,
    restockQty: 10
  });
  
  // StatusBadge component is now defined at the top level

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name) {
      alert('Please enter a supplier name');
      return;
    }
    
    const newSupplierObj = addNewSupplier({
      name: newSupplier.name,
      contact: newSupplier.contact,
      email: newSupplier.email
    });
    
    setSelectedSupplier(newSupplierObj.id);
    setNewSupplier({ name: '', contact: '', email: '' });
    setShowNewSupplierForm(false);
  }; 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || !qty || !selectedSupplier) {
      alert('Please fill in all fields including supplier');
      return;
    }
    
    const product = inventory.find(i => i.product_id === parseInt(selectedProductId));
    if (!product) return;
    
    const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);
    if (!selectedSupplierData) return;
    
    // Get the price from the product or default to 0
    const itemPrice = product.price || 0;
    
    // Call createRequisition with individual parameters
    createRequisition(
      product.name,  // itemName
      parseInt(qty), // qty
      product.product_id, // product_id
      selectedSupplierData, // supplier
      itemPrice // price
    );
    
    // Reset form
    setSelectedProductId('');
    setQty('');
    setSelectedSupplier('');
    setNotes('');
    
    alert('Material Request (RF) submitted successfully!');
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    try {
      // Add the new item to inventory using the context function
      const addedItem = addNewInventoryItem({
        ...newItem,
        qty: 0, // Start with 0 quantity
        price: parseFloat(newItem.price) || 0
      });
      
      // Select the new item
      setSelectedProductId(addedItem.product_id.toString());
      
      // Reset the form
      setNewItem({
        name: '',
        price: 0,
        qty: 1,
        unit: 'pcs',
        restockThreshold: 3,
        restockQty: 10
      });
      
      setShowNewItemForm(false);
    } catch (error) {
      console.error('Error adding new item:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Material Requests (RF)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24 h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" /> 
              Create Material Request (RF)
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm text-slate-500">Select Item</label>
                  <button 
                    type="button"
                    onClick={() => setShowNewItemForm(!showNewItemForm)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <PackagePlus size={14} />
                    {showNewItemForm ? 'Cancel' : 'Add New Item'}
                  </button>
                </div>
                
                {showNewItemForm ? (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-md border">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Item Name</label>
                      <input 
                        type="text" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full border p-2 rounded text-sm"
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Unit</label>
                        <select 
                          value={newItem.unit}
                          onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          required
                        >
                          <option value="pcs">Pieces</option>
                          <option value="gals">Gallons</option>
                          <option value="meters">Meters</option>
                          <option value="kg">Kilograms</option>
                          <option value="box">Box</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Price</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">₱</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newItem.price === 0 ? '' : newItem.price}
                            onChange={(e) => setNewItem({...newItem, price: e.target.value ? parseFloat(e.target.value) : 0})}
                            className="w-full border p-2 pl-8 rounded text-sm"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Restock At</label>
                        <input 
                          type="number" 
                          min="1"
                          value={newItem.restockThreshold}
                          onChange={(e) => setNewItem({...newItem, restockThreshold: parseInt(e.target.value) || 0})}
                          className="w-full border p-2 rounded text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Restock Qty</label>
                        <input 
                          type="number" 
                          min="1"
                          value={newItem.restockQty}
                          onChange={(e) => setNewItem({...newItem, restockQty: parseInt(e.target.value) || 0})}
                          className="w-full border p-2 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="button"
                          onClick={handleAddNewItem}
                          className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 transition"
                          disabled={!newItem.name.trim()}
                        >
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <select 
                    value={selectedProductId} 
                    onChange={e => setSelectedProductId(e.target.value)} 
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value=''>-- Choose Item --</option>
                    {inventory.map(i => (
                      <option key={i.product_id} value={i.product_id}>
                        {i.name} (Stock: {i.qty} {i.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={qty} 
                  onChange={e => setQty(e.target.value)} 
                  className="w-full border p-2 rounded" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-slate-500">Preferred Supplier</label>
                  <button 
                    type="button"
                    onClick={() => setShowNewSupplierForm(!showNewSupplierForm)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <PackagePlus size={14} />
                    {showNewSupplierForm ? 'Cancel' : 'Add New Supplier'}
                  </button>
                </div>
                
                {showNewSupplierForm && (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-md border mb-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Supplier Name</label>
                      <input 
                        type="text" 
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                        className="w-full border p-2 rounded text-sm"
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Contact</label>
                        <input 
                          type="text" 
                          value={newSupplier.contact}
                          onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          placeholder="Contact number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={newSupplier.email}
                          onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleAddSupplier}
                      className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 transition"
                      disabled={!newSupplier.name.trim()}
                    >
                      Add Supplier
                    </button>
                  </div>
                )}
                <select 
                  value={selectedSupplier}
                  onChange={e => setSelectedSupplier(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {Array.isArray(suppliers) && suppliers.map(supplier => {
                    if (!supplier || typeof supplier !== 'object') {
                      console.error('Invalid supplier data:', supplier);
                      return null;
                    }

                    try {
                      const contactInfo = [];
                      if (supplier.contact) contactInfo.push(supplier.contact);
                      if (supplier.email) contactInfo.push(supplier.email);
                      const contactStr = contactInfo.join(' • ');
                      
                      // Format rating text and color
                      const formatRating = (rating) => {
                        try {
                          if (rating === null || rating === undefined || rating === '') return null;
                          
                          // Convert rating to string if it's a number or string number
                          let ratingStr;
                          if (typeof rating === 'number') {
                            ratingStr = rating >= 4.5 ? 'excellent' : 
                                      rating >= 3.5 ? 'good' : 
                                      rating >= 2.5 ? 'average' : 'poor';
                            
                            // Map rating to display text
                            return ratingStr.charAt(0).toUpperCase() + ratingStr.slice(1);
                          }
                          return '';
                        } catch (error) {
                          console.error('Error formatting rating:', error, 'Rating value:', rating);
                          return '';
                        }
                      };

                      // Function to get rating color class (for use outside of option elements)
                      const getRatingColorClass = (rating) => {
                        if (rating === undefined || rating === null) return '';
                        const ratingStr = String(rating).toLowerCase().trim();
                        return {
                          'excellent': 'bg-green-100 text-green-800',
                          'good': 'bg-blue-100 text-blue-800',
                          'average': 'bg-yellow-100 text-yellow-800',
                          'poor': 'bg-red-100 text-red-800'
                        }[ratingStr] || 'bg-gray-100 text-gray-800';
                      };

                      return (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name || 'Unnamed Supplier'}
                          {contactStr && ` (${contactStr})`}
                          {supplier.rating !== undefined && supplier.rating !== null && (
                            ` (${formatRating(supplier.rating)})`
                          )}
                        </option>
                      );
                    } catch (error) {
                      console.error('Error rendering supplier option:', error, 'Supplier data:', supplier);
                      return null;
                    }
                  })}
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-sm text-slate-500 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors mt-4"
                disabled={!selectedProductId || !qty || !selectedSupplier}
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* Right column - My Requests and About */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">My Requests</h3>
            </div>
            
            {myRequisitions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No requests found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRequisitions.map((req) => (
                  <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-slate-800">
                          {req.qty} x {req.item}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {req.supplier?.name && (
                            <span className="inline-flex items-center">
                              <Building2 size={14} className="mr-1 text-indigo-400" />
                              {req.supplier.name}
                            </span>
                          )}
                          <span className="mx-2">•</span>
                          <span>Requested on {new Date(req.requestDate).toLocaleString()}</span>
                        </div>
                        {req.notes && (
                          <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                            <span className="font-medium">Notes:</span> {req.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <StatusBadge status={req.status} />
                        <div className="text-xs text-slate-400 mt-1">
                          {req.history?.[0] || 'No status update'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* About Material Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">About Material Requests</h3>
            </div>
            <div className="p-4 text-sm text-slate-600 space-y-3">
              <p>
                Material Requests (RF) are used to request approval for purchasing new inventory items. 
                All requests must be approved by the appropriate personnel before they are processed.
              </p>
              <div>
                <span className="font-medium">Status Indicators:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li className="flex items-center">
                    <StatusBadge status="PENDING" />
                    <span className="ml-2">Awaiting approval</span>
                  </li>
                  <li className="flex items-center">
                    <StatusBadge status="APPROVED" />
                    <span className="ml-2">Approved and being processed</span>
                  </li>
                  <li className="flex items-center">
                    <StatusBadge status="REJECTED" />
                    <span className="ml-2">Request was not approved</span>
                  </li>
                </ul>
              </div>
              <p>
                For any questions about the status of your request, please contact the inventory department.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
