"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
        return;
    }
    console.log('Database connected successfully');
    release();
});
exports.default = pool;
