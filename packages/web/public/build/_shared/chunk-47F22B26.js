import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-NO3FWBWP.js";
import {
  createHotContext
} from "/build/_shared/chunk-UG3ISROB.js";
import {
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// empty-module:./pool.server
var require_pool = __commonJS({
  "empty-module:./pool.server"(exports, module) {
    module.exports = {};
  }
});

// empty-module:./sql-sanitizer.server
var require_sql_sanitizer = __commonJS({
  "empty-module:./sql-sanitizer.server"(exports, module) {
    module.exports = {};
  }
});

// app/utils/api.ts
var import_pool = __toESM(require_pool(), 1);
var import_sql_sanitizer = __toESM(require_sql_sanitizer(), 1);
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/utils/api.ts"
  );
  import.meta.hot.lastModified = "1732577029224.791";
}
async function fetchSchema() {
  console.log("Attempting to fetch schema...");
  const client = await import_pool.pool.connect();
  try {
    console.log("Connected to database, executing query...");
    const result = await client.query(`
      WITH table_sizes AS (
        SELECT 
          n.nspname as schema_name,
          c.relname as table_name,
          pg_total_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname)) as total_bytes,
          c.reltuples::bigint as row_estimate
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r'
          AND n.nspname = 'public'
      )
      SELECT 
        t.table_name,
        array_agg(
          json_build_object(
            'name', c.column_name,
            'type', c.data_type,
            'nullable', c.is_nullable = 'YES',
            'defaultValue', c.column_default
          )
        ) as columns,
        array_agg(
          CASE WHEN tc.constraint_type = 'PRIMARY KEY' 
          THEN c.column_name 
          ELSE NULL 
          END
        ) FILTER (WHERE tc.constraint_type = 'PRIMARY KEY') as primary_key,
        COALESCE(ts.row_estimate::text, '0') as row_count,
        COALESCE(ts.total_bytes::text, '0') as size_bytes
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
        AND t.table_schema = c.table_schema
      LEFT JOIN information_schema.table_constraints tc 
        ON t.table_name = tc.table_name 
        AND t.table_schema = tc.table_schema
        AND tc.constraint_type = 'PRIMARY KEY'
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND c.column_name = kcu.column_name
      LEFT JOIN table_sizes ts ON t.table_name = ts.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name, ts.row_estimate, ts.total_bytes
    `);
    console.log("Query executed successfully, found tables:", result.rows.length);
    return result.rows.map((row) => {
      var _a;
      return {
        name: row.table_name,
        columns: row.columns,
        primaryKey: (_a = row.primary_key) != null ? _a : void 0,
        rowCount: parseInt(row.row_count || "0", 10),
        sizeInBytes: parseInt(row.size_bytes || "0", 10)
      };
    });
  } catch (error) {
    console.error("Error fetching schema:", error);
    throw error;
  } finally {
    console.log("Releasing database connection");
    client.release();
  }
}
async function executeQuery(sql) {
  const client = await import_pool.pool.connect();
  try {
    const result = await client.query(sql);
    return {
      rows: result.rows,
      fields: result.fields.map((f) => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      }))
    };
  } finally {
    client.release();
  }
}
async function updateTableSchema(tableName, schema) {
  const client = await import_pool.pool.connect();
  try {
    await client.query("BEGIN");
    const currentSchema = (await fetchSchema()).find((s) => s.name === tableName);
    if (!currentSchema) {
      throw new Error(`Table ${tableName} not found`);
    }
    const currentColumns = new Map(currentSchema.columns.map((c) => [c.name, c]));
    const newColumns = new Map(schema.columns.map((c) => [c.name, c]));
    for (const [name, column] of newColumns) {
      if (!currentColumns.has(name)) {
        await client.query(`
          ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
          ADD COLUMN ${(0, import_sql_sanitizer.sanitizeTableName)(name)} ${column.type}
          ${column.nullable ? "" : "NOT NULL"}
          ${column.defaultValue ? `DEFAULT ${column.defaultValue}` : ""}
        `);
      }
    }
    for (const [name, column] of newColumns) {
      const currentColumn = currentColumns.get(name);
      if (currentColumn) {
        if (currentColumn.type !== column.type) {
          await client.query(`
            ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
            ALTER COLUMN ${(0, import_sql_sanitizer.sanitizeTableName)(name)}
            TYPE ${column.type}
            USING ${(0, import_sql_sanitizer.sanitizeTableName)(name)}::${column.type}
          `);
        }
        if (currentColumn.nullable !== column.nullable) {
          await client.query(`
            ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
            ALTER COLUMN ${(0, import_sql_sanitizer.sanitizeTableName)(name)}
            ${column.nullable ? "DROP NOT NULL" : "SET NOT NULL"}
          `);
        }
        if (currentColumn.defaultValue !== column.defaultValue) {
          if (column.defaultValue) {
            await client.query(`
              ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
              ALTER COLUMN ${(0, import_sql_sanitizer.sanitizeTableName)(name)}
              SET DEFAULT ${column.defaultValue}
            `);
          } else {
            await client.query(`
              ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
              ALTER COLUMN ${(0, import_sql_sanitizer.sanitizeTableName)(name)}
              DROP DEFAULT
            `);
          }
        }
      }
    }
    for (const [name] of currentColumns) {
      if (!newColumns.has(name)) {
        await client.query(`
          ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
          DROP COLUMN ${(0, import_sql_sanitizer.sanitizeTableName)(name)}
        `);
      }
    }
    if (JSON.stringify(currentSchema.primaryKey) !== JSON.stringify(schema.primaryKey)) {
      await client.query(`
        DO $$ 
        BEGIN 
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = '${tableName}'
            AND constraint_type = 'PRIMARY KEY'
          ) THEN
            EXECUTE (
              SELECT 'ALTER TABLE ' || quote_ident('${tableName}') || 
                     ' DROP CONSTRAINT ' || quote_ident(constraint_name)
              FROM information_schema.table_constraints
              WHERE table_name = '${tableName}'
              AND constraint_type = 'PRIMARY KEY'
            );
          END IF;
        END $$;
      `);
      if (schema.primaryKey && schema.primaryKey.length > 0) {
        const primaryKeyColumns = schema.primaryKey.map((col) => (0, import_sql_sanitizer.sanitizeTableName)(col)).join(", ");
        await client.query(`
          ALTER TABLE ${(0, import_sql_sanitizer.sanitizeTableName)(tableName)}
          ADD PRIMARY KEY (${primaryKeyColumns})
        `);
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating schema:", error);
    throw error;
  } finally {
    client.release();
  }
}

// app/components/PageContainer.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/PageContainer.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/PageContainer.tsx"
  );
  import.meta.hot.lastModified = "1732570749392.1968";
}
function PageContainer({
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-screen p-4 bg-gray-100 dark:bg-gray-950", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden flex flex-col", children }, void 0, false, {
    fileName: "app/components/PageContainer.tsx",
    lineNumber: 25,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/PageContainer.tsx",
    lineNumber: 24,
    columnNumber: 10
  }, this);
}
_c = PageContainer;
var _c;
$RefreshReg$(_c, "PageContainer");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  executeQuery,
  updateTableSchema,
  PageContainer
};
//# sourceMappingURL=/build/_shared/chunk-47F22B26.js.map
