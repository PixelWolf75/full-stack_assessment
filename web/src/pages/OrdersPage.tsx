import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Order, OrderWithItems } from '../types';
import { formatPrice, formatDate } from '../utils';

// -------------------------------------------------------
// Order detail modal
// -------------------------------------------------------
function OrderDetailModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [order,   setOrder]   = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getOrder(orderId)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">ORDER #{orderId}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading && <div className="loading" style={{ padding: 32 }}>LOADING...</div>}
          {error   && <div className="alert alert-error">{error}</div>}
          {order   && (
            <>
              <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 2 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>DATE</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{formatDate(order.created_at)}</div>
                </div>
                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 2 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>ITEMS</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{order.items.length}</div>
                </div>
                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 2 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>TOTAL</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
                    {formatPrice(order.total_cents)}
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 12 }}>
                LINE ITEMS
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SKU</th>
                      <th>QTY</th>
                      <th>PRICE AT PURCHASE</th>
                      <th>SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                        <td className="td-mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{item.product_sku}</td>
                        <td className="td-mono">{item.qty}</td>
                        <td className="td-mono">{formatPrice(item.price_at_purchase)}</td>
                        <td className="td-mono" style={{ fontWeight: 500 }}>
                          {formatPrice(item.price_at_purchase * item.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '16px 0 0',
                marginTop: 8,
                gap: 16,
                alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>ORDER TOTAL</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 600, color: 'var(--accent)' }}>
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main page
// -------------------------------------------------------
export default function OrdersPage() {
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [selectedId,    setSelectedId]    = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grandTotal = orders.reduce((sum, o) => sum + Number(o.total_cents), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">ORDERS</div>
          <div className="page-subtitle">{orders.length} orders · {formatPrice(grandTotal)} total revenue</div>
        </div>
        <button className="btn btn-ghost" onClick={load}>↻ REFRESH</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">LOADING...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◻</div>
          No orders yet. Create one from the New Order tab.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="td-mono" style={{ color: 'var(--accent)' }}>#{order.id}</td>
                  <td className="td-mono" style={{ color: 'var(--text-mid)', fontSize: 12 }}>
                    {formatDate(order.created_at)}
                  </td>
                  <td className="td-mono" style={{ color: 'var(--text-mid)' }}>
                    {order.item_count} item{Number(order.item_count) !== 1 ? 's' : ''}
                  </td>
                  <td className="td-mono" style={{ fontWeight: 600 }}>
                    {formatPrice(Number(order.total_cents))}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedId(order.id)}
                    >
                      VIEW →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId !== null && (
        <OrderDetailModal
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
