import type { Pool } from 'pg';
interface TableDataOptions {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare function getTableData(pool: Pool, tableName: string, options?: TableDataOptions): Promise<{
    data: any[];
    totalRows: number;
    page: number;
    pageSize: number;
}>;
export declare function executeQuery(pool: Pool, sql: string, params?: any[]): Promise<{
    rows: any[];
    fields: import("pg").FieldDef[];
}>;
export declare function insertRow(pool: Pool, tableName: string, data: Record<string, any>): Promise<any>;
export declare function updateRow(pool: Pool, tableName: string, id: string | number, data: Record<string, any>): Promise<any>;
export declare function deleteRow(pool: Pool, tableName: string, id: string | number): Promise<any>;
export {};
//# sourceMappingURL=operations.d.ts.map