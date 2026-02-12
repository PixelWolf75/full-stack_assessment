// -------------------------------------------------------
// Database row types
// These match exactly what PostgreSQL returns
// -------------------------------------------------------

export interface Product {
  id: number;
  name: string;
  sku: string;
  price_cents: number;
  stock_qty: number;
  created_at: Date;
}

export interface Order {
  id: number;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  price_at_purchase: number;
}

// -------------------------------------------------------
// Enriched types returned from JOIN queries
// -------------------------------------------------------

export interface OrderWithTotal extends Order {
  total_cents: number;
  item_count: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product_name: string;
  product_sku: string;
}

export interface OrderWithItems extends Order {
  total_cents: number;
  items: OrderItemWithProduct[];
}

// -------------------------------------------------------
// Request body types (what the API receives)
// -------------------------------------------------------

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

// -------------------------------------------------------
// Query param types
// -------------------------------------------------------

export type ProductSortField = 'name' | 'price_cents' | 'stock_qty' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface ProductQueryParams {
  search?: string;
  sort?: ProductSortField;
  direction?: SortDirection;
}
