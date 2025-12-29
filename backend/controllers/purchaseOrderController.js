const db = require('../db');
const PurchaseOrder = require('../models/PurchaseOrder');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

// Create a new purchase order
const createPO = async (req, res, next) => {
    try {
        const { supplier_id, expected_delivery_date, notes, items } = req.body;
        const owner_id = req.user.id;
        const manager_id = req.user.role === 'manager' ? req.user.id : null;

        const poData = {
            supplier_id,
            owner_id,
            manager_id,
            expected_delivery_date,
            notes,
            status: 'draft'
        };

        const po = await PurchaseOrder.createWithItems(poData, items);
        
        res.status(201).json({
            status: 'success',
            data: {
                po
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all POs with optional status filter
const getAllPOs = async (req, res, next) => {
    try {
        const { status } = req.query;
        let pos;
        
        if (status) {
            pos = await PurchaseOrder.findByStatus(status, req.user.id, req.user.role);
        } else {
            // Get all POs with role-based filtering
            let query = `
                SELECT 
                    po.*,
                    s.name as supplier_name,
                    (SELECT SUM(total_price) FROM po_items WHERE po_id = po.id) as total_amount
                FROM purchase_orders po
                LEFT JOIN suppliers s ON po.supplier_id = s.id
            `;
            
            const values = [];
            
            // Apply role-based filtering
            if (req.user.role === 'owner') {
                query += ' WHERE po.owner_id = $1';
                values.push(req.user.id);
            } else if (req.user.role === 'manager') {
                query += ' WHERE po.manager_id = $1';
                values.push(req.user.id);
            }
            
            query += ' ORDER BY po.updated_at DESC';
            
            const { rows } = await db.query(query, values);
            pos = rows;
        }
        
        res.status(200).json({
            status: 'success',
            results: pos.length,
            data: {
                pos
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get a single PO by ID
const getPO = async (req, res, next) => {
    try {
        const po = await PurchaseOrder.findByIdWithDetails(req.params.id);
        
        if (!po) {
            throw new NotFoundError('Purchase order not found');
        }
        
        // Check permissions
        if (req.user.role === 'owner' && po.owner_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to access this resource');
        }
        
        if (req.user.role === 'manager' && po.manager_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to access this resource');
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                po
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update PO status
const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Get the current PO
        const po = await PurchaseOrder.findById(id);
        if (!po) {
            throw new NotFoundError('Purchase order not found');
        }
        
        // Validate status transition
        const validTransitions = {
            draft: ['approved', 'cancelled'],
            approved: ['purchased', 'cancelled'],
            purchased: ['received'],
            received: ['completed'],
            cancelled: []
        };
        
        if (!validTransitions[po.status]?.includes(status)) {
            throw new BadRequestError(`Cannot transition from ${po.status} to ${status}`);
        }
        
        // Check permissions
        if (status === 'approved' && userRole !== 'owner') {
            throw new ForbiddenError('Only owners can approve POs');
        }
        
        // Update status
        const updatedPO = await PurchaseOrder.updateStatus(id, status, userId);
        
        res.status(200).json({
            status: 'success',
            data: {
                po: updatedPO
            }
        });
    } catch (error) {
        next(error);
    }
};

// Add supplier rating
const addRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { delivery_rating, quality_rating, price_rating, notes } = req.body;
        
        // Check if PO exists and is in received or completed status
        const po = await PurchaseOrder.findById(id);
        if (!po) {
            throw new NotFoundError('Purchase order not found');
        }
        
        if (!['received', 'completed'].includes(po.status)) {
            throw new BadRequestError('Cannot rate a PO that has not been received');
        }
        
        // Check if already rated
        const existingRating = await db.query(
            'SELECT * FROM supplier_ratings WHERE po_id = $1', 
            [id]
        );
        
        if (existingRating.rows.length > 0) {
            throw new BadRequestError('This PO has already been rated');
        }
        
        // Add rating
        const rating = await PurchaseOrder.addRating(id, {
            delivery_rating,
            quality_rating,
            price_rating,
            notes
        });
        
        res.status(201).json({
            status: 'success',
            data: {
                rating
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get PO statistics
const getStats = async (req, res, next) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                COUNT(*) as total_pos,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN status = 'purchased' THEN 1 ELSE 0 END) as purchased_count,
                SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
                COALESCE((
                    SELECT AVG((delivery_rating + quality_rating + price_rating) / 3.0)
                    FROM supplier_ratings
                ), 0) as avg_supplier_rating
            FROM purchase_orders
            WHERE owner_id = $1
        `, [req.user.id]);
        
        res.status(200).json({
            status: 'success',
            data: {
                stats: rows[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPO,
    getAllPOs,
    getPO,
    updateStatus,
    addRating,
    getStats
};
