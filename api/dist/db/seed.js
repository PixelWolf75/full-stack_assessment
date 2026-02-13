"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("./pool"));
const products = [
    { name: 'Laptop Pro 15"', sku: 'LAP-001', price_cents: 129999, stock_qty: 25 },
    { name: 'Wireless Mouse', sku: 'MOU-001', price_cents: 2999, stock_qty: 100 },
    { name: 'Mechanical Keyboard', sku: 'KEY-001', price_cents: 8999, stock_qty: 50 },
    { name: 'USB-C Hub 7-in-1', sku: 'HUB-001', price_cents: 4999, stock_qty: 75 },
    { name: 'Monitor 27" 4K', sku: 'MON-001', price_cents: 39999, stock_qty: 30 },
    { name: 'Webcam HD 1080p', sku: 'CAM-001', price_cents: 6999, stock_qty: 60 },
    { name: 'Desk Lamp LED', sku: 'LMP-001', price_cents: 3499, stock_qty: 80 },
    { name: 'External SSD 1TB', sku: 'SSD-001', price_cents: 11999, stock_qty: 45 },
    { name: 'Laptop Stand Aluminium', sku: 'STD-001', price_cents: 2499, stock_qty: 120 },
    { name: 'Noise-Cancelling Headphones', sku: 'HPH-001', price_cents: 24999, stock_qty: 35 },
    { name: 'Ergonomic Office Chair', sku: 'CHR-001', price_cents: 34999, stock_qty: 15 },
    { name: 'Desk Mat XXL', sku: 'MAT-001', price_cents: 1999, stock_qty: 90 },
    { name: 'Phone Stand Adjustable', sku: 'PHS-001', price_cents: 1499, stock_qty: 150 },
    { name: 'Cable Organizer Kit', sku: 'CAB-001', price_cents: 899, stock_qty: 200 },
    { name: 'Wireless Charger 15W', sku: 'CHG-001', price_cents: 3999, stock_qty: 70 },
];
async function seed() {
    const client = await pool_1.default.connect();
    try {
        console.log('🌱 Seeding database...');
        await client.query('BEGIN');
        for (const product of products) {
            await client.query(`INSERT INTO products (name, sku, price_cents, stock_qty)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (sku) DO NOTHING`, [product.name, product.sku, product.price_cents, product.stock_qty]);
        }
        await client.query('COMMIT');
        // Show count of what was seeded
        const { rows } = await client.query('SELECT COUNT(*) FROM products');
        console.log(`Seed complete — ${rows[0].count} products in database`);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', err);
        throw err;
    }
    finally {
        client.release();
    }
}
exports.default = seed;
