import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config.js';
export const createPool = () => {
    return new Pool({
        host: config.HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB,
    });
};
export const createDb = (pool) => {
    return drizzle(pool);
};
// Singleton pool instance
let pool = null;
export const getPool = () => {
    if (!pool) {
        pool = createPool();
    }
    return pool;
};
export const getDb = () => {
    const pool = getPool();
    return createDb(pool);
};
//# sourceMappingURL=connection.js.map