export async function getTableData(pool, tableName, options = {}) {
    const { page = 1, pageSize = 10, sortBy, sortOrder = 'asc' } = options;
    const offset = (page - 1) * pageSize;
    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
    const totalRows = parseInt(countResult.rows[0].count);
    // Get data with pagination and sorting
    let query = `SELECT * FROM "${tableName}"`;
    if (sortBy) {
        query += ` ORDER BY "${sortBy}" ${sortOrder.toUpperCase()}`;
    }
    query += ` LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [pageSize, offset]);
    return {
        data: result.rows,
        totalRows,
        page,
        pageSize
    };
}
export async function executeQuery(pool, sql, params) {
    const result = await pool.query(sql, params);
    return {
        rows: result.rows,
        fields: result.fields
    };
}
export async function insertRow(pool, tableName, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
    INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;
    const result = await pool.query(query, values);
    return result.rows[0];
}
export async function updateRow(pool, tableName, id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns
        .map((col, i) => `"${col}" = $${i + 1}`)
        .join(', ');
    const query = `
    UPDATE "${tableName}"
    SET ${setClause}
    WHERE id = $${values.length + 1}
    RETURNING *
  `;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
}
export async function deleteRow(pool, tableName, id) {
    const query = `
    DELETE FROM "${tableName}"
    WHERE id = $1
    RETURNING *
  `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}
//# sourceMappingURL=operations.js.map