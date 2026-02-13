"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
// Import your routes
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// CORS configuration (allowing only specific origin for security)
const corsOptions = {
    origin: ['http://localhost:3005', 'http://web:3005'], // Allow frontend container in Docker or localhost
    methods: ['GET', 'POST', 'PATCH'], // Allow necessary methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
};
app.use((0, cors_1.default)(corsOptions), (req, res, next) => {
    console.log('CORS headers applied');
    next();
});
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Mount your routes
app.use('/products', products_routes_1.default);
app.use('/orders', orders_routes_1.default);
// Start server only after DB is ready
async function start() {
    await (0, db_1.default)();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
