import pool from './pool';

async function createSchema(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('🔧 Running schema migrations...');

    await client.query('BEGIN');

    // -------------------------------------------------------
    // Products table
    // -------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        sku         VARCHAR(100) NOT NULL UNIQUE,
        price_cents INTEGER      NOT NULL CHECK (price_cents >= 0),
        stock_qty   INTEGER      NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // -------------------------------------------------------
    // Orders table
    // -------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id         SERIAL PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // -------------------------------------------------------
    // Order items table
    // -------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id                SERIAL PRIMARY KEY,
        order_id          INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
        product_id        INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        qty               INTEGER NOT NULL CHECK (qty > 0),
        price_at_purchase INTEGER NOT NULL CHECK (price_at_purchase >= 0)
      )
    `);

    // -------------------------------------------------------
    // Indexes for common query patterns
    // -------------------------------------------------------
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_sku
        ON products(sku)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name
        ON products(LOWER(name))
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id
        ON order_items(order_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id
        ON order_items(product_id)
    `);

    await client.query('COMMIT');

    console.log('✅ Schema created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Schema migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default createSchema;
