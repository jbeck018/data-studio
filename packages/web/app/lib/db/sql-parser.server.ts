interface TableReference {
  schema?: string;
  table: string;
}

export interface SQLStatement {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';
  tables: TableReference[];
}

// Basic SQL parser that extracts operation type and table references
export function parseSQL(sql: string): SQLStatement {
  const normalizedSQL = sql.trim().toUpperCase();
  
  // Determine operation type
  let type: SQLStatement['type'];
  if (normalizedSQL.startsWith('SELECT')) type = 'SELECT';
  else if (normalizedSQL.startsWith('INSERT')) type = 'INSERT';
  else if (normalizedSQL.startsWith('UPDATE')) type = 'UPDATE';
  else if (normalizedSQL.startsWith('DELETE')) type = 'DELETE';
  else if (normalizedSQL.startsWith('CREATE')) type = 'CREATE';
  else if (normalizedSQL.startsWith('DROP')) type = 'DROP';
  else if (normalizedSQL.startsWith('ALTER')) type = 'ALTER';
  else throw new Error('Unsupported SQL operation');

  // Extract table references
  const tables: TableReference[] = [];
  
  // Remove comments and string literals to avoid false matches
  const cleanSQL = removeCommentsAndStrings(normalizedSQL);
  
  // Extract table references based on operation type
  switch (type) {
    case 'SELECT':
      extractFromClause(cleanSQL, tables);
      break;
    case 'INSERT':
      extractInsertTable(cleanSQL, tables);
      break;
    case 'UPDATE':
      extractUpdateTable(cleanSQL, tables);
      break;
    case 'DELETE':
      extractFromClause(cleanSQL, tables);
      break;
    case 'CREATE':
    case 'DROP':
    case 'ALTER':
      extractDDLTable(cleanSQL, tables);
      break;
  }

  return { type, tables };
}

function removeCommentsAndStrings(sql: string): string {
  // Remove inline comments
  sql = sql.replace(/--.*$/gm, '');
  
  // Remove multi-line comments
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove string literals
  sql = sql.replace(/'[^']*'/g, "'STRING_LITERAL'");
  
  return sql;
}

function extractFromClause(sql: string, tables: TableReference[]): void {
  const fromIndex = sql.indexOf(' FROM ');
  if (fromIndex === -1) return;
  
  const fromClause = sql.slice(fromIndex + 6);
  const whereIndex = fromClause.indexOf(' WHERE ');
  const joinIndex = fromClause.indexOf(' JOIN ');
  
  let tableList = fromClause;
  if (whereIndex !== -1) {
    tableList = fromClause.slice(0, whereIndex);
  } else if (joinIndex !== -1) {
    tableList = fromClause.slice(0, joinIndex);
  }
  
  const tableRefs = tableList.split(',').map(t => t.trim());
  for (const ref of tableRefs) {
    const parts = ref.split('.');
    if (parts.length === 2) {
      tables.push({ schema: parts[0], table: parts[1] });
    } else {
      tables.push({ table: parts[0] });
    }
  }
}

function extractInsertTable(sql: string, tables: TableReference[]): void {
  const match = sql.match(/INSERT\s+INTO\s+([^\s(]+)/i);
  if (match) {
    const tableName = match[1];
    const parts = tableName.split('.');
    if (parts.length === 2) {
      tables.push({ schema: parts[0], table: parts[1] });
    } else {
      tables.push({ table: parts[0] });
    }
  }
}

function extractUpdateTable(sql: string, tables: TableReference[]): void {
  const match = sql.match(/UPDATE\s+([^\s]+)/i);
  if (match) {
    const tableName = match[1];
    const parts = tableName.split('.');
    if (parts.length === 2) {
      tables.push({ schema: parts[0], table: parts[1] });
    } else {
      tables.push({ table: parts[0] });
    }
  }
}

function extractDDLTable(sql: string, tables: TableReference[]): void {
  const match = sql.match(/(CREATE|DROP|ALTER)\s+TABLE\s+([^\s(]+)/i);
  if (match) {
    const tableName = match[2];
    const parts = tableName.split('.');
    if (parts.length === 2) {
      tables.push({ schema: parts[0], table: parts[1] });
    } else {
      tables.push({ table: parts[0] });
    }
  }
}
