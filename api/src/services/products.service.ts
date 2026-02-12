import pool from "../db/pool";

// Utility to validate product input
function validateProductInput(data: any, isUpdate = false) {
    const { name, sku, price, stock } = data;

    if (!isUpdate) {
        if (!name || !sku) throw new Error("Product 'name' and 'sku' are required.");
    }

    if (price !== undefined && price < 0) throw new Error("'price' must be >= 0.");
    if (stock !== undefined && stock < 0) throw new Error("'stock' must be >= 0.");
}

// -------------------------------------------------------
// GET products with optional search and sorting
// -------------------------------------------------------
export async function getProducts(query: any) {
    const { search, sort = "name", direction = "asc" } = query;

    const validSortFields = ["price_cents", "name"];
    const validDirections = ["asc", "desc"];

    if (!validSortFields.includes(sort)) throw new Error("Invalid sort field.");
    if (!validDirections.includes(direction.toLowerCase())) throw new Error("Invalid sort direction.");

    let sql = "SELECT * FROM products";
    const params: any[] = [];

    if (search) {
        params.push(`%${search.toLowerCase()}%`);
        sql += ` WHERE LOWER(name) LIKE $${params.length}`;
    }

    sql += ` ORDER BY ${sort} ${direction.toUpperCase()}`;

    try {
        const { rows } = await pool.query(sql, params);
        return rows;
    } catch (err) {
        console.error("Error fetching products:", err);
        throw err;
    }
}

// -------------------------------------------------------
// CREATE a new product
// -------------------------------------------------------
export async function createProduct(data: any) {
    validateProductInput(data);

    const { name, sku, price, stock } = data;
    const price_cents = price !== undefined ? Math.round(price * 100) : 0;
    const stock_qty = stock !== undefined ? stock : 0;

    try {
        const { rows } = await pool.query(
            `INSERT INTO products (name, sku, price_cents, stock_qty) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, sku, price_cents, stock_qty]
        );

        return rows[0];
    } catch (err: any) {
        if (err.code === "23505") {
            // Unique violation for SKU
            throw new Error(`Product with SKU '${sku}' already exists.`);
        }
        console.error("Error creating product:", err);
        throw err;
    }
}

// -------------------------------------------------------
// UPDATE an existing product
// -------------------------------------------------------
export async function updateProduct(id: number, data: any) {
    if (!id) throw new Error("Product ID is required.");
    validateProductInput(data, true);

    const { price, stock } = data;
    const price_cents = price !== undefined ? Math.round(price * 100) : null;
    const stock_qty = stock !== undefined ? stock : null;

    try {
        const { rows } = await pool.query(
            `UPDATE products 
       SET price_cents = COALESCE($1, price_cents), 
           stock_qty   = COALESCE($2, stock_qty) 
       WHERE id = $3 
       RETURNING *`,
            [price_cents, stock_qty, id]
        );

        if (!rows.length) throw new Error(`Product with ID ${id} not found.`);
        return rows[0];
    } catch (err) {
        console.error("Error updating product:", err);
        throw err;
    }
}
