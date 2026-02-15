import {
  Product,
  Order,
  OrderWithItems,
  CreateProductBody,
  UpdateProductBody,
  CreateOrderBody,
} from './types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  console.log(`PATH = ${BASE_URL}${path}`)

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`Error fetching ${BASE_URL}${path}:`, data);
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

// -------------------------------------------------------
// Products
// -------------------------------------------------------
export const api = {
  getProducts: (search?: string, sort?: string, direction?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (direction) params.set('direction', direction);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Product[]>(`/products${query}`);
  },

  createProduct: (body: CreateProductBody) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateProduct: (id: number, body: UpdateProductBody) =>
    request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // -------------------------------------------------------
  // Orders
  // -------------------------------------------------------
  getOrders: () => request<Order[]>('/orders'),

  getOrder: (id: number) => request<OrderWithItems>(`/orders/${id}`),

  createOrder: (body: CreateOrderBody) =>
    request<OrderWithItems>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
