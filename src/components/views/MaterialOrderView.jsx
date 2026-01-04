import React, { useState, useEffect } from "react";
import { useSystem } from "../../context/SystemContext";
import { Plus, PackagePlus, Building2 } from "lucide-react";

// Helper function to convert numeric rating to text
const getRatingText = (rating) => {
  if (rating === null || rating === undefined) return '';
  // Convert to number in case it's a string
  const numRating = Number(rating);
  if (isNaN(numRating)) return '';
  
  if (numRating >= 4.5) return 'Excellent';
  if (numRating >= 3.5) return 'Good';
  if (numRating >= 2.5) return 'Average';
  return 'Needs Improvement';
};

export default function MaterialOrderView() {
  const { 
    inventory, 
    purchaseStockDirect, 
    purchaseOrders,
    suppliers, 
    addNewSupplier,
    addNewInventoryItem
  } = useSystem();
  
  // Debug: Log when suppliers data changes
  useEffect(() => {
    console.log('Suppliers updated:', suppliers);
  }, [suppliers]);
  
  // Filter to show only direct purchase orders (created through this interface)
  const myOrders = purchaseOrders
    .filter(po => po.type === 'DIRECT_PURCHASE')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: ''
  });
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    qty: 1,
    unit: 'pcs',
    restockThreshold: 3,
    restockQty: 10
  });

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
    
    // Create direct purchase order (no approval needed)
    const items = [{
      product_id: product.product_id,
      qty: parseInt(qty),
      name: product.name,
      price: product.price || 0
    }];
    
    purchaseStockDirect(items, selectedSupplierData.name, notes || 'Direct purchase order');
    
    // Reset form
    setSelectedProductId('');
    setQty('');
    setSelectedSupplier('');
    setNotes('');
    
    alert('Material Order (PO) created successfully!');
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
      alert('Failed to add new item. Please try again.');
    }
  };

  // Debugging output - check supplier ratings
  console.log('Suppliers with ratings:', suppliers.map(s => ({ 
    name: s.name, 
    rating: s.rating,
    ratingText: getRatingText(s.rating) 
  })));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">New Material Order (PO)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24 h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" /> 
              Create Material Order (PO)
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
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Unit</label>
                        <select 
                          value={newItem.unit}
                          onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
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
                    required
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
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-slate-500">Supplier</label>
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
                        required
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
                  {suppliers.map(supplier => {
                    const contactInfo = [];
                    if (supplier.contact) contactInfo.push(supplier.contact);
                    if (supplier.email) contactInfo.push(supplier.email);
                    const contactStr = contactInfo.join(' • ');
                    
                    const ratingValue = typeof supplier.rating === 'number' ? supplier.rating : 
                                     (supplier.ratings && supplier.ratings.length > 0 ? 
                                      supplier.ratings.reduce((sum, r) => sum + r.value, 0) / supplier.ratings.length : 
                                      null);
                    
                    const ratingText = ratingValue !== null && !isNaN(ratingValue)
                      ? ` (${getRatingText(ratingValue)})`
                      : '';
                    
                    return (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                        {contactStr && ` (${contactStr})`}
                        {ratingText}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-500 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  rows="3"
                  placeholder="Any special instructions or notes..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              >
                Create Material Order (PO)
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Orders Section */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-slate-50">
                <h3 className="font-bold">My Orders</h3>
              </div>
              <div>
                {myOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No orders found.</div>
                ) : (
                  <div className="divide-y">
                    {myOrders.map(order => (
                      <div key={order.id} className="p-4 hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="mb-1">
                                  {item.qty} × {item.name || `Item ${item.product_id}`}
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              Supplier: {order.supplier || 'N/A'}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'SENT_TO_MANAGER' 
                                ? 'bg-blue-50 text-blue-800' // Light blue background, dark blue text (matching PENDING APPROVAL style)
                                : order.status === 'REJECTED' || order.status === 'RETURNED_TO_PURCHASING'
                                ? 'bg-red-50 text-red-800'  // Light red background, dark red text
                                : order.status === 'APPROVED' || order.status === 'COMPLETED' || order.status === 'PO_GENERATED'
                                ? 'bg-green-50 text-green-800' // Light green background, dark green text
                                : 'bg-yellow-50 text-yellow-800' // Light yellow background, dark yellow text
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              {order.history?.[order.history.length - 1] || 'Order created'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* About Material Orders Section */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold">About Material Orders (PO)</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Direct Purchase Order</h4>
                <p className="text-sm text-slate-600">
                  This is a direct purchase order that will be processed immediately without requiring approval. 
                  Use this for urgent or small purchases that don't need management approval.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">How to create a Material Order:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                  <li>Select an item from the inventory or add a new one</li>
                  <li>Enter the quantity needed</li>
                  <li>Select a supplier or add a new one</li>
                  <li>Add any special notes if needed</li>
                  <li>Click "Create Material Order" to submit</li>
                </ol>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 className="font-semibold text-amber-800 mb-2">Note</h4>
                <p className="text-sm text-slate-600">
                  This order will be sent directly to the purchasing department for processing. 
                  You can track its status in the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
