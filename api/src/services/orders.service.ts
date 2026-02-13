import pool from "../db/pool";
import { CreateOrderBody } from "../db/types";

// -------------------------------------------------------
// GET all orders with totals
// -------------------------------------------------------
export async function getOrders(query: any) {
    const { limit = 50, offset = 0 } = query;

    const { rows } = await pool.query(
        `SELECT
       o.id,
       o.created_at,
       COALESCE(SUM(oi.price_at_purchase * oi.qty), 0) AS total_cents,
       COALESCE(COUNT(oi.id), 0)                        AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    return rows;
}

// -------------------------------------------------------
// GET a single order with all its items
// -------------------------------------------------------
export async function getOrder(id: number, query: any) {
    if (!id || isNaN(id)) throw new Error("Valid order ID is required.");

    const { rows: orderRows } = await pool.query(
        `SELECT * FROM orders WHERE id = $1`,
        [id]
    );

    if (!orderRows.length) throw new Error(`Order with ID ${id} not found.`);

    const { rows: itemRows } = await pool.query(
        `SELECT
       oi.id,
       oi.order_id,
       oi.product_id,
       oi.qty,
       oi.price_at_purchase,
       p.name AS product_name,
       p.sku  AS product_sku
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
        [id]
    );

    const total_cents = itemRows.reduce(
        (sum, item) => sum + item.price_at_purchase * item.qty,
        0
    );

    return { ...orderRows[0], total_cents, items: itemRows };
}

// -------------------------------------------------------
// CREATE a new order (fully transactional)
//
// price_at_purchase is fetched from the DB — never trusted
// from the client. Stock is checked before insert and
// reduced after. If anything fails the whole order rolls back.
// -------------------------------------------------------
export async function createOrder(data: CreateOrderBody) {
    const { items } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Order must include at least one item.");
    }

    for (const item of items) {
        if (!item.product_id || !item.qty || item.qty <= 0) {
            throw new Error("Each item must include a valid product_id and qty > 0.");
        }
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Check every product exists and has sufficient stock BEFORE
        //    creating anything — prevents partial orders on failure
        for (const item of items) {
            const { rows } = await client.query(
                `SELECT id, name, stock_qty FROM products WHERE id = $1`,
                [item.product_id]
            );

            if (!rows.length) {
                throw new Error(`Product with ID ${item.product_id} not found.`);
            }

            if (rows[0].stock_qty < item.qty) {
                throw new Error(
                    `Not enough stock for "${rows[0].name}". ` +
                    `Requested: ${item.qty}, available: ${rows[0].stock_qty}.`
                );
            }
        }

        // 2. Create the order record
        const { rows: orderRows } = await client.query(
            `INSERT INTO orders DEFAULT VALUES RETURNING *`
        );
        const order = orderRows[0];

        // 3. For each item: snapshot the current price, insert the
        //    order_item row, and reduce stock
        for (const item of items) {
            const { rows: productRows } = await client.query(
                `SELECT price_cents FROM products WHERE id = $1`,
                [item.product_id]
            );
            const price_at_purchase = productRows[0].price_cents;

            await client.query(
                `INSERT INTO order_items (order_id, product_id, qty, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.qty, price_at_purchase]
            );

            await client.query(
                `UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2`,
                [item.qty, item.product_id]
            );
        }

        await client.query("COMMIT");

        return getOrder(order.id, {});
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}