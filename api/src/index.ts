import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import initDatabase from './db';

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: mount your route files here
// import productRoutes from './routes/products';
// import orderRoutes from './routes/orders';
// app.use('/products', productRoutes);
// app.use('/orders', orderRoutes);

// Start server only after DB is ready
async function start(): Promise<void> {
  await initDatabase();

  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
