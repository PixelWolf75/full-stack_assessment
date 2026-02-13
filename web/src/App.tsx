import React, { useState } from 'react';
import ProductsPage from './pages/ProductsPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrdersPage from './pages/OrdersPage';
import './App.css';

type Page = 'products' | 'create-order' | 'orders';

export default function App() {
  const [page, setPage] = useState<Page>('products');

  return (
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-bracket">[</span>
              STORE<span className="logo-accent">OPS</span>
              <span className="logo-bracket">]</span>
            </div>
            <nav className="nav">
              <button
                  className={`nav-btn ${page === 'products' ? 'active' : ''}`}
                  onClick={() => setPage('products')}
              >
                <span className="nav-num">01</span> PRODUCTS
              </button>
              <button
                  className={`nav-btn ${page === 'create-order' ? 'active' : ''}`}
                  onClick={() => setPage('create-order')}
              >
                <span className="nav-num">02</span> NEW ORDER
              </button>
              <button
                  className={`nav-btn ${page === 'orders' ? 'active' : ''}`}
                  onClick={() => setPage('orders')}
              >
                <span className="nav-num">03</span> ORDERS
              </button>
            </nav>
          </div>
        </header>

        <main className="main">
          {page === 'products' && <ProductsPage />}
          {page === 'create-order' && <CreateOrderPage onOrderCreated={() => setPage('orders')} />}
          {page === 'orders' && <OrdersPage />}
        </main>
      </div>
  );
}