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
// GET all orders with items and total_amount
// -------------------------------------------------------
export async function getOrders(query: any) {
    const { limit = 50, offset = 0 } = query;

    try {
        // Fetch orders
        const { rows: orders } = await pool.query(
            `SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        if (!orders.length) return [];

        const orderIds = orders.map((o) => o.id);

        // Fetch order items
        const { rows: items } = await pool.query(
            `SELECT * FROM order_items WHERE order_id = ANY($1::int[])`,
            [orderIds]
        );

        // Attach items and calculate total_amount per order
        return orders.map((order) => {
            const orderItems = items.filter((i) => i.order_id === order.id);
            const total_amount = orderItems.reduce(
                (sum, i) => sum + i.price_at_purchase * i.qty,
                0
            );
            return { ...order, items: orderItems, total_amount };
        });
    } catch (err) {
        console.error("Error fetching orders:", err);
        throw err;
    }
}

// -------------------------------------------------------
// GET a single order with items and total_amount
// -------------------------------------------------------
export async function getOrder(id: number, query: any) {
    try {
        const { rows: orders } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
        if (!orders.length) throw new Error(`Order with ID ${id} not found.`);
        const order = orders[0];

        const { rows: items } = await pool.query(
            `SELECT * FROM order_items WHERE order_id = $1`,
            [id]
        );

        const total_amount = items.reduce((sum, i) => sum + i.price_at_purchase * i.qty, 0);

        return { ...order, items, total_amount };
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

        // Insert the order
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

        // Return the complete order with items and total_amount
        return getOrder(order.id, {});
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error creating order:", err);
        throw err;
    } finally {
        client.release();
    }
}