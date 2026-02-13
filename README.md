# Full-Stack Assessment
A full-stack TypeScript project for managing products and creating orders.

## Features

### Products

- Each product has: id, name, sku (unique), price_cents, stock_qty, created_at.

- Products can be added or edited via the frontend.

  - Fields are required and validated:

    - price_cents and stock_qty must be whole numbers ≥ 0.

    - sku must be unique.

  - Invalid input shows an error until corrected or cancelled.

- Products can be searched and sorted by name, price, stock, or creation date (ascending/descending).

### Orders

- Each order has: id, created_at, and order_items (product details, price at purchase, quantity).

- Orders are created by selecting products and specifying quantities.

  - Product stock is deducted and cannot go below 0.

  - Total cost is calculated and displayed.

  - Order date is automatically recorded.

## Running the Project

1. Start the app:

```shell
docker compose up --build
```

2. Stop the app:

```shell
docker compose down
```



- The frontend runs at http://localhost:3005

## Production Notes

To seed the database in the docker instance run:
```shell
docker exec -it ecommerce-api npm run seed
```
