
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