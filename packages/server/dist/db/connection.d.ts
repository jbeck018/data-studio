import pkg from 'pg';
export declare const createPool: () => pkg.Pool;
export declare const createDb: (pool: ReturnType<typeof createPool>) => import("drizzle-orm/node-postgres").NodePgDatabase<Record<string, never>>;
export declare const getPool: () => pkg.Pool;
export declare const getDb: () => import("drizzle-orm/node-postgres").NodePgDatabase<Record<string, never>>;
//# sourceMappingURL=connection.d.ts.map