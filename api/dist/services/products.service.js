"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
const pool_1 = __importDefault(require("../db/pool"));
// -------------------------------------------------------
// GET products with optional search and sorting
// -------------------------------------------------------
async function getProducts(query) {
    const { search, sort = "name", direction = "asc" } = query;
    const validSortFields = ["name", "price_cents", "stock_qty", "created_at"];
    const validDirections = ["asc", "desc"];
    if (!validSortFields.includes(sort)) {
        throw new Error(`Invalid sort field. Must be one of: ${validSortFields.join(", ")}`);
    }
    if (!validDirections.includes(direction.toLowerCase())) {
        throw new Error("Invalid sort direction. Must be 'asc' or 'desc'.");
    }
    let sql = "SELECT * FROM products";
    const params = [];
    if (search) {
        params.push(`%${search.toLowerCase()}%`);
        sql += ` WHERE LOWER(name) LIKE $${params.length}`;
    }
    sql += ` ORDER BY ${sort} ${direction.toUpperCase()}`;
    const { rows } = await pool_1.default.query(sql, params);
    return rows;
}
// -------------------------------------------------------
// CREATE a new product
// Accepts price_cents and stock_qty directly — no conversion
// -------------------------------------------------------
async function createProduct(data) {
    const { name, sku, price_cents, stock_qty } = data;
    if (!name || !sku) {
        throw new Error("'name' and 'sku' are required.");
    }
    if (price_cents === undefined || price_cents < 0) {
        throw new Error("'price_cents' must be a number >= 0.");
    }
    if (stock_qty !== undefined && stock_qty < 0) {
        throw new Error("'stock_qty' must be >= 0.");
    }
    try {
        const { rows } = await pool_1.default.query(`INSERT INTO products (name, sku, price_cents, stock_qty)
             VALUES ($1, $2, $3, $4)
             RETURNING *`, [name, sku, price_cents, stock_qty ?? 0]);
        return rows[0];
    }
    catch (err) {
        if (err.code === "23505") {
            throw new Error(`Product with SKU '${sku}' already exists.`);
        }
        throw err;
    }
}
// -------------------------------------------------------
// UPDATE price and/or stock on an existing product
// -------------------------------------------------------
async function updateProduct(id, data) {
    if (!id)
        throw new Error("Product ID is required.");
    const { price_cents, stock_qty } = data;
    if (price_cents !== undefined && price_cents < 0) {
        throw new Error("'price_cents' must be >= 0.");
    }
    if (stock_qty !== undefined && stock_qty < 0) {
        throw new Error("'stock_qty' must be >= 0.");
    }
    const { rows } = await pool_1.default.query(`UPDATE products
     SET price_cents = COALESCE($1, price_cents),
         stock_qty   = COALESCE($2, stock_qty)
     WHERE id = $3
     RETURNING *`, [price_cents ?? null, stock_qty ?? null, id]);
    if (!rows.length)
        throw new Error(`Product with ID ${id} not found.`);
    return rows[0];
}
