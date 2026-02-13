// Matches backend db/types.ts exactly

export interface Product {
  id: number;
  name: string;
  sku: string;
  price_cents: number;
  stock_qty: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  price_at_purchase: number;
  product_name: string;
  product_sku: string;
}

export interface Order {
  id: number;
  created_at: string;
  total_cents: number;
  item_count: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateProductBody {
  name: string;
  sku: string;
  price_cents: number;
  stock_qty: number;
}

export interface UpdateProductBody {
  price_cents?: number;
  stock_qty?: number;
}

export interface OrderItemInput {
  product_id: number;
  qty: number;
}

export interface CreateOrderBody {
  items: OrderItemInput[];
}
