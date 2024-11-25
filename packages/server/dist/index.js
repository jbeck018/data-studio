import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { config } from './config.js';
import { createPool } from './db/connection.js';
import { getTableSchema, getDatabaseSchema } from './db/introspect.js';
import { getTableData, executeQuery, insertRow, updateRow, deleteRow } from './db/operations.js';
const app = express();
app.use(cors());
app.use(express.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Get database schema
app.get('/schema', async (req, res) => {
    try {
        const pool = createPool();
        const schema = await getDatabaseSchema(pool);
        res.json(schema);
    }
    catch (error) {
        console.error('Error fetching schema:', error);
        res.status(500).json({ error: 'Failed to fetch database schema' });
    }
});
// Get table schema
app.get('/tables/:tableName/schema', async (req, res) => {
    try {
        const pool = createPool();
        const { tableName } = req.params;
        const schema = await getTableSchema(pool, tableName);
        res.json(schema);
    }
    catch (error) {
        console.error('Error fetching table schema:', error);
        res.status(500).json({ error: 'Failed to fetch table schema' });
    }
});
// Get table data with pagination and sorting
app.get('/tables/:tableName/data', async (req, res) => {
    try {
        const pool = createPool();
        const { tableName } = req.params;
        const { page = '1', pageSize = '10', sortBy, sortOrder } = req.query;
        const result = await getTableData(pool, tableName, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            sortBy: sortBy,
            sortOrder: sortOrder
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching table data:', error);
        res.status(500).json({ error: 'Failed to fetch table data' });
    }
});
// Execute custom query
app.post('/query', async (req, res) => {
    try {
        const pool = createPool();
        const schema = z.object({
            sql: z.string(),
            params: z.array(z.any()).optional()
        });
        const { sql, params } = schema.parse(req.body);
        const result = await executeQuery(pool, sql, params);
        res.json(result);
    }
    catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Failed to execute query' });
    }
});
// Insert row
app.post('/tables/:tableName/data', async (req, res) => {
    try {
        const pool = createPool();
        const { tableName } = req.params;
        await insertRow(pool, tableName, req.body);
        res.status(201).json({ message: 'Row inserted successfully' });
    }
    catch (error) {
        console.error('Error inserting row:', error);
        res.status(500).json({ error: 'Failed to insert row' });
    }
});
// Update row
app.put('/tables/:tableName/data/:id', async (req, res) => {
    try {
        const pool = createPool();
        const { tableName, id } = req.params;
        await updateRow(pool, tableName, id, req.body);
        res.json({ message: 'Row updated successfully' });
    }
    catch (error) {
        console.error('Error updating row:', error);
        res.status(500).json({ error: 'Failed to update row' });
    }
});
// Delete row
app.delete('/tables/:tableName/data/:id', async (req, res) => {
    try {
        const pool = createPool();
        const { tableName, id } = req.params;
        await deleteRow(pool, tableName, id);
        res.json({ message: 'Row deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting row:', error);
        res.status(500).json({ error: 'Failed to delete row' });
    }
});
app.listen(config.PORT, () => {
    console.log(`Server running at http://${config.HOST}:${config.PORT}`);
});
//# sourceMappingURL=index.js.map