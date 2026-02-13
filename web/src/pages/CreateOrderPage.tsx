import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Product, OrderItemInput } from '../types';
import { formatPrice } from '../utils';

interface CartItem {
  product: Product;
  qty: number;
}

export default function CreateOrderPage({ onOrderCreated }: { onOrderCreated: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart,     setCart]     = useState<CartItem[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  function getCartItem(productId: number) {
    return cart.find(c => c.product.id === productId);
  }

  function setQty(product: Product, qty: number) {
    if (qty <= 0) {
      setCart(c => c.filter(item => item.product.id !== product.id));
      return;
    }
    const capped = Math.min(qty, product.stock_qty);
    setCart(c => {
      const existing = c.find(item => item.product.id === product.id);
      if (existing) return c.map(item => item.product.id === product.id ? { ...item, qty: capped } : item);
      return [...c, { product, qty: capped }];
    });
  }

  const totalCents = cart.reduce((sum, item) => sum + item.product.price_cents * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  async function handleSubmit() {
    if (cart.length === 0) return setError('Add at least one item to the order.');
    setError('');
    setSubmitting(true);

    const items: OrderItemInput[] = cart.map(item => ({
      product_id: item.product.id,
      qty: item.qty,
    }));

    try {
      await api.createOrder({ items });
      setSuccess('Order created successfully!');
      setTimeout(() => onOrderCreated(), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading">LOADING PRODUCTS...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">NEW ORDER</div>
          <div className="page-subtitle">Select products and quantities</div>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Product selector */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>QTY</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cartItem = getCartItem(p.id);
                  const inCart   = !!cartItem;
                  const outOfStock = p.stock_qty === 0;

                  return (
                    <tr key={p.id} style={{ opacity: outOfStock ? 0.4 : 1 }}>
                      <td style={{ fontWeight: inCart ? 600 : 400 }}>
                        {inCart && <span style={{ color: 'var(--accent)', marginRight: 6, fontSize: 10 }}>●</span>}
                        {p.name}
                      </td>
                      <td className="td-mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{p.sku}</td>
                      <td className="td-mono">{formatPrice(p.price_cents)}</td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 12,
                          color: p.stock_qty === 0 ? 'var(--danger)' : p.stock_qty <= 10 ? 'var(--accent)' : 'var(--text-mid)'
                        }}>
                          {p.stock_qty}
                        </span>
                      </td>
                      <td style={{ width: 120 }}>
                        {outOfStock ? (
                          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>OUT OF STOCK</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 10px', minWidth: 28 }}
                              onClick={() => setQty(p, (cartItem?.qty ?? 0) - 1)}
                            >−</button>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, minWidth: 24, textAlign: 'center' }}>
                              {cartItem?.qty ?? 0}
                            </span>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 10px', minWidth: 28 }}
                              onClick={() => setQty(p, (cartItem?.qty ?? 0) + 1)}
                              disabled={(cartItem?.qty ?? 0) >= p.stock_qty}
                            >+</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order summary panel */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card">
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 16 }}>
              ORDER SUMMARY
            </div>

            {cart.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                No items selected
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                      gap: 12,
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.product.name}</div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                          {item.qty} × {formatPrice(item.product.price_cents)}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {formatPrice(item.product.price_cents * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderTop: '1px solid var(--border-hi)',
                  marginBottom: 4,
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    {totalItems} ITEM{totalItems !== 1 ? 'S' : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>
                    {formatPrice(totalCents)}
                  </span>
                </div>
              </>
            )}

            {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 16, padding: '12px', fontSize: 12 }}
              onClick={handleSubmit}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? 'PLACING ORDER...' : `PLACE ORDER — ${formatPrice(totalCents)}`}
            </button>

            {cart.length > 0 && (
              <button
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => setCart([])}
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
