import pool from "../db/pool";

// Utility: validate order input
function validateOrderInput(data: any) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("Order must include at least one item.");
    }

    for (const item of data.items) {
        if (!item.product_id || item.qty === undefined || item.qty <= 0) {
            throw new Error("Each item must include product_id and qty > 0.");
        }
        if (item.price_at_purchase === undefined || item.price_at_purchase < 0) {
            throw new Error("Each item must include price_at_purchase >= 0.");
        }
    }
}

// -------------------------------------------------------
// GET all orders (optionally with pagination)
// -------------------------------------------------------
export async function getOrders(query: any) {
    const { limit = 50, offset = 0 } = query;

    try {
        const { rows } = await pool.query(
            `SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // Optionally fetch order items for each order
        const orderIds = rows.map((o) => o.id);
        let items: any[] = [];
        if (orderIds.length) {
            const { rows: itemRows } = await pool.query(
                `SELECT * FROM order_items WHERE order_id = ANY($1::int[])`,
                [orderIds]
            );
            items = itemRows;
        }

        return rows.map((order) => ({
            ...order,
            items: items.filter((i) => i.order_id === order.id),
        }));
    } catch (err) {
        console.error("Error fetching orders:", err);
        throw err;
    }
}

// -------------------------------------------------------
// GET a single order by ID
// -------------------------------------------------------
export async function getOrder(id: number, query: any) {
    try {
        const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
        if (!rows.length) throw new Error(`Order with ID ${id} not found.`);

        const { rows: items } = await pool.query(
            `SELECT * FROM order_items WHERE order_id = $1`,
            [id]
        );

        return { ...rows[0], items };
    } catch (err) {
        console.error("Error fetching order:", err);
        throw err;
    }
}

// -------------------------------------------------------
// CREATE a new order with items (transaction)
// -------------------------------------------------------
export async function createOrder(data: any) {
    validateOrderInput(data);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Create the order
        const { rows: orderRows } = await client.query(
            `INSERT INTO orders DEFAULT VALUES RETURNING *`
        );
        const order = orderRows[0];

        // Insert order items
        for (const item of data.items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, qty, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.qty, item.price_at_purchase]
            );
        }

        await client.query("COMMIT");

        // Fetch the complete order with items
        return getOrder(order.id, {});
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error creating order:", err);
        throw err;
    } finally {
        client.release();
    }
}