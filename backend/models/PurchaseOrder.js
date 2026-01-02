const BaseModel = require('./BaseModel');
const db = require('../db');

class PurchaseOrder extends BaseModel {
    constructor() {
        super('purchase_orders');
    }

    async createWithItems(poData, items) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            // Insert PO
            const poQuery = `
                INSERT INTO purchase_orders 
                (supplier_id, owner_id, manager_id, expected_delivery_date, notes, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const poValues = [
                poData.supplier_id,
                poData.owner_id,
                poData.manager_id,
                poData.expected_delivery_date,
                poData.notes || null,
                poData.status || 'draft'
            ];
            
            const poResult = await client.query(poQuery, poValues);
            const po = poResult.rows[0];
            
            // Insert PO Items
            if (items && items.length > 0) {
                const itemValues = [];
                let itemCount = 1;
                
                const itemInsert = `
                    INSERT INTO po_items 
                    (po_id, item_name, description, quantity, unit_price)
                    VALUES ${items.map((_, i) => 
                        `($${itemCount++}, $${itemCount++}, $${itemCount++}, $${itemCount++}, $${itemCount++})`
                    ).join(', ')}
                    RETURNING *
                `;
                
                items.forEach(item => {
                    itemValues.push(
                        po.id,
                        item.item_name,
                        item.description || null,
                        item.quantity,
                        item.unit_price
                    );
                });
                
                await client.query(itemInsert, itemValues);
            }
            
            await client.query('COMMIT');
            return this.findByIdWithDetails(po.id);
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findByIdWithDetails(id) {
        const query = `
            SELECT 
                po.*,
                s.name as supplier_name,
                s.contact_person as supplier_contact,
                s.email as supplier_email,
                s.phone as supplier_phone,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', pi.id,
                            'item_name', pi.item_name,
                            'description', pi.description,
                            'quantity', pi.quantity,
                            'unit_price', pi.unit_price,
                            'total_price', pi.total_price
                        )
                    )
                    FROM po_items pi 
                    WHERE pi.po_id = po.id
                ) as items
            FROM purchase_orders po
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.id = $1
            GROUP BY po.id, s.id
        `;
        
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async updateStatus(id, status, userId) {
        const query = `
            UPDATE purchase_orders 
            SET status = $1,
                ${status === 'approved' ? 'approved_by = $3, approved_at = NOW(),' : ''}
                updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        
        const values = status === 'approved' ? [status, id, userId] : [status, id];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async findByStatus(status, userId, role) {
        let query = `
            SELECT 
                po.*,
                s.name as supplier_name,
                (SELECT SUM(total_price) FROM po_items WHERE po_id = po.id) as total_amount
            FROM purchase_orders po
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.status = $1
        `;
        
        const values = [status];
        
        // Filter by user role
        if (role === 'owner') {
            query += ' AND po.owner_id = $2';
            values.push(userId);
        } else if (role === 'manager') {
            query += ' AND po.manager_id = $2';
            values.push(userId);
        }
        
        query += ' ORDER BY po.updated_at DESC';
        
        const { rows } = await db.query(query, values);
        return rows;
    }

    async addRating(poId, ratingData) {
        const { delivery_rating, quality_rating, price_rating, notes } = ratingData;
        
        const query = `
            INSERT INTO supplier_ratings 
            (po_id, delivery_rating, quality_rating, price_rating, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const { rows } = await db.query(query, [
            poId, 
            delivery_rating, 
            quality_rating, 
            price_rating, 
            notes || null
        ]);
        
        return rows[0];
    }
}

module.exports = new PurchaseOrder();
