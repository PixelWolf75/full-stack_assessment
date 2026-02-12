import pool from "../db/pool";

export async function getProducts(query: any) {
    const { search, sort } = query;

    let sql = "SELECT * FROM products";
    const params: any[] = [];

    if (search) {
        params.push(`%${search}%`);
        sql += ` WHERE name IS LIKE $${params.length}`;
    }

    if (sort === "price") sql += " ORDER BY price";
    if (sort === "name") sql += " ORDER BY name";

    const { rows } = await pool.query(sql, params);
    return rows;
}

export async function createProduct(data: any) {
    const { name, price, stock } = data;

    const { rows } = await pool.query(
        "INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *",
        [name, price, stock]
    );

    return rows[0];
}

export async function updateProduct(id: number, data: any) {
    const { price, stock } = data;

    const { rows } = await pool.query(
        "UPDATE products SET price = COALESCE($1, price), stock = COALESCE($2, stock) WHERE id = $3 RETURNING *",
        [price, stock, id]
    );

    return rows[0];
}
