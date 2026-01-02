import React, { useState, useEffect } from 'react';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { generatePurchaseOrderPDF } from '../../../services/pdfService';
import POList from './POList';
import PODetail from './PODetail.jsx';
import CreatePOForm from './CreatePOForm.jsx';
import ManagerSelectModal from './ManagerSelectModal.jsx';
import SupplierRatingModal from './SupplierRatingModal.jsx';
import { useSystem } from '../../../context/SystemContext';

export default function PurchaseOrderView({ currentRole = 'DEPARTMENT' }) {
  const { inventory, suppliers, rateSupplier: rateSupplierInContext } = useSystem();
  
  // Map role to user object for compatibility
  const user = {
    id: currentRole === 'DEPARTMENT' ? 1 : 2,
    role: currentRole === 'DEPARTMENT' ? 'owner' : 'manager',
    name: currentRole === 'DEPARTMENT' ? 'Department Head' : 'General Manager',
    email: currentRole === 'DEPARTMENT' ? 'dept@mochkris.com' : 'manager@mochkris.com'
  };
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPOForRating, setSelectedPOForRating] = useState(null);

  useEffect(() => {
    loadPurchaseOrders();
  }, [user]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseOrderService.getAllPOs();
      setPurchaseOrders(response.data?.pos || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (poData) => {
    try {
      // Transform data for API
      const apiData = {
        supplier_id: parseInt(poData.supplierId),
        expected_delivery_date: poData.expectedDelivery,
        notes: poData.notes || '',
        items: poData.items.map(item => ({
          item_name: item.name,
          description: item.description || '',
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unitPrice),
          product_id: item.productId ? parseInt(item.productId) : null
        }))
      };

      const response = await purchaseOrderService.createPO(apiData);
      await loadPurchaseOrders();
      setShowCreateForm(false);
      setSelectedPO(response.data?.po);
    } catch (err) {
      alert(`Error creating PO: ${err.message}`);
      console.error('Error creating PO:', err);
    }
  };

  const handleApproveAndAssign = async (poId, managerId) => {
    try {
      await purchaseOrderService.approveAndAssign(poId, managerId);
      await loadPurchaseOrders();
      setShowManagerModal(false);
      // Reload selected PO
      if (selectedPO?.id === poId) {
        const response = await purchaseOrderService.getPO(poId);
        setSelectedPO(response.data?.po);
      }
    } catch (err) {
      alert(`Error approving PO: ${err.message}`);
      console.error('Error approving PO:', err);
    }
  };

  const handleMarkPurchased = async (poId) => {
    try {
      await purchaseOrderService.markPurchased(poId);
      await loadPurchaseOrders();
      // Reload selected PO
      if (selectedPO?.id === poId) {
        const response = await purchaseOrderService.getPO(poId);
        setSelectedPO(response.data?.po);
      }
    } catch (err) {
      alert(`Error marking as purchased: ${err.message}`);
      console.error('Error marking as purchased:', err);
    }
  };

  const handleReceiveItems = async (poId, items) => {
    try {
      // Transform items for API
      const apiItems = items.map(item => ({
        item_id: item.id,
        received_quantity: parseFloat(item.received_quantity || item.receivedQty || 0),
        discrepancy_notes: item.discrepancy_notes || item.discrepancyNotes || null,
        product_id: item.product_id || item.productId || null
      }));

      await purchaseOrderService.receiveItems(poId, apiItems);
      await loadPurchaseOrders();
      // Reload selected PO
      if (selectedPO?.id === poId) {
        const response = await purchaseOrderService.getPO(poId);
        setSelectedPO(response.data?.po);
      }
    } catch (err) {
      alert(`Error receiving items: ${err.message}`);
      console.error('Error receiving items:', err);
    }
  };

  const handleRateSupplier = async (poId, ratingData) => {
    try {
      // 1. Update the backend
      await purchaseOrderService.rateSupplier(poId, ratingData);
      
      // 2. Update the SystemContext
      if (selectedPOForRating?.supplier_id) {
        // Calculate the average rating from all rating dimensions
        const { delivery_rating, quality_rating, price_rating } = ratingData;
        const averageRating = (delivery_rating + quality_rating + price_rating) / 3;
        
        await rateSupplierInContext(poId, {
          supplierId: selectedPOForRating.supplier_id,
          rating: averageRating,
          comment: ratingData.notes || 'Rated from PO',
          ratedBy: user.id
        });
      }

      // 3. Update the UI
      setShowRatingModal(false);
      setSelectedPOForRating(null);
      loadPurchaseOrders();
      
      if (selectedPO?.id === poId) {
        // Refresh the selected PO data
        const response = await purchaseOrderService.getPO(poId);
        setSelectedPO(response.data?.po);
      }
    } catch (err) {
      setError(`Failed to submit rating: ${err.message}`);
      console.error('Error rating supplier:', err);
    }
  };

  const handleDownloadPDF = async (poId) => {
    try {
      // Get the full PO details
      const response = await purchaseOrderService.getPO(poId);
      const po = response.data?.po;
      
      if (!po) {
        throw new Error('Could not load PO details');
      }
      
      // Generate and download the PDF
      await generatePurchaseOrderPDF(po);
    } catch (err) {
      alert(`Error generating PDF: ${err.message}`);
      console.error('Error generating PDF:', err);
    }
  };

  const handleAction = async (action, po) => {
    switch (action) {
      case 'approve':
        setShowManagerModal(true);
        break;
      case 'markPurchased':
        if (window.confirm('Mark this PO as purchased?')) {
          await handleMarkPurchased(po.id);
        }
        break;
      case 'receive':
        // Handle receive - items should already be updated in state
        const itemsToReceive = po.items.map(item => ({
          id: item.id,
          received_quantity: item.received_quantity || item.receivedQty || 0,
          discrepancy_notes: item.discrepancy_notes || item.discrepancyNotes || null,
          product_id: item.product_id || item.productId || null
        }));
        await handleReceiveItems(po.id, itemsToReceive);
        break;
      case 'updateReceivedQty':
        // Just update local state, don't save yet
        setSelectedPO(po);
        break;
      case 'rateSupplier':
        setSelectedPOForRating(po);
        setShowRatingModal(true);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  // Transform PO data for frontend components
  const transformPO = (po) => {
    return {
      id: po.id,
      poNumber: po.po_number || po.poNumber,
      supplierId: po.supplier_id,
      supplier: {
        id: po.supplier_id,
        name: po.supplier_name,
        contact: po.supplier_contact,
        email: po.supplier_email,
        phone: po.supplier_phone,
        address: po.supplier_address
      },
      status: po.status,
      expectedDelivery: po.expected_delivery_date,
      purchaseDate: po.purchase_date,
      receivedDate: po.received_date,
      notes: po.notes,
      items: po.items || [],
      createdAt: po.created_at,
      owner: {
        id: po.owner_id,
        name: po.owner_name
      },
      manager: {
        id: po.manager_id,
        name: po.manager_name
      },
      approver: {
        id: po.approved_by,
        name: po.approver_name
      },
      history: po.history || [],
      ratings: po.ratings || [],
      supplierRated: (po.ratings || []).length > 0
    };
  };

  if (loading && purchaseOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading purchase orders...</div>
      </div>
    );
  }

  if (selectedPO) {
    return (
      <>
        <PODetail
          po={transformPO(selectedPO)}
          currentUser={user}
          onBack={() => setSelectedPO(null)}
          onAction={handleAction}
          suppliers={suppliers}
          onDownloadPDF={handleDownloadPDF}
          onRateSupplier={() => {
            setSelectedPOForRating(selectedPO);
            setShowRatingModal(true);
          }}
        />
        {showManagerModal && (
          <ManagerSelectModal
            onSelect={(managerId) => handleApproveAndAssign(selectedPO.id, managerId)}
            onClose={() => setShowManagerModal(false)}
            currentManagerId={selectedPO.manager_id}
          />
        )}
        {showRatingModal && selectedPOForRating && (
          <SupplierRatingModal
            po={transformPO(selectedPOForRating)}
            onRate={(ratingData) => handleRateSupplier(selectedPOForRating.id, ratingData)}
            onClose={() => {
              setShowRatingModal(false);
              setSelectedPOForRating(null);
            }}
          />
        )}
      </>
    );
  }

  if (showCreateForm) {
    return (
      <CreatePOForm
        inventory={inventory}
        suppliers={suppliers}
        currentUser={user}
        onSubmit={handleCreatePO}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  const transformedPOs = purchaseOrders.map(transformPO);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      <POList
        purchaseOrders={transformedPOs}
        onSelectPO={(po) => {
          // Load full PO details
          purchaseOrderService.getPO(po.id)
            .then(response => setSelectedPO(response.data?.po))
            .catch(err => {
              alert(`Error loading PO: ${err.message}`);
              console.error('Error loading PO:', err);
            });
        }}
        onCreateNew={() => setShowCreateForm(true)}
        currentUser={user}
      />
    </div>
  );
}

