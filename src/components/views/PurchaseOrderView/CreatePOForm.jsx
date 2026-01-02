import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function CreatePOForm({ 
  inventory, 
  suppliers, 
  currentUser, 
  onSubmit, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDelivery: '',
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: '' }]
  });
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    // Filter out products that are already in the form
    const selectedProductIds = formData.items.map(item => item.productId).filter(Boolean);
    setAvailableProducts(
      inventory.filter(item => !selectedProductIds.includes(item.product_id.toString()))
    );
  }, [formData.items, inventory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }
    
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    
    const itemsWithDetails = formData.items.map(item => {
      const product = inventory.find(p => p.product_id.toString() === item.productId);
      return {
        ...item,
        name: product?.name || 'Unknown Product',
        unit: product?.unit || 'pcs',
        unitPrice: parseFloat(item.unitPrice) || 0,
        quantity: parseInt(item.quantity) || 1
      };
    });
    
    const newPO = {
      ...formData,
      items: itemsWithDetails,
      createdBy: currentUser.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
      history: [{
        timestamp: new Date().toISOString(),
        status: 'draft',
        userId: currentUser.id,
        userName: currentUser.name,
        notes: 'PO created'
      }]
    };
    
    onSubmit(newPO);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: '' }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, update unit price if not set
    if (field === 'productId' && value) {
      const product = inventory.find(p => p.product_id.toString() === value);
      if (product && !newItems[index].unitPrice) {
        newItems[index].unitPrice = product.price || '';
      }
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const getProductOptions = (currentIndex) => {
    const selectedProductIds = formData.items
      .filter((_, idx) => idx !== currentIndex)
      .map(item => item.productId)
      .filter(Boolean);
    
    return inventory.filter(item => !selectedProductIds.includes(item.product_id.toString()));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Create New Purchase Order</h3>
        <button 
          onClick={onCancel} 
          className="text-gray-500 hover:text-gray-700"
          type="button"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.supplierId}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery
            </label>
            <input
              type="date"
              value={formData.expectedDelivery}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                expectedDelivery: e.target.value
              }))}
              className="w-full p-2 border rounded-md"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Items <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              disabled={availableProducts.length === 0}
              title={availableProducts.length === 0 ? 'No more products available' : ''}
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
          
          {formData.items.length === 0 ? (
            <div className="text-center py-4 text-gray-500 border rounded-md">
              No items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const productOptions = getProductOptions(index);
                const selectedProduct = inventory.find(
                  p => p.product_id.toString() === item.productId
                );
                
                return (
                  <div key={index} className="border rounded-md p-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-12 md:col-span-5">
                        <label className="block text-xs text-gray-500 mb-1">Item</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">Select Item</option>
                          {productOptions.map(product => (
                            <option key={product.product_id} value={product.product_id}>
                              {product.name} ({product.unit || 'pcs'})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                      
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Unit Price (₱)</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            className="w-full p-2 border rounded-md text-sm pl-8"
                            placeholder="0.00"
                          />
                          <span className="absolute left-2 top-2 text-gray-500 text-sm">₱</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {selectedProduct && (
                        <div className="col-span-12 text-xs text-gray-500">
                          <span className="font-medium">In stock:</span> {selectedProduct.qty || 0} {selectedProduct.unit || 'pcs'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            className="w-full p-2 border rounded-md text-sm"
            rows="2"
            placeholder="Any special instructions or notes..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            disabled={formData.items.length === 0}
          >
            Create Purchase Order
          </button>
        </div>
      </form>
    </div>
  );
}
