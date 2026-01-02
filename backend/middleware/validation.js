const { validationResult, body, param } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Validation middleware
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = [];
        errors.array().map(err => extractedErrors.push({ 
            field: err.param, 
            message: err.msg 
        }));

        throw new ValidationError('Validation failed', extractedErrors);
    };
};

// Validation schemas
const createPOSchema = [
    body('supplier_id').isInt().withMessage('Supplier ID must be an integer'),
    body('expected_delivery_date').isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.item_name').notEmpty().withMessage('Item name is required'),
    body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('items.*.unit_price').isFloat({ min: 0.01 }).withMessage('Unit price must be greater than 0')
];

const updateStatusSchema = [
    param('id').isInt().withMessage('Invalid PO ID'),
    body('status').isIn(['draft', 'approved', 'purchased', 'received', 'completed']).withMessage('Invalid status')
];

const addRatingSchema = [
    param('id').isInt().withMessage('Invalid PO ID'),
    body('delivery_rating').isInt({ min: 1, max: 5 }).withMessage('Delivery rating must be between 1 and 5'),
    body('quality_rating').isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
    body('price_rating').isInt({ min: 1, max: 5 }).withMessage('Price rating must be between 1 and 5')
];

module.exports = {
    validate,
    createPOSchema,
    updateStatusSchema,
    addRatingSchema
};
