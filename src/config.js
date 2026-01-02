// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Application configuration
export const APP_CONFIG = {
  // Default pagination settings
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
  },
  
  // Default date format
  dateFormat: 'yyyy-MM-dd',
  
  // Default currency
  currency: 'PHP',
  
  // Default theme
  theme: {
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    dangerColor: '#ef4444',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
  },
  
  // API endpoints
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
    purchaseOrders: '/api/purchase-orders',
    suppliers: '/api/suppliers',
    inventory: '/api/inventory',
  },
  
  // Feature flags
  features: {
    enableSupplierRating: true,
    enablePurchaseOrderApproval: true,
    enableInventoryTracking: true,
  },
};

export default {
  API_BASE_URL,
  ...APP_CONFIG,
};
