var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let markup = renderToString(
    /* @__PURE__ */ jsxDEV(RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
      fileName: "app/entry.server.tsx",
      lineNumber: 13,
      columnNumber: 5
    }, this)
  );
  return responseHeaders.set("Content-Type", "text/html"), new Response("<!DOCTYPE html>" + markup, {
    headers: responseHeaders,
    status: responseStatusCode
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links
});
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

// app/tailwind.css
var tailwind_default = "/build/_assets/tailwind-IWTETEW2.css";

// app/root.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// app/utils/theme.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { jsxDEV as jsxDEV2 } from "react/jsx-dev-runtime";
var ThemeContext = createContext(void 0);
function ThemeProvider({ children }) {
  let [theme, setTheme] = useState(() => {
    if (typeof window > "u")
      return "light";
    let saved = localStorage.getItem("theme");
    return saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  useEffect(() => {
    let root = window.document.documentElement;
    root.classList.remove("light", "dark"), root.classList.add(theme), localStorage.setItem("theme", theme);
  }, [theme]);
  let toggleTheme = () => {
    console.log("Toggle theme"), setTheme((prevTheme) => prevTheme === "light" ? "dark" : "light");
  };
  return useEffect(() => {
    window.document.documentElement.classList.add(theme);
  }, []), /* @__PURE__ */ jsxDEV2(ThemeContext.Provider, { value: { theme, toggleTheme }, children }, void 0, !1, {
    fileName: "app/utils/theme.tsx",
    lineNumber: 48,
    columnNumber: 5
  }, this);
}
function useTheme() {
  let context = useContext(ThemeContext);
  if (context === void 0)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

// app/components/Layout.tsx
import { Link, useLocation } from "@remix-run/react";
import { TableCellsIcon as TableIcon, CircleStackIcon as DatabaseIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
function Layout({ children }) {
  let { theme, toggleTheme } = useTheme(), location = useLocation();
  return /* @__PURE__ */ jsxDEV3("div", { className: "flex h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV3("div", { className: "fixed left-4 top-4 bottom-4 w-64", children: /* @__PURE__ */ jsxDEV3("div", { className: "flex h-full flex-col rounded-2xl bg-white dark:bg-gray-800 shadow-lg", children: [
      /* @__PURE__ */ jsxDEV3("div", { className: "flex flex-1 flex-col overflow-y-auto pt-5 pb-4", children: [
        /* @__PURE__ */ jsxDEV3("div", { className: "flex flex-shrink-0 items-center px-4", children: /* @__PURE__ */ jsxDEV3("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Data Studio" }, void 0, !1, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 21,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 20,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV3("nav", { className: "mt-5 flex-1 space-y-1 px-2", children: [
          { name: "Tables", href: "/", icon: TableIcon },
          { name: "Run Query", href: "/query", icon: DatabaseIcon }
        ].map((item) => {
          let isActive = location.pathname === item.href;
          return /* @__PURE__ */ jsxDEV3(
            Link,
            {
              to: item.href,
              className: `${isActive ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"} group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors`,
              children: [
                /* @__PURE__ */ jsxDEV3(
                  item.icon,
                  {
                    className: `${isActive ? "text-gray-500 dark:text-gray-300" : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"} mr-3 flex-shrink-0 h-5 w-5`,
                    "aria-hidden": "true"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/Layout.tsx",
                    lineNumber: 36,
                    columnNumber: 21
                  },
                  this
                ),
                item.name
              ]
            },
            item.name,
            !0,
            {
              fileName: "app/components/Layout.tsx",
              lineNumber: 27,
              columnNumber: 19
            },
            this
          );
        }) }, void 0, !1, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 23,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 19,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV3("div", { className: "flex flex-shrink-0 p-4", children: /* @__PURE__ */ jsxDEV3(
        "button",
        {
          onClick: toggleTheme,
          className: "group flex w-full items-center px-3 py-2 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          children: [
            theme === "dark" ? /* @__PURE__ */ jsxDEV3(SunIcon, { className: "mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" }, void 0, !1, {
              fileName: "app/components/Layout.tsx",
              lineNumber: 56,
              columnNumber: 17
            }, this) : /* @__PURE__ */ jsxDEV3(MoonIcon, { className: "mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" }, void 0, !1, {
              fileName: "app/components/Layout.tsx",
              lineNumber: 58,
              columnNumber: 17
            }, this),
            theme === "dark" ? "Light Mode" : "Dark Mode"
          ]
        },
        void 0,
        !0,
        {
          fileName: "app/components/Layout.tsx",
          lineNumber: 51,
          columnNumber: 13
        },
        this
      ) }, void 0, !1, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 50,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 18,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 17,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { className: "flex-1 pl-72", children: /* @__PURE__ */ jsxDEV3("main", { className: "h-screen", children }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 68,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Layout.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}

// app/root.tsx
import { jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
var links = () => [
  { rel: "stylesheet", href: tailwind_default }
], queryClient = new QueryClient();
function App() {
  return /* @__PURE__ */ jsxDEV4("html", { lang: "en", className: "h-full", children: [
    /* @__PURE__ */ jsxDEV4("head", { children: [
      /* @__PURE__ */ jsxDEV4("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 26,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 28,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4("body", { className: "h-full bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxDEV4(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxDEV4(ThemeProvider, { children: [
      /* @__PURE__ */ jsxDEV4(Layout, { children: /* @__PURE__ */ jsxDEV4(Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 35,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 34,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV4(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 37,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV4(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 38,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV4(LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 39,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV4(ReactQueryDevtools, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 40,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 33,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 32,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 24,
    columnNumber: 5
  }, this);
}

// app/routes/$tableName.tsx
var tableName_exports = {};
__export(tableName_exports, {
  action: () => action,
  default: () => TableRoute,
  loader: () => loader
});
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams as useSearchParams2, useSubmit } from "@remix-run/react";

// app/utils/pool.server.ts
import pg from "pg";
var { Pool } = pg, pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "graphql",
  password: process.env.PGPASSWORD || "postgres",
  port: parseInt(process.env.PGPORT || "5432")
});
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err), process.exit(-1);
});

// app/utils/sql-sanitizer.server.ts
import { format } from "sql-formatter";
function sanitizeTableName(name) {
  if (!name)
    throw new Error("Table or column name cannot be empty");
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, "");
  if (!/^[a-zA-Z]/.test(sanitized))
    throw new Error("Table or column name must start with a letter");
  if (sanitized.length === 0)
    throw new Error("Invalid table or column name");
  return sanitized.toLowerCase();
}
var SQLSanitizer = class {
  constructor() {
    this.allowedTableNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    this.allowedColumnNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  }
  validateTableName(tableName) {
    return this.allowedTableNamePattern.test(tableName);
  }
  validateColumnName(columnName) {
    return this.allowedColumnNamePattern.test(columnName);
  }
  escapeValue(value) {
    return value === null ? "NULL" : typeof value == "number" ? value.toString() : typeof value == "boolean" ? value ? "TRUE" : "FALSE" : `'${value.toString().replace(/'/g, "''")}'`;
  }
  sanitizeTableQuery(tableName, filters) {
    if (!this.validateTableName(tableName))
      throw new Error("Invalid table name");
    let query = `SELECT * FROM "${tableName}"`;
    if (filters && Object.keys(filters).length > 0) {
      let whereConditions = Object.entries(filters).filter(([column]) => this.validateColumnName(column)).map(([column, value]) => `"${column}" = ${this.escapeValue(value)}`).join(" AND ");
      whereConditions && (query += ` WHERE ${whereConditions}`);
    }
    return format(query + ";");
  }
  sanitizeSchemaQuery(tableName) {
    if (!this.validateTableName(tableName))
      throw new Error("Invalid table name");
    let query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        CASE 
          WHEN pk.constraint_type = 'PRIMARY KEY' THEN true
          ELSE false
        END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.column_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = '${tableName}'
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position;
    `;
    return format(query);
  }
  sanitizeUpdateQuery(tableName, primaryKey, data) {
    if (!this.validateTableName(tableName))
      throw new Error("Invalid table name");
    if (!this.validateColumnName(primaryKey.column))
      throw new Error("Invalid primary key column name");
    let setClauses = Object.entries(data).filter(([column]) => this.validateColumnName(column)).map(([column, value]) => `"${column}" = ${this.escapeValue(value)}`).join(", "), query = `
      UPDATE "${tableName}"
      SET ${setClauses}
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)}
      RETURNING *;
    `;
    return format(query);
  }
  sanitizeDeleteQuery(tableName, primaryKey) {
    if (!this.validateTableName(tableName))
      throw new Error("Invalid table name");
    if (!this.validateColumnName(primaryKey.column))
      throw new Error("Invalid primary key column name");
    let query = `
      DELETE FROM "${tableName}"
      WHERE "${primaryKey.column}" = ${this.escapeValue(primaryKey.value)};
    `;
    return format(query);
  }
  sanitizeInsertQuery(tableName, data) {
    if (!this.validateTableName(tableName))
      throw new Error("Invalid table name");
    let columns = Object.keys(data).filter(
      (column) => this.validateColumnName(column)
    ), values = columns.map((column) => this.escapeValue(data[column])), query = `
      INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(", ")})
      VALUES (${values.join(", ")})
      RETURNING *;
    `;
    return format(query);
  }
}, sqlSanitizer = new SQLSanitizer();

// app/utils/api.ts
async function fetchSchema() {
  console.log("Attempting to fetch schema...");
  let client = await pool.connect();
  try {
    console.log("Connected to database, executing query...");
    let result = await client.query(`
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
    return console.log("Query executed successfully, found tables:", result.rows.length), result.rows.map((row) => ({
      name: row.table_name,
      columns: row.columns,
      primaryKey: row.primary_key ?? void 0,
      rowCount: parseInt(row.row_count || "0", 10),
      sizeInBytes: parseInt(row.size_bytes || "0", 10)
    }));
  } catch (error) {
    throw console.error("Error fetching schema:", error), error;
  } finally {
    console.log("Releasing database connection"), client.release();
  }
}
async function fetchTableData(tableName, sortBy, sortOrder) {
  let client = await pool.connect();
  try {
    let query = `SELECT * FROM ${sanitizeTableName(tableName)}`;
    sortBy && (query += ` ORDER BY ${sanitizeTableName(sortBy)} ${sortOrder === "desc" ? "DESC" : "ASC"}`);
    let result = await client.query(query);
    return {
      data: result.rows,
      totalRows: result.rows.length
    };
  } finally {
    client.release();
  }
}
async function executeQuery(sql) {
  let client = await pool.connect();
  try {
    let result = await client.query(sql);
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
  let client = await pool.connect();
  try {
    await client.query("BEGIN");
    let currentSchema = (await fetchSchema()).find((s) => s.name === tableName);
    if (!currentSchema)
      throw new Error(`Table ${tableName} not found`);
    let currentColumns = new Map(currentSchema.columns.map((c) => [c.name, c])), newColumns = new Map(schema.columns.map((c) => [c.name, c]));
    for (let [name, column] of newColumns)
      currentColumns.has(name) || await client.query(`
          ALTER TABLE ${sanitizeTableName(tableName)}
          ADD COLUMN ${sanitizeTableName(name)} ${column.type}
          ${column.nullable ? "" : "NOT NULL"}
          ${column.defaultValue ? `DEFAULT ${column.defaultValue}` : ""}
        `);
    for (let [name, column] of newColumns) {
      let currentColumn = currentColumns.get(name);
      currentColumn && (currentColumn.type !== column.type && await client.query(`
            ALTER TABLE ${sanitizeTableName(tableName)}
            ALTER COLUMN ${sanitizeTableName(name)}
            TYPE ${column.type}
            USING ${sanitizeTableName(name)}::${column.type}
          `), currentColumn.nullable !== column.nullable && await client.query(`
            ALTER TABLE ${sanitizeTableName(tableName)}
            ALTER COLUMN ${sanitizeTableName(name)}
            ${column.nullable ? "DROP NOT NULL" : "SET NOT NULL"}
          `), currentColumn.defaultValue !== column.defaultValue && (column.defaultValue ? await client.query(`
              ALTER TABLE ${sanitizeTableName(tableName)}
              ALTER COLUMN ${sanitizeTableName(name)}
              SET DEFAULT ${column.defaultValue}
            `) : await client.query(`
              ALTER TABLE ${sanitizeTableName(tableName)}
              ALTER COLUMN ${sanitizeTableName(name)}
              DROP DEFAULT
            `)));
    }
    for (let [name] of currentColumns)
      newColumns.has(name) || await client.query(`
          ALTER TABLE ${sanitizeTableName(tableName)}
          DROP COLUMN ${sanitizeTableName(name)}
        `);
    if (JSON.stringify(currentSchema.primaryKey) !== JSON.stringify(schema.primaryKey) && (await client.query(`
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
      `), schema.primaryKey && schema.primaryKey.length > 0)) {
      let primaryKeyColumns = schema.primaryKey.map((col) => sanitizeTableName(col)).join(", ");
      await client.query(`
          ALTER TABLE ${sanitizeTableName(tableName)}
          ADD PRIMARY KEY (${primaryKeyColumns})
        `);
    }
    await client.query("COMMIT");
  } catch (error) {
    throw await client.query("ROLLBACK"), console.error("Error updating schema:", error), error;
  } finally {
    client.release();
  }
}
async function createTableRow(tableName, data) {
  let client = await pool.connect();
  try {
    let columns = Object.keys(data), values = Object.values(data), placeholders = values.map((_, i) => `$${i + 1}`).join(", "), query = `
      INSERT INTO ${sanitizeTableName(tableName)} 
      (${columns.map(sanitizeTableName).join(", ")})
      VALUES (${placeholders})
    `;
    await client.query(query, values);
  } catch (error) {
    throw console.error("Error creating row:", error), error;
  } finally {
    client.release();
  }
}

// app/components/DataView.tsx
import { startCase as startCase2 } from "lodash-es";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useSearchParams } from "@remix-run/react";

// app/components/RowDetailsSidebar.tsx
import { XMarkIcon } from "@heroicons/react/24/outline";
import { startCase } from "lodash-es";
import { createPortal } from "react-dom";
import { useEffect as useEffect2, useState as useState2 } from "react";

// app/utils/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// app/components/RowDetailsSidebar.tsx
import { Fragment, jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
function RowDetailsSidebar({
  row,
  columns,
  isOpen,
  onClose,
  formatCellValue
}) {
  let [mounted, setMounted] = useState2(!1);
  if (console.log(row, isOpen), useEffect2(() => (setMounted(!0), () => setMounted(!1)), []), !mounted)
    return null;
  let sidebarContent = /* @__PURE__ */ jsxDEV5(Fragment, { children: [
    /* @__PURE__ */ jsxDEV5(
      "div",
      {
        className: cn(
          "fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        ),
        onClick: onClose
      },
      void 0,
      !1,
      {
        fileName: "app/components/RowDetailsSidebar.tsx",
        lineNumber: 35,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV5(
      "div",
      {
        className: cn(
          "fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        ),
        children: /* @__PURE__ */ jsxDEV5("div", { className: "h-full flex flex-col", children: [
          /* @__PURE__ */ jsxDEV5("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxDEV5("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100", children: "Row Details" }, void 0, !1, {
              fileName: "app/components/RowDetailsSidebar.tsx",
              lineNumber: 50,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV5(
              "button",
              {
                onClick: onClose,
                className: "p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none",
                children: /* @__PURE__ */ jsxDEV5(XMarkIcon, { className: "h-6 w-6" }, void 0, !1, {
                  fileName: "app/components/RowDetailsSidebar.tsx",
                  lineNumber: 55,
                  columnNumber: 15
                }, this)
              },
              void 0,
              !1,
              {
                fileName: "app/components/RowDetailsSidebar.tsx",
                lineNumber: 51,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 49,
            columnNumber: 11
          }, this),
          row && /* @__PURE__ */ jsxDEV5("div", { className: "flex-1 overflow-y-auto p-4", children: /* @__PURE__ */ jsxDEV5("div", { className: "space-y-4", children: columns.map((column) => /* @__PURE__ */ jsxDEV5("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxDEV5("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDEV5("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: startCase(column.name) }, void 0, !1, {
                fileName: "app/components/RowDetailsSidebar.tsx",
                lineNumber: 64,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV5("span", { className: "text-xs text-gray-400 dark:text-gray-500", children: [
                "(",
                column.type,
                ")"
              ] }, void 0, !0, {
                fileName: "app/components/RowDetailsSidebar.tsx",
                lineNumber: 67,
                columnNumber: 23
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/RowDetailsSidebar.tsx",
              lineNumber: 63,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { className: "p-3 bg-gray-50 dark:bg-gray-900 rounded-md", children: /* @__PURE__ */ jsxDEV5("pre", { className: "text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words", children: formatCellValue(row[column.name]) }, void 0, !1, {
              fileName: "app/components/RowDetailsSidebar.tsx",
              lineNumber: 72,
              columnNumber: 23
            }, this) }, void 0, !1, {
              fileName: "app/components/RowDetailsSidebar.tsx",
              lineNumber: 71,
              columnNumber: 21
            }, this)
          ] }, column.name, !0, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 62,
            columnNumber: 19
          }, this)) }, void 0, !1, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 60,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 59,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/RowDetailsSidebar.tsx",
          lineNumber: 48,
          columnNumber: 9
        }, this)
      },
      void 0,
      !1,
      {
        fileName: "app/components/RowDetailsSidebar.tsx",
        lineNumber: 42,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/RowDetailsSidebar.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
  return createPortal(sidebarContent, document.body);
}

// app/components/DataView.tsx
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { jsxDEV as jsxDEV6 } from "react/jsx-dev-runtime";
function DataView({
  columns,
  rows,
  sortBy,
  sortOrder,
  onSort,
  formatCellValue,
  onEdit,
  onDelete,
  isEditable = !1,
  selectedRow,
  onRowSelect
}) {
  let [searchParams, setSearchParams] = useSearchParams(), editingCell = searchParams.get("editCell")?.split(",").map(Number), editedValue = searchParams.get("editValue"), handleStartEditing = (rowIndex, columnId) => {
    isEditable && setSearchParams((prev) => (prev.set("editCell", `${rowIndex},${columnId}`), prev.set("editValue", formatCellValue(rows[rowIndex][columnId])), prev), { replace: !0 });
  }, handleFinishEditing = (rowIndex, columnId) => {
    onEdit && editedValue !== null && onEdit(rowIndex, {
      ...rows[rowIndex],
      [columnId]: editedValue
    }), setSearchParams((prev) => (prev.delete("editCell"), prev.delete("editValue"), prev), { replace: !0 });
  }, columnHelper = createColumnHelper(), tableColumns = useMemo(() => [
    ...columns.map(
      (col) => columnHelper.accessor(col.name, {
        header: () => /* @__PURE__ */ jsxDEV6("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsxDEV6("span", { children: startCase2(col.name) }, void 0, !1, {
            fileName: "app/components/DataView.tsx",
            lineNumber: 79,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV6("span", { className: "text-xs text-gray-500", children: [
            "(",
            col.type,
            ")"
          ] }, void 0, !0, {
            fileName: "app/components/DataView.tsx",
            lineNumber: 80,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/DataView.tsx",
          lineNumber: 78,
          columnNumber: 11
        }, this),
        cell: ({ row, column, getValue }) => {
          let value = getValue();
          return isEditable && editingCell?.[0] === row.index && String(column.id) === String(editingCell?.[1]) ? /* @__PURE__ */ jsxDEV6(
            "input",
            {
              className: "w-full px-2 py-1 border rounded bg-white dark:bg-gray-800",
              value: editedValue ?? formatCellValue(value),
              onChange: (e) => setSearchParams((prev) => (prev.set("editValue", e.target.value), prev), { replace: !0 }),
              onBlur: () => handleFinishEditing(row.index, column.id),
              autoFocus: !0
            },
            void 0,
            !1,
            {
              fileName: "app/components/DataView.tsx",
              lineNumber: 91,
              columnNumber: 15
            },
            this
          ) : /* @__PURE__ */ jsxDEV6(
            "div",
            {
              className: cn(
                "overflow-hidden text-ellipsis",
                isEditable && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                selectedRow === row.index && "bg-blue-50 dark:bg-blue-900"
              ),
              onClick: () => {
                isEditable && handleStartEditing(row.index, column.id), onRowSelect && onRowSelect(selectedRow === row.index ? null : row.index);
              },
              style: { maxWidth: "300px" },
              children: formatCellValue(value)
            },
            void 0,
            !1,
            {
              fileName: "app/components/DataView.tsx",
              lineNumber: 107,
              columnNumber: 13
            },
            this
          );
        }
      })
    ),
    ...isEditable && onDelete ? [
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => /* @__PURE__ */ jsxDEV6("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxDEV6(
          "button",
          {
            onClick: () => onDelete(row.index),
            className: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
            children: "Delete"
          },
          void 0,
          !1,
          {
            fileName: "app/components/DataView.tsx",
            lineNumber: 136,
            columnNumber: 17
          },
          this
        ) }, void 0, !1, {
          fileName: "app/components/DataView.tsx",
          lineNumber: 135,
          columnNumber: 15
        }, this)
      })
    ] : []
  ], [columns, isEditable, onDelete, selectedRow, editingCell, editedValue, formatCellValue]), table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []
    },
    onSortingChange: (updater) => {
      let newSorting = typeof updater == "function" ? updater([]) : updater;
      newSorting.length > 0 && onSort(newSorting[0].id);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: !0,
    columnResizeMode: "onChange"
  });
  return /* @__PURE__ */ jsxDEV6("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxDEV6("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsxDEV6("div", { className: "absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxDEV6("div", { className: "h-full overflow-auto", children: /* @__PURE__ */ jsxDEV6("table", { className: "w-full divide-y divide-gray-200 dark:divide-gray-700", style: { width: table.getTotalSize() }, children: [
      /* @__PURE__ */ jsxDEV6("thead", { className: "sticky top-0 bg-white dark:bg-gray-900 shadow-sm z-10", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxDEV6("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxDEV6(
        "th",
        {
          className: "group relative px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap select-none bg-white dark:bg-gray-900",
          onClick: header.column.getToggleSortingHandler(),
          style: {
            width: header.getSize(),
            position: "relative"
          },
          children: [
            /* @__PURE__ */ jsxDEV6("div", { className: "flex items-center justify-center", children: [
              flexRender(
                header.column.columnDef.header,
                header.getContext()
              ),
              /* @__PURE__ */ jsxDEV6("span", { className: "ml-1", children: [
                header.column.getIsSorted() === "asc" ? "\u2191" : "",
                header.column.getIsSorted() === "desc" ? "\u2193" : ""
              ] }, void 0, !0, {
                fileName: "app/components/DataView.tsx",
                lineNumber: 191,
                columnNumber: 27
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/DataView.tsx",
              lineNumber: 186,
              columnNumber: 25
            }, this),
            header.column.getCanResize() && /* @__PURE__ */ jsxDEV6(
              "div",
              {
                onMouseDown: header.getResizeHandler(),
                onTouchStart: header.getResizeHandler(),
                className: "absolute right-0 top-2 bottom-2 w-4 cursor-col-resize select-none touch-none group/resizer",
                style: { cursor: "col-resize" },
                children: /* @__PURE__ */ jsxDEV6(
                  "div",
                  {
                    className: cn(
                      "absolute right-0 h-full",
                      header.column.getIsResizing() ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700 group-hover/resizer:bg-blue-500"
                    ),
                    style: { width: "1px" }
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/DataView.tsx",
                    lineNumber: 203,
                    columnNumber: 29
                  },
                  this
                )
              },
              void 0,
              !1,
              {
                fileName: "app/components/DataView.tsx",
                lineNumber: 197,
                columnNumber: 27
              },
              this
            )
          ]
        },
        header.id,
        !0,
        {
          fileName: "app/components/DataView.tsx",
          lineNumber: 177,
          columnNumber: 23
        },
        this
      )) }, headerGroup.id, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 175,
        columnNumber: 19
      }, this)) }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 173,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV6("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsxDEV6(
        "tr",
        {
          className: cn(
            "group hover:bg-gray-50 dark:hover:bg-gray-800",
            selectedRow === row.index && "bg-blue-50 dark:bg-blue-900"
          ),
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsxDEV6(
            "td",
            {
              className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
              children: /* @__PURE__ */ jsxDEV6("div", { className: "flex items-center", children: [
                flexRender(cell.column.columnDef.cell, cell.getContext()),
                cell.column.id === columns[0].name && /* @__PURE__ */ jsxDEV6(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.preventDefault(), e.stopPropagation(), onRowSelect && onRowSelect(selectedRow === row.index ? null : row.index);
                    },
                    className: "ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
                    children: /* @__PURE__ */ jsxDEV6(ArrowTopRightOnSquareIcon, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" }, void 0, !1, {
                      fileName: "app/components/DataView.tsx",
                      lineNumber: 247,
                      columnNumber: 31
                    }, this)
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/DataView.tsx",
                    lineNumber: 236,
                    columnNumber: 29
                  },
                  this
                )
              ] }, void 0, !0, {
                fileName: "app/components/DataView.tsx",
                lineNumber: 233,
                columnNumber: 25
              }, this)
            },
            cell.id,
            !1,
            {
              fileName: "app/components/DataView.tsx",
              lineNumber: 229,
              columnNumber: 23
            },
            this
          ))
        },
        row.id,
        !1,
        {
          fileName: "app/components/DataView.tsx",
          lineNumber: 221,
          columnNumber: 19
        },
        this
      )) }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 219,
        columnNumber: 15
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 172,
      columnNumber: 13
    }, this) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 171,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 170,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 169,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV6(
      RowDetailsSidebar,
      {
        row: rows[selectedRow ?? -1] ?? null,
        columns,
        isOpen: selectedRow !== void 0,
        onClose: () => {
          onRowSelect && onRowSelect(null);
        },
        formatCellValue
      },
      void 0,
      !1,
      {
        fileName: "app/components/DataView.tsx",
        lineNumber: 260,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 168,
    columnNumber: 5
  }, this);
}

// app/components/TableStructure.tsx
import { useState as useState3 } from "react";
import { Fragment as Fragment2, jsxDEV as jsxDEV7 } from "react/jsx-dev-runtime";
function TableStructure({ schema, onSave, readOnly = !1 }) {
  let [editingSchema, setEditingSchema] = useState3(schema), [isEditing, setIsEditing] = useState3(!1), handleColumnChange = (index, field, value) => {
    let newColumns = [...editingSchema.columns];
    newColumns[index] = { ...newColumns[index], [field]: value }, setEditingSchema({ ...editingSchema, columns: newColumns });
  }, addColumn = () => {
    let newColumn = {
      name: "",
      type: "text",
      nullable: !0
    };
    setEditingSchema({
      ...editingSchema,
      columns: [...editingSchema.columns, newColumn]
    });
  }, removeColumn = (index) => {
    let newColumns = editingSchema.columns.filter((_, i) => i !== index);
    setEditingSchema({ ...editingSchema, columns: newColumns });
  };
  return /* @__PURE__ */ jsxDEV7("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV7("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxDEV7("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Table Structure" }, void 0, !1, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 52,
        columnNumber: 9
      }, this),
      !readOnly && /* @__PURE__ */ jsxDEV7("div", { className: "space-x-2", children: isEditing ? /* @__PURE__ */ jsxDEV7(Fragment2, { children: [
        /* @__PURE__ */ jsxDEV7(
          "button",
          {
            onClick: async () => {
              onSave && (await onSave(editingSchema), setIsEditing(!1));
            },
            className: "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors",
            children: "Save Changes"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 59,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ jsxDEV7(
          "button",
          {
            onClick: () => {
              setEditingSchema(schema), setIsEditing(!1);
            },
            className: "px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors",
            children: "Cancel"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 65,
            columnNumber: 17
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 58,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV7(
        "button",
        {
          onClick: () => setIsEditing(!0),
          className: "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors",
          children: "Edit Structure"
        },
        void 0,
        !1,
        {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 73,
          columnNumber: 15
        },
        this
      ) }, void 0, !1, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 56,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/TableStructure.tsx",
      lineNumber: 51,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV7("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV7("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [
      /* @__PURE__ */ jsxDEV7("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxDEV7("tr", { children: [
        /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Column Name" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 88,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Data Type" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 91,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Nullable" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 94,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Default Value" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 97,
          columnNumber: 15
        }, this),
        isEditing && /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 101,
          columnNumber: 17
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 87,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 86,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV7("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: editingSchema.columns.map((column, index) => /* @__PURE__ */ jsxDEV7("tr", { children: [
        /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap", children: isEditing ? /* @__PURE__ */ jsxDEV7(
          "input",
          {
            type: "text",
            value: column.name,
            onChange: (e) => handleColumnChange(index, "name", e.target.value),
            className: "w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 112,
            columnNumber: 21
          },
          this
        ) : /* @__PURE__ */ jsxDEV7("span", { className: "text-gray-900 dark:text-white", children: column.name }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 119,
          columnNumber: 21
        }, this) }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 110,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap", children: isEditing ? /* @__PURE__ */ jsxDEV7(
          "select",
          {
            value: column.type,
            onChange: (e) => handleColumnChange(index, "type", e.target.value),
            className: "w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            children: [
              /* @__PURE__ */ jsxDEV7("option", { value: "text", children: "Text" }, void 0, !1, {
                fileName: "app/components/TableStructure.tsx",
                lineNumber: 129,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV7("option", { value: "integer", children: "Integer" }, void 0, !1, {
                fileName: "app/components/TableStructure.tsx",
                lineNumber: 130,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV7("option", { value: "boolean", children: "Boolean" }, void 0, !1, {
                fileName: "app/components/TableStructure.tsx",
                lineNumber: 131,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV7("option", { value: "timestamp", children: "Timestamp" }, void 0, !1, {
                fileName: "app/components/TableStructure.tsx",
                lineNumber: 132,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV7("option", { value: "numeric", children: "Numeric" }, void 0, !1, {
                fileName: "app/components/TableStructure.tsx",
                lineNumber: 133,
                columnNumber: 23
              }, this)
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 124,
            columnNumber: 21
          },
          this
        ) : /* @__PURE__ */ jsxDEV7("span", { className: "text-gray-900 dark:text-white", children: column.type }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 136,
          columnNumber: 21
        }, this) }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 122,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap", children: isEditing ? /* @__PURE__ */ jsxDEV7(
          "input",
          {
            type: "checkbox",
            checked: column.nullable,
            onChange: (e) => handleColumnChange(index, "nullable", e.target.checked),
            className: "rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 141,
            columnNumber: 21
          },
          this
        ) : /* @__PURE__ */ jsxDEV7("span", { className: "text-gray-900 dark:text-white", children: column.nullable ? "Yes" : "No" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 148,
          columnNumber: 21
        }, this) }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 139,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap", children: isEditing ? /* @__PURE__ */ jsxDEV7(
          "input",
          {
            type: "text",
            value: column.defaultValue || "",
            onChange: (e) => handleColumnChange(index, "defaultValue", e.target.value),
            className: "w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 155,
            columnNumber: 21
          },
          this
        ) : /* @__PURE__ */ jsxDEV7("span", { className: "text-gray-900 dark:text-white", children: column.defaultValue || "-" }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 162,
          columnNumber: 21
        }, this) }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 153,
          columnNumber: 17
        }, this),
        isEditing && /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxDEV7(
          "button",
          {
            onClick: () => removeColumn(index),
            className: "text-red-600 hover:text-red-900 dark:hover:text-red-400",
            children: "Remove"
          },
          void 0,
          !1,
          {
            fileName: "app/components/TableStructure.tsx",
            lineNumber: 169,
            columnNumber: 21
          },
          this
        ) }, void 0, !1, {
          fileName: "app/components/TableStructure.tsx",
          lineNumber: 168,
          columnNumber: 19
        }, this)
      ] }, index, !0, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 109,
        columnNumber: 15
      }, this)) }, void 0, !1, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 107,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/TableStructure.tsx",
      lineNumber: 85,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/TableStructure.tsx",
      lineNumber: 84,
      columnNumber: 7
    }, this),
    isEditing && /* @__PURE__ */ jsxDEV7(
      "button",
      {
        onClick: addColumn,
        className: "mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors",
        children: "Add Column"
      },
      void 0,
      !1,
      {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 184,
        columnNumber: 9
      },
      this
    ),
    schema.primaryKey && /* @__PURE__ */ jsxDEV7("div", { className: "mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md", children: [
      /* @__PURE__ */ jsxDEV7("h3", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Primary Key" }, void 0, !1, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 194,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV7("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: schema.primaryKey.join(", ") }, void 0, !1, {
        fileName: "app/components/TableStructure.tsx",
        lineNumber: 195,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/TableStructure.tsx",
      lineNumber: 193,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/TableStructure.tsx",
    lineNumber: 50,
    columnNumber: 5
  }, this);
}

// app/components/StructureView.tsx
import { jsxDEV as jsxDEV8 } from "react/jsx-dev-runtime";
function StructureView({ schema, onSave }) {
  return /* @__PURE__ */ jsxDEV8("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow", children: /* @__PURE__ */ jsxDEV8("div", { className: "p-6", children: /* @__PURE__ */ jsxDEV8(TableStructure, { schema, onSave }, void 0, !1, {
    fileName: "app/components/StructureView.tsx",
    lineNumber: 13,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/components/StructureView.tsx",
    lineNumber: 12,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/StructureView.tsx",
    lineNumber: 11,
    columnNumber: 5
  }, this);
}

// app/components/TabView.tsx
import { startCase as startCase3 } from "lodash-es";
import { jsxDEV as jsxDEV9 } from "react/jsx-dev-runtime";
function TabView({ tabs, activeTab, onTabChange }) {
  return /* @__PURE__ */ jsxDEV9("div", { className: "flex flex-col bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxDEV9("div", { className: "flex border-b border-gray-200 dark:border-gray-700", children: tabs.map((tab) => {
    let isActive = activeTab === tab.id;
    return /* @__PURE__ */ jsxDEV9(
      "button",
      {
        onClick: () => onTabChange(tab.id),
        className: `px-6 py-3 text-sm font-medium border-b-2 -mb-px ${isActive ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"}`,
        children: tab.label
      },
      tab.id,
      !1,
      {
        fileName: "app/components/TabView.tsx",
        lineNumber: 35,
        columnNumber: 13
      },
      this
    );
  }) }, void 0, !1, {
    fileName: "app/components/TabView.tsx",
    lineNumber: 31,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/TabView.tsx",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}

// app/components/Button.tsx
import { forwardRef } from "react";
import { jsxDEV as jsxDEV10 } from "react/jsx-dev-runtime";
var Button = forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => /* @__PURE__ */ jsxDEV10(
    "button",
    {
      ref,
      className: cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600": variant === "primary",
          "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700": variant === "secondary",
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600": variant === "danger"
        },
        {
          "text-sm px-3 py-1.5": size === "sm",
          "text-sm px-4 py-2": size === "md",
          "text-base px-6 py-3": size === "lg"
        },
        className
      ),
      ...props
    },
    void 0,
    !1,
    {
      fileName: "app/components/Button.tsx",
      lineNumber: 12,
      columnNumber: 7
    },
    this
  )
);

// app/components/CreateRowModal.tsx
import { useState as useState4 } from "react";
import { jsxDEV as jsxDEV11 } from "react/jsx-dev-runtime";
function CreateRowModal({ tableName, fields, onClose, onSubmit }) {
  let [formData, setFormData] = useState4({}), [isSubmitting, setIsSubmitting] = useState4(!1);
  return /* @__PURE__ */ jsxDEV11("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxDEV11("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: [
    /* @__PURE__ */ jsxDEV11("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: onClose }, void 0, !1, {
      fileName: "app/components/CreateRowModal.tsx",
      lineNumber: 32,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV11("div", { className: "relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6", children: /* @__PURE__ */ jsxDEV11("div", { children: [
      /* @__PURE__ */ jsxDEV11("h3", { className: "text-lg font-medium leading-6 text-gray-900 dark:text-white", children: [
        "Create Row in ",
        tableName
      ] }, void 0, !0, {
        fileName: "app/components/CreateRowModal.tsx",
        lineNumber: 35,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV11("form", { onSubmit: async (e) => {
        e.preventDefault(), setIsSubmitting(!0);
        try {
          await onSubmit(formData), onClose();
        } catch {
        } finally {
          setIsSubmitting(!1);
        }
      }, className: "mt-4 space-y-4", children: [
        fields.map((field) => /* @__PURE__ */ jsxDEV11("div", { children: [
          /* @__PURE__ */ jsxDEV11("label", { htmlFor: field.name, className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: [
            field.name,
            !field.nullable && /* @__PURE__ */ jsxDEV11("span", { className: "text-red-500 ml-1", children: "*" }, void 0, !1, {
              fileName: "app/components/CreateRowModal.tsx",
              lineNumber: 43,
              columnNumber: 41
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/CreateRowModal.tsx",
            lineNumber: 41,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV11(
            "input",
            {
              type: field.type === "number" ? "number" : "text",
              name: field.name,
              id: field.name,
              required: !field.nullable,
              value: formData[field.name] || "",
              onChange: (e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value })),
              className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            },
            void 0,
            !1,
            {
              fileName: "app/components/CreateRowModal.tsx",
              lineNumber: 45,
              columnNumber: 19
            },
            this
          )
        ] }, field.name, !0, {
          fileName: "app/components/CreateRowModal.tsx",
          lineNumber: 40,
          columnNumber: 17
        }, this)),
        /* @__PURE__ */ jsxDEV11("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3", children: [
          /* @__PURE__ */ jsxDEV11(
            Button,
            {
              type: "submit",
              disabled: isSubmitting,
              className: "inline-flex w-full justify-center sm:col-start-2",
              children: isSubmitting ? "Creating..." : "Create"
            },
            void 0,
            !1,
            {
              fileName: "app/components/CreateRowModal.tsx",
              lineNumber: 57,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV11(
            Button,
            {
              type: "button",
              onClick: onClose,
              disabled: isSubmitting,
              className: "mt-3 inline-flex w-full justify-center sm:col-start-1 sm:mt-0",
              variant: "secondary",
              children: "Cancel"
            },
            void 0,
            !1,
            {
              fileName: "app/components/CreateRowModal.tsx",
              lineNumber: 64,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/CreateRowModal.tsx",
          lineNumber: 56,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/CreateRowModal.tsx",
        lineNumber: 38,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/CreateRowModal.tsx",
      lineNumber: 34,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/CreateRowModal.tsx",
      lineNumber: 33,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/CreateRowModal.tsx",
    lineNumber: 31,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/CreateRowModal.tsx",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}

// app/components/PageContainer.tsx
import { jsxDEV as jsxDEV12 } from "react/jsx-dev-runtime";
function PageContainer({ children }) {
  return /* @__PURE__ */ jsxDEV12("div", { className: "h-screen p-4 bg-gray-100 dark:bg-gray-950", children: /* @__PURE__ */ jsxDEV12("div", { className: "h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden flex flex-col", children }, void 0, !1, {
    fileName: "app/components/PageContainer.tsx",
    lineNumber: 10,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/PageContainer.tsx",
    lineNumber: 9,
    columnNumber: 5
  }, this);
}

// app/routes/$tableName.tsx
import { jsxDEV as jsxDEV13 } from "react/jsx-dev-runtime";
async function loader({ params, request }) {
  let url = new URL(request.url), sortBy = url.searchParams.get("sortBy") || void 0, sortOrder = url.searchParams.get("sortOrder"), activeTab = url.searchParams.get("tab") || "data", showCreateModal = url.searchParams.get("showCreateModal") === "true", tableName = params.tableName;
  if (!tableName)
    throw new Response("Table name is required", { status: 400 });
  try {
    let [schemas, tableData] = await Promise.all([
      fetchSchema(),
      fetchTableData(tableName, sortBy, sortOrder)
    ]), schema = schemas.find((s) => s.name === tableName);
    if (!schema)
      throw new Response("Table not found", { status: 404 });
    return json({
      tableName,
      schema,
      tableData,
      activeTab,
      showCreateModal
    });
  } catch (error) {
    throw console.error(`Error loading table ${tableName}:`, error), new Response("Error loading table data", { status: 500 });
  }
}
async function action({ request, params }) {
  let tableName = params.tableName;
  if (!tableName)
    throw new Response("Table name is required", { status: 400 });
  let formData = await request.formData(), data = Object.fromEntries(formData);
  try {
    return await createTableRow(tableName, data), json({ success: !0 });
  } catch (error) {
    throw console.error(`Error creating row in table ${tableName}:`, error), new Response("Error creating row", { status: 500 });
  }
}
function TableRoute() {
  let { tableName, schema, tableData, activeTab, showCreateModal } = useLoaderData(), [searchParams, setSearchParams] = useSearchParams2(), submit = useSubmit(), sortBy = searchParams.get("sortBy"), sortOrder = searchParams.get("sortOrder"), handleSort = (column) => {
    let newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSearchParams((prev) => (prev.set("sortBy", column), prev.set("sortOrder", newSortOrder), prev));
  }, handleTabChange = (tab) => {
    setSearchParams((prev) => (prev.set("tab", tab), prev));
  }, handleCreateModalToggle = (show) => {
    setSearchParams((prev) => (show ? prev.set("showCreateModal", "true") : prev.delete("showCreateModal"), prev));
  }, handleSchemaUpdate = async (updatedSchema) => {
    try {
      await updateTableSchema(tableName, updatedSchema), window.location.reload();
    } catch (error) {
      console.error("Failed to update schema:", error), alert("Failed to update schema. Please try again.");
    }
  }, handleCreateRow = async (data) => {
    try {
      let formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      }), await submit(formData, { method: "post" }), handleCreateModalToggle(!1);
    } catch (error) {
      console.error("Failed to create row:", error), alert("Failed to create row. Please try again.");
    }
  }, handleEdit = async (rowIndex, data) => {
    try {
      console.log("Editing row:", rowIndex, data);
    } catch (error) {
      console.error("Error editing row:", error);
    }
  }, handleDelete = async (rowIndex) => {
    try {
      console.log("Deleting row:", rowIndex);
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  }, formatCellValue = (value) => {
    if (value === null)
      return "null";
    if (value === void 0)
      return "";
    if (typeof value == "object")
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    return String(value);
  };
  return /* @__PURE__ */ jsxDEV13(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV13("div", { className: "flex-none", children: [
      /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxDEV13("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-white", children: tableName }, void 0, !1, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 170,
          columnNumber: 11
        }, this),
        activeTab === "data" && /* @__PURE__ */ jsxDEV13("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxDEV13(Button, { onClick: () => handleCreateModalToggle(!0), children: "Create Row" }, void 0, !1, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 175,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 174,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 169,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV13(
        TabView,
        {
          tabs: [
            { label: "Data", id: "data" },
            { label: "Structure", id: "structure" }
          ],
          activeTab,
          onTabChange: handleTabChange
        },
        void 0,
        !1,
        {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 181,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 168,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV13("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: activeTab === "data" ? tableData ? /* @__PURE__ */ jsxDEV13(
      DataView,
      {
        columns: schema?.columns || [],
        rows: tableData.data,
        sortBy: sortBy || "",
        sortOrder,
        onSort: handleSort,
        formatCellValue,
        onEdit: handleEdit,
        onDelete: handleDelete,
        isEditable: !0
      },
      void 0,
      !1,
      {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 190,
        columnNumber: 13
      },
      this
    ) : null : /* @__PURE__ */ jsxDEV13(
      StructureView,
      {
        schema,
        onSave: handleSchemaUpdate
      },
      void 0,
      !1,
      {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 203,
        columnNumber: 11
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 187,
      columnNumber: 7
    }, this),
    showCreateModal && /* @__PURE__ */ jsxDEV13(
      CreateRowModal,
      {
        tableName,
        fields: schema?.columns || [],
        onClose: () => handleCreateModalToggle(!1),
        onSubmit: handleCreateRow
      },
      void 0,
      !1,
      {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 210,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 167,
    columnNumber: 5
  }, this);
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader2,
  meta: () => meta
});
import { json as json2 } from "@remix-run/node";
import { useLoaderData as useLoaderData2 } from "@remix-run/react";
import { useState as useState5 } from "react";

// app/components/TableList.tsx
import { Link as Link2 } from "@remix-run/react";
import { startCase as startCase4 } from "lodash-es";
import { jsxDEV as jsxDEV14 } from "react/jsx-dev-runtime";
function formatBytes(bytes) {
  let units = ["B", "KB", "MB", "GB", "TB"], size = bytes, unitIndex = 0;
  for (; size >= 1024 && unitIndex < units.length - 1; )
    size /= 1024, unitIndex++;
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
function formatNumber(num) {
  return !num || num < 0 ? "0" : new Intl.NumberFormat().format(num);
}
function prettyPrintName(name) {
  return startCase4(name.toLowerCase());
}
function TableList({ tables }) {
  return /* @__PURE__ */ jsxDEV14("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: tables.map((table) => /* @__PURE__ */ jsxDEV14(
    Link2,
    {
      to: `/${table.name}`,
      className: "group block w-full p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl",
      children: [
        /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxDEV14("h5", { className: "text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate max-w-[80%]", children: prettyPrintName(table.name) }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 41,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV14("span", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400", children: /* @__PURE__ */ jsxDEV14("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV14("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 46,
            columnNumber: 17
          }, this) }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 45,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 44,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 40,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV14("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxDEV14("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV14("span", { className: "font-bold", children: table.columns.length }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 53,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV14("span", { className: "italic text-gray-500 dark:text-gray-400", children: "columns" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 54,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 52,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV14("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 56,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV14("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV14("span", { className: "font-bold", children: formatNumber(table.rowCount) }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 58,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV14("span", { className: "italic text-gray-500 dark:text-gray-400", children: "rows" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 59,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 57,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV14("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 61,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV14("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV14("span", { className: "font-bold", children: formatBytes(table.sizeInBytes) }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 63,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV14("span", { className: "italic text-gray-500 dark:text-gray-400", children: "size" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 64,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 62,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 51,
            columnNumber: 13
          }, this),
          Array.isArray(table.primaryKey) && table.primaryKey.length > 0 && /* @__PURE__ */ jsxDEV14("p", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: [
            /* @__PURE__ */ jsxDEV14("span", { className: "font-normal text-gray-500 dark:text-gray-400", children: "Primary Key:" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 69,
              columnNumber: 17
            }, this),
            " ",
            /* @__PURE__ */ jsxDEV14("span", { className: "font-mono text-purple-600 dark:text-purple-400", children: table.primaryKey.map(prettyPrintName).join(", ") }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 70,
              columnNumber: 17
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 68,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 50,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV14("div", { className: "mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400", children: [
          /* @__PURE__ */ jsxDEV14("span", { children: "View table" }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 77,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV14("svg", { className: "flex-shrink-0 w-4 h-4 ml-1 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV14("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 79,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 78,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 76,
          columnNumber: 11
        }, this)
      ]
    },
    table.name,
    !0,
    {
      fileName: "app/components/TableList.tsx",
      lineNumber: 35,
      columnNumber: 9
    },
    this
  )) }, void 0, !1, {
    fileName: "app/components/TableList.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
}

// app/routes/_index.tsx
import { jsxDEV as jsxDEV15 } from "react/jsx-dev-runtime";
var meta = () => [
  { title: "Data Studio" },
  { name: "description", content: "Database management studio" }
];
async function loader2({ request }) {
  try {
    let tables = await fetchSchema();
    return json2({ tables });
  } catch (error) {
    return console.error("Error loading tables:", error), json2({ tables: [] });
  }
}
function Index() {
  let { tables } = useLoaderData2(), [searchTerm, setSearchTerm] = useState5(""), filteredTables = tables.filter(
    (table) => table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return /* @__PURE__ */ jsxDEV15(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV15("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV15("div", { className: "relative", children: [
      /* @__PURE__ */ jsxDEV15(
        "input",
        {
          type: "text",
          placeholder: "Search tables...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: "w-full p-3 pl-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_index.tsx",
          lineNumber: 37,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV15("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxDEV15("svg", { className: "h-5 w-5 text-gray-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxDEV15("path", { fillRule: "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule: "evenodd" }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 46,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 45,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 44,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 36,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV15("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxDEV15(TableList, { tables: filteredTables }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 53,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 52,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
}

// app/routes/query.tsx
var query_exports = {};
__export(query_exports, {
  default: () => QueryPage
});
import { useState as useState6 } from "react";
import { format as format2 } from "sql-formatter";
import { jsxDEV as jsxDEV16 } from "react/jsx-dev-runtime";
function QueryPage() {
  let [query, setQuery] = useState6(""), [results, setResults] = useState6(null), [error, setError] = useState6(null), [isLoading, setIsLoading] = useState6(!1);
  return /* @__PURE__ */ jsxDEV16(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV16("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV16("h1", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "SQL Query" }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV16("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxDEV16("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxDEV16("div", { children: [
        /* @__PURE__ */ jsxDEV16("div", { className: "flex justify-between mb-2", children: [
          /* @__PURE__ */ jsxDEV16("label", { htmlFor: "query", className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "SQL Query" }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 45,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV16(
            "button",
            {
              onClick: () => {
                try {
                  let formatted = format2(query, { language: "postgresql" });
                  setQuery(formatted);
                } catch {
                  setError("Error formatting query");
                }
              },
              className: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
              children: "Format Query"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/query.tsx",
              lineNumber: 48,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/query.tsx",
          lineNumber: 44,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV16(
          "textarea",
          {
            id: "query",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            rows: 4,
            className: "w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600",
            placeholder: "Enter your SQL query here..."
          },
          void 0,
          !1,
          {
            fileName: "app/routes/query.tsx",
            lineNumber: 55,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/query.tsx",
        lineNumber: 43,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV16("div", { children: /* @__PURE__ */ jsxDEV16(
        "button",
        {
          onClick: async () => {
            setIsLoading(!0), setError(null);
            try {
              let result = await executeQuery(query);
              setResults(result);
            } catch (err) {
              setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
              setIsLoading(!1);
            }
          },
          disabled: isLoading || !query.trim(),
          className: "w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isLoading ? "Executing..." : "Execute Query"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/query.tsx",
          lineNumber: 66,
          columnNumber: 13
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 65,
        columnNumber: 11
      }, this),
      error && /* @__PURE__ */ jsxDEV16("div", { className: "p-4 bg-red-50 dark:bg-red-900/50 rounded-lg", children: /* @__PURE__ */ jsxDEV16("p", { className: "text-sm text-red-700 dark:text-red-300", children: error }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 77,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 76,
        columnNumber: 13
      }, this),
      results && /* @__PURE__ */ jsxDEV16("div", { children: [
        /* @__PURE__ */ jsxDEV16("h2", { className: "text-xl font-semibold mb-4", children: "Results" }, void 0, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 83,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV16("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV16("table", { className: "w-full divide-y divide-gray-300 dark:divide-gray-700", children: [
          /* @__PURE__ */ jsxDEV16("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxDEV16("tr", { children: results.fields?.map((field) => /* @__PURE__ */ jsxDEV16(
            "th",
            {
              className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
              children: field.name
            },
            field.name,
            !1,
            {
              fileName: "app/routes/query.tsx",
              lineNumber: 89,
              columnNumber: 25
            },
            this
          )) }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 87,
            columnNumber: 21
          }, this) }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 86,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV16("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: results.rows?.map((row, rowIndex) => /* @__PURE__ */ jsxDEV16("tr", { children: Object.values(row).map((value, colIndex) => /* @__PURE__ */ jsxDEV16(
            "td",
            {
              className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
              children: value === null ? "NULL" : String(value)
            },
            colIndex,
            !1,
            {
              fileName: "app/routes/query.tsx",
              lineNumber: 102,
              columnNumber: 27
            },
            this
          )) }, rowIndex, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 100,
            columnNumber: 23
          }, this)) }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 98,
            columnNumber: 19
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/query.tsx",
          lineNumber: 85,
          columnNumber: 17
        }, this) }, void 0, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 84,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/query.tsx",
        lineNumber: 82,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/query.tsx",
      lineNumber: 42,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/query.tsx",
    lineNumber: 36,
    columnNumber: 5
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-F52VPBZ7.js", imports: ["/build/_shared/chunk-3VPVJWTU.js", "/build/_shared/chunk-HDRCTI32.js", "/build/_shared/chunk-RTBKPWXJ.js", "/build/_shared/chunk-NO3FWBWP.js", "/build/_shared/chunk-ULL77KT2.js", "/build/_shared/chunk-UG3ISROB.js", "/build/_shared/chunk-R3YRPWCC.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-D6ECVS3Z.js", imports: ["/build/_shared/chunk-56WY5XKF.js", "/build/_shared/chunk-2ITZUYVB.js", "/build/_shared/chunk-UQY4TBPG.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/$tableName": { id: "routes/$tableName", parentId: "root", path: ":tableName", index: void 0, caseSensitive: void 0, module: "/build/routes/$tableName-2JM76B7Q.js", imports: ["/build/_shared/chunk-FRNKA3J3.js", "/build/_shared/chunk-47F22B26.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-OUCT5THC.js", imports: ["/build/_shared/chunk-FRNKA3J3.js", "/build/_shared/chunk-47F22B26.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/query": { id: "routes/query", parentId: "root", path: "query", index: void 0, caseSensitive: void 0, module: "/build/routes/query-6QIF55U7.js", imports: ["/build/_shared/chunk-47F22B26.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "df5abd38", hmr: { runtime: "/build/_shared/chunk-UG3ISROB.js", timestamp: 1732577716500 }, url: "/build/manifest-DF5ABD38.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !0, v3_relativeSplatPath: !0, v3_throwAbortReason: !0, v3_routeConfig: !1, v3_singleFetch: !0, v3_lazyRouteDiscovery: !0, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/$tableName": {
    id: "routes/$tableName",
    parentId: "root",
    path: ":tableName",
    index: void 0,
    caseSensitive: void 0,
    module: tableName_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/query": {
    id: "routes/query",
    parentId: "root",
    path: "query",
    index: void 0,
    caseSensitive: void 0,
    module: query_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
//# sourceMappingURL=index.js.map
