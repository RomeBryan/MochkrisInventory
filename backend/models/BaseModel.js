const db = require('../db');

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async findAll(conditions = {}) {
        let query = `SELECT * FROM ${this.tableName}`;
        const values = [];
        const whereClauses = [];
        
        Object.entries(conditions).forEach(([key, value], index) => {
            whereClauses.push(`${key} = $${index + 1}`);
            values.push(value);
        });

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        const { rows } = await db.query(query, values);
        return rows;
    }

    async create(data) {
        const fields = Object.keys(data);
        const placeholders = fields.map((_, i) => `$${i + 1}`);
        const values = fields.map(field => data[field]);
        
        const query = `
            INSERT INTO ${this.tableName} (${fields.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async update(id, data) {
        const fields = Object.keys(data);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        const values = [...Object.values(data), id];
        
        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}
            WHERE id = $${fields.length + 1}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = BaseModel;
