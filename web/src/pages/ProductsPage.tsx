import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Product } from '../types';
import { formatPrice, formatDate } from '../utils';

function stockBadge(qty: number) {
  if (qty === 0)  return <span className="badge badge-red">OUT OF STOCK</span>;
  if (qty <= 10)  return <span className="badge badge-yellow">LOW — {qty}</span>;
  return              <span className="badge badge-green">{qty}</span>;
}

// -------------------------------------------------------
// Edit modal
// -------------------------------------------------------
interface EditModalProps {
  product: Product;
  onClose: () => void;
  onSaved: (p: Product) => void;
}

function EditModal({ product, onClose, onSaved }: EditModalProps) {
  const [priceCents, setPriceCents] = useState(String(product.price_cents));
  const [stockQty,   setStockQty]   = useState(String(product.stock_qty));
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  async function handleSave() {
    setError('');
    const price = Number(priceCents);
    const stock = Number(stockQty);

    // Validate if the price and stock are whole numbers and not negative
    if (price < 0 || !Number.isInteger(price) || priceCents.length === 0) {
      return setError("'price_cents' must be a whole number ≥ 0.");
    }
    if (stock < 0 || !Number.isInteger(stock) || stockQty.length === 0) {
      return setError("'stock_qty' must be a whole number ≥ 0.");
    }

    setLoading(true);
    try {
      const updated = await api.updateProduct(product.id, {
        price_cents: price,
        stock_qty: stock,
      });
      onSaved(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">EDIT PRODUCT</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, marginBottom: 4 }}>{product.name}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>SKU: {product.sku}</div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">PRICE (CENTS)</label>
              <input
                className="input input-mono"
                type="number"
                min="0"
                value={priceCents}
                onChange={e => setPriceCents(e.target.value)}
              />
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--mono)' }}>
                = {formatPrice(Number(priceCents) || 0)}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">STOCK QTY</label>
              <input
                className="input input-mono"
                type="number"
                min="0"
                value={stockQty}
                onChange={e => setStockQty(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>CANCEL</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Add product modal
// -------------------------------------------------------
interface AddModalProps {
  onClose: () => void;
  onAdded: (p: Product) => void;
}

function AddModal({ onClose, onAdded }: AddModalProps) {
  const [name,       setName]       = useState('');
  const [sku,        setSku]        = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [stockQty,   setStockQty]   = useState('0');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  async function handleAdd() {
    setError('');
    if (!name.trim()) return setError("'name' is required.");
    if (!sku.trim())  return setError("'sku' is required.");
    const price = Number(priceCents);
    const stock = Number(stockQty);

    // Validate if the price and stock are whole numbers and not negative
    if (price < 0 || !Number.isInteger(price) || priceCents.length === 0) {
      return setError("'price_cents' must be a whole number ≥ 0.");
    }
    if (stock < 0 || !Number.isInteger(stock) || stockQty.length === 0) {
      return setError("'stock_qty' must be a whole number ≥ 0.");
    }

    setLoading(true);
    try {
      const product = await api.createProduct({ name: name.trim(), sku: sku.trim().toUpperCase(), price_cents: price, stock_qty: stock });
      onAdded(product);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">ADD PRODUCT</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">PRODUCT NAME</label>
            <input className="input" placeholder="e.g. Wireless Keyboard" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="input input-mono" placeholder="e.g. KEY-002" value={sku} onChange={e => setSku(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">PRICE (CENTS)</label>
              <input className="input input-mono" type="number" min="0" placeholder="e.g. 4999" value={priceCents} onChange={e => setPriceCents(e.target.value)} />
              {priceCents && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--mono)' }}>= {formatPrice(Number(priceCents) || 0)}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">STOCK QTY</label>
              <input className="input input-mono" type="number" min="0" value={stockQty} onChange={e => setStockQty(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>CANCEL</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? 'ADDING...' : 'ADD PRODUCT'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main page
// -------------------------------------------------------
export default function ProductsPage() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('name');
  const [direction, setDirection] = useState('asc');
  const [editing,   setEditing]   = useState<Product | null>(null);
  const [adding,    setAdding]    = useState(false);
  const [success,   setSuccess]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProducts(search || undefined, sort, direction);
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, sort, direction]);

  useEffect(() => { load(); }, [load]);

  function handleSaved(updated: Product) {
    setProducts(ps => ps.map(p => p.id === updated.id ? updated : p));
    setEditing(null);
    setSuccess(`${updated.name} updated successfully.`);
    setTimeout(() => setSuccess(''), 3000);
  }

  function handleAdded(product: Product) {
    setProducts(ps => [...ps, product]);
    setAdding(false);
    setSuccess(`${product.name} added successfully.`);
    setTimeout(() => setSuccess(''), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">PRODUCTS</div>
          <div className="page-subtitle">{products.length} items in catalogue</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ ADD PRODUCT</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div className="toolbar-search">
          <input
            className="input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input toolbar-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="price_cents">Sort: Price</option>
          <option value="stock_qty">Sort: Stock</option>
          <option value="created_at">Sort: Date</option>
        </select>
        <select className="input toolbar-select" value={direction} onChange={e => setDirection(e.target.value)}>
          <option value="asc">ASC</option>
          <option value="desc">DESC</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">LOADING...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◻</div>
          No products found
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>SKU</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>CREATED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="td-mono" style={{ color: 'var(--text-dim)' }}>#{p.id}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td className="td-mono" style={{ color: 'var(--accent)' }}>{p.sku}</td>
                  <td className="td-mono">{formatPrice(p.price_cents)}</td>
                  <td>{stockBadge(p.stock_qty)}</td>
                  <td className="td-mono" style={{ color: 'var(--text-dim)', fontSize: 11 }}>{formatDate(p.created_at)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>EDIT</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <EditModal product={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {adding  && <AddModal onClose={() => setAdding(false)} onAdded={handleAdded} />}
    </div>
  );
}
