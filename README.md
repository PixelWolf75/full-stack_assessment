# full-stack_assessment

This a fullstack typescript project that manages products and allows users to create orders with
said products.

Each Product contains: an id, name, sku(id of the product itself), price in cents, stock quantity and date it was created at in the database.

Each Order contains: an id, the time the order was created, and the order items which is the product including its details with the price at the time of purchase and the stock  purchased.

Products can be added to the database

Database port is on 5433

React web page is on http://localhost:3005/