const BaseModel = require('./BaseModel');

class Supplier extends BaseModel {
    constructor() {
        super('suppliers');
    }

    async findByName(name) {
        const query = 'SELECT * FROM suppliers WHERE name ILIKE $1';
        const { rows } = await this.db.query(query, [`%${name}%`]);
        return rows;
    }

    async search(query) {
        const searchQuery = `
            SELECT * FROM suppliers 
            WHERE name ILIKE $1 
               OR contact_person ILIKE $1
               OR email ILIKE $1
               OR phone ILIKE $1
        `;
        const { rows } = await this.db.query(searchQuery, [`%${query}%`]);
        return rows;
    }
}

module.exports = new Supplier();
