-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    owner_id INTEGER NOT NULL,  -- References users table
    manager_id INTEGER,          -- Assigned manager
    status VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft, approved, purchased, received, completed
    expected_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PO Items table
CREATE TABLE IF NOT EXISTS po_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Ratings table
CREATE TABLE IF NOT EXISTS supplier_ratings (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id),
    delivery_rating INTEGER CHECK (delivery_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    price_rating INTEGER CHECK (price_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_suppliers_modtime
BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_purchase_orders_modtime
BEFORE UPDATE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Indexes for better performance
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_po_items_po_id ON po_items(po_id);
CREATE INDEX idx_supplier_ratings_po_id ON supplier_ratings(po_id);

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.po_number := 'PO-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate PO number before insert
CREATE TRIGGER trg_generate_po_number
BEFORE INSERT ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION generate_po_number();
