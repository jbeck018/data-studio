import type { Pool } from 'pg';
interface Schema {
    name: string;
    columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        defaultValue: string | null;
    }>;
    primaryKey: string[];
    foreignKeys: Array<{
        columns: string[];
        referencedTable: string;
        referencedColumns: string[];
    }>;
}
export declare function getDatabaseSchema(pool: Pool): Promise<Schema[]>;
export declare function getTableSchema(pool: Pool, tableName: string): Promise<Schema>;
export {};
//# sourceMappingURL=introspect.d.ts.map