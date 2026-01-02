const express = require('express');
const { body, param } = require('express-validator');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { validate } = require('../middleware/validation');
const { auth, ownerOnly, ownerOrManager } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Create a new PO
router.post(
    '/',
    [
        body('supplier_id').isInt().withMessage('Supplier ID must be an integer'),
        body('expected_delivery_date').isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD'),
        body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
        body('items.*.item_name').notEmpty().withMessage('Item name is required'),
        body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
        body('items.*.unit_price').isFloat({ min: 0.01 }).withMessage('Unit price must be greater than 0')
    ],
    validate,
    purchaseOrderController.createPO
);

// Get all POs with optional status filter
router.get('/', purchaseOrderController.getAllPOs);

// Get PO statistics
router.get('/stats', purchaseOrderController.getStats);

// Get a single PO by ID
router.get(
    '/:id',
    [param('id').isInt().withMessage('Invalid PO ID')],
    validate,
    purchaseOrderController.getPO
);

// Update PO status
router.patch(
    '/:id/status',
    [
        param('id').isInt().withMessage('Invalid PO ID'),
        body('status').isIn(['approved', 'purchased', 'received', 'completed', 'cancelled'])
            .withMessage('Invalid status')
    ],
    validate,
    purchaseOrderController.updateStatus
);

// Add supplier rating
router.post(
    '/:id/ratings',
    [
        param('id').isInt().withMessage('Invalid PO ID'),
        body('delivery_rating').isInt({ min: 1, max: 5 })
            .withMessage('Delivery rating must be between 1 and 5'),
        body('quality_rating').isInt({ min: 1, max: 5 })
            .withMessage('Quality rating must be between 1 and 5'),
        body('price_rating').isInt({ min: 1, max: 5 })
            .withMessage('Price rating must be between 1 and 5')
    ],
    validate,
    purchaseOrderController.addRating
);

module.exports = router;
