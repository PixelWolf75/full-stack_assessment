import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import initDatabase from './db';

// Import your routes
import orderRouter from "./routes/orders.routes";
import productRouter from "./routes/products.routes";

const app: Express = express();
const port = process.env.PORT || 3001;

// CORS configuration (allowing only specific origin for security)
const corsOptions = {
  origin: ['http://localhost:3005', 'http://web:3005', "https://fsa.ericleon.uk"],  // Allow frontend container in Docker or localhost
  methods: ['GET', 'POST', 'PATCH'],  // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
};

app.use(cors(corsOptions), (req, res, next) => {
  console.log('CORS headers applied');
  next();
});

app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount your routes
app.use('/products', productRouter);
app.use('/orders', orderRouter);

// Start server only after DB is ready
async function start(): Promise<void> {
  await initDatabase();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
