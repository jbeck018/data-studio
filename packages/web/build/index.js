var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// app/utils/pool.server.ts
import pkg4 from "pg";
var Pool4, pool2, init_pool_server = __esm({
  "app/utils/pool.server.ts"() {
    "use strict";
    ({ Pool: Pool4 } = pkg4), pool2 = new Pool4({
      user: process.env.PGUSER || "postgres",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      port: parseInt(process.env.PGPORT || "5432")
    });
    pool2.on("error", (err) => {
      console.error("Unexpected error on idle client", err), process.exit(-1);
    });
  }
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
var SQLSanitizer, sqlSanitizer, init_sql_sanitizer_server = __esm({
  "app/utils/sql-sanitizer.server.ts"() {
    "use strict";
    SQLSanitizer = class {
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
  }
});

// app/utils/api.server.ts
var api_server_exports = {};
__export(api_server_exports, {
  executeQuery: () => executeQuery,
  fetchSchema: () => fetchSchema,
  fetchTableData: () => fetchTableData
});
async function fetchSchema() {
  console.log("Attempting to fetch schema...");
  let client = await pool2.connect();
  try {
    return console.log("Connected to database, executing query..."), (await client.query(`
      SELECT 
        tables.table_name,
        json_agg(
          json_build_object(
            'column_name', columns.column_name,
            'data_type', columns.data_type,
            'is_nullable', columns.is_nullable,
            'column_default', columns.column_default
          )
        ) as columns,
        json_agg(
          CASE WHEN pk.column_name IS NOT NULL 
          THEN columns.column_name 
          END
        ) FILTER (WHERE pk.column_name IS NOT NULL) as primary_key
      FROM 
        information_schema.tables
        JOIN information_schema.columns ON tables.table_name = columns.table_name
        LEFT JOIN (
          SELECT 
            tc.table_name, kcu.column_name
          FROM 
            information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON tables.table_name = pk.table_name 
          AND columns.column_name = pk.column_name
      WHERE 
        tables.table_schema = 'public'
      GROUP BY 
        tables.table_name;
    `)).rows.map((row) => ({
      name: row.table_name,
      columns: row.columns.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === "YES",
        defaultValue: col.column_default || void 0
      })),
      primaryKey: row.primary_key || void 0,
      rowCount: 0,
      // This would need a separate query to get accurate count
      sizeInBytes: 0
      // This would need a separate query to get accurate size
    }));
  } finally {
    client.release();
  }
}
async function fetchTableData(tableName, sortBy, sortOrder = "asc") {
  let sanitizedTableName = sanitizeTableName(tableName), sanitizedSortBy = sortBy ? sanitizeTableName(sortBy) : null, orderClause = sanitizedSortBy ? `ORDER BY "${sanitizedSortBy}" ${sortOrder}` : "", client = await pool2.connect();
  try {
    let result = await client.query(
      `SELECT * FROM "${sanitizedTableName}" ${orderClause}`
    );
    return {
      data: result.rows,
      totalRows: result.rowCount || 0
    };
  } finally {
    client.release();
  }
}
async function executeQuery(sql2) {
  let client = await pool2.connect();
  try {
    let result = await client.query(sql2);
    return {
      rows: result.rows,
      fields: result.fields.map((field) => ({
        name: field.name,
        dataTypeID: field.dataTypeID
      }))
    };
  } finally {
    client.release();
  }
}
var init_api_server = __esm({
  "app/utils/api.server.ts"() {
    "use strict";
    init_pool_server();
    init_sql_sanitizer_server();
  }
});

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
import { PassThrough } from "node:stream";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return isbot(request.headers.get("user-agent")) ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(
        RemixServer,
        {
          context: remixContext,
          url: request.url
        },
        void 0,
        !1,
        {
          fileName: "app/entry.server.tsx",
          lineNumber: 40,
          columnNumber: 7
        },
        this
      ),
      {
        onAllReady() {
          let body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(
        RemixServer,
        {
          context: remixContext,
          url: request.url
        },
        void 0,
        !1,
        {
          fileName: "app/entry.server.tsx",
          lineNumber: 82,
          columnNumber: 7
        },
        this
      ),
      {
        onShellReady() {
          let body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links,
  loader: () => loader
});
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import { json } from "@remix-run/node";

// app/tailwind.css?url
var tailwind_default = "/build/_assets/tailwind-QKORAFRA.css?url";

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
import { Form, Link, useLocation } from "@remix-run/react";
import {
  TableCellsIcon as TableIcon,
  CircleStackIcon as DatabaseIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
function Layout({ children, user: user2 }) {
  let { theme, toggleTheme } = useTheme(), location = useLocation(), navigation = [
    { name: "Tables", href: "/", icon: TableIcon },
    { name: "Databases", href: "/databases", icon: DatabaseIcon },
    { name: "Run Query", href: "/query", icon: DatabaseIcon }
  ], userNavigation = [
    { name: "Your Profile", href: "/profile" },
    { name: "Organizations", href: "/organizations" },
    { name: "Settings", href: "/settings" }
  ];
  return /* @__PURE__ */ jsxDEV3("div", { className: "flex h-screen bg-light-bg-secondary dark:bg-dark-bg-primary", children: [
    /* @__PURE__ */ jsxDEV3("div", { className: "w-[297px] p-4", children: /* @__PURE__ */ jsxDEV3("div", { className: "flex h-full flex-col rounded-2xl bg-light-bg-primary dark:bg-dark-bg-secondary shadow-lg", children: [
      /* @__PURE__ */ jsxDEV3("div", { className: "flex flex-1 flex-col overflow-y-auto pt-5 pb-4", children: [
        /* @__PURE__ */ jsxDEV3("div", { className: "flex flex-shrink-0 items-center px-4", children: /* @__PURE__ */ jsxDEV3("h1", { className: "text-xl font-bold text-light-text-primary dark:text-dark-text-primary", children: "Data Studio" }, void 0, !1, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 50,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 49,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV3("nav", { className: "mt-5 flex-1 space-y-1 px-2", children: navigation.map((item) => {
          let isActive = location.pathname === item.href;
          return /* @__PURE__ */ jsxDEV3(
            Link,
            {
              to: item.href,
              className: clsx(
                isActive ? "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-tertiary",
                "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors"
              ),
              children: [
                /* @__PURE__ */ jsxDEV3(
                  item.icon,
                  {
                    className: clsx(
                      isActive ? "text-light-text-primary dark:text-dark-text-primary" : "text-light-text-secondary dark:text-dark-text-secondary group-hover:text-light-text-primary dark:group-hover:text-dark-text-primary",
                      "mr-3 flex-shrink-0 h-5 w-5"
                    ),
                    "aria-hidden": "true"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/Layout.tsx",
                    lineNumber: 66,
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
              lineNumber: 56,
              columnNumber: 19
            },
            this
          );
        }) }, void 0, !1, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 52,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 48,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV3("div", { className: "flex flex-shrink-0 border-t border-light-border dark:border-dark-border p-4 space-y-3 flex-col", children: [
        user2 ? /* @__PURE__ */ jsxDEV3(Menu, { as: "div", className: "relative", children: [
          /* @__PURE__ */ jsxDEV3(Menu.Button, { className: "flex items-center w-full px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors", children: [
            /* @__PURE__ */ jsxDEV3(UserCircleIcon, { className: "h-5 w-5 mr-2" }, void 0, !1, {
              fileName: "app/components/Layout.tsx",
              lineNumber: 85,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV3("span", { className: "flex-1 text-left", children: user2.name }, void 0, !1, {
              fileName: "app/components/Layout.tsx",
              lineNumber: 86,
              columnNumber: 19
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/Layout.tsx",
            lineNumber: 84,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV3(
            Transition,
            {
              as: Fragment,
              enter: "transition ease-out duration-100",
              enterFrom: "transform opacity-0 scale-95",
              enterTo: "transform opacity-100 scale-100",
              leave: "transition ease-in duration-75",
              leaveFrom: "transform opacity-100 scale-100",
              leaveTo: "transform opacity-0 scale-95",
              children: /* @__PURE__ */ jsxDEV3(Menu.Items, { className: "absolute left-0 right-0 mt-2 origin-top-right rounded-md bg-white dark:bg-dark-bg-tertiary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none", children: /* @__PURE__ */ jsxDEV3("div", { className: "py-1", children: [
                userNavigation.map((item) => /* @__PURE__ */ jsxDEV3(Menu.Item, { children: ({ active }) => /* @__PURE__ */ jsxDEV3(
                  Link,
                  {
                    to: item.href,
                    className: clsx(
                      active ? "bg-gray-100 dark:bg-dark-bg-secondary" : "",
                      "block px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary"
                    ),
                    children: item.name
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/Layout.tsx",
                    lineNumber: 102,
                    columnNumber: 29
                  },
                  this
                ) }, item.name, !1, {
                  fileName: "app/components/Layout.tsx",
                  lineNumber: 100,
                  columnNumber: 25
                }, this)),
                /* @__PURE__ */ jsxDEV3(Menu.Item, { children: ({ active }) => /* @__PURE__ */ jsxDEV3(Form, { action: "/logout", method: "post", children: /* @__PURE__ */ jsxDEV3(
                  "button",
                  {
                    type: "submit",
                    className: clsx(
                      active ? "bg-gray-100 dark:bg-dark-bg-secondary" : "",
                      "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary"
                    ),
                    children: "Sign out"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/Layout.tsx",
                    lineNumber: 117,
                    columnNumber: 29
                  },
                  this
                ) }, void 0, !1, {
                  fileName: "app/components/Layout.tsx",
                  lineNumber: 116,
                  columnNumber: 27
                }, this) }, void 0, !1, {
                  fileName: "app/components/Layout.tsx",
                  lineNumber: 114,
                  columnNumber: 23
                }, this)
              ] }, void 0, !0, {
                fileName: "app/components/Layout.tsx",
                lineNumber: 98,
                columnNumber: 21
              }, this) }, void 0, !1, {
                fileName: "app/components/Layout.tsx",
                lineNumber: 97,
                columnNumber: 19
              }, this)
            },
            void 0,
            !1,
            {
              fileName: "app/components/Layout.tsx",
              lineNumber: 88,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 83,
          columnNumber: 15
        }, this) : /* @__PURE__ */ jsxDEV3("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV3(
            Link,
            {
              to: "/login",
              className: "flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors",
              children: "Sign in"
            },
            void 0,
            !1,
            {
              fileName: "app/components/Layout.tsx",
              lineNumber: 135,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV3(
            Link,
            {
              to: "/register",
              className: "flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition-colors",
              children: "Sign up"
            },
            void 0,
            !1,
            {
              fileName: "app/components/Layout.tsx",
              lineNumber: 141,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 134,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV3(
          "button",
          {
            onClick: toggleTheme,
            className: "flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors",
            children: [
              theme === "dark" ? /* @__PURE__ */ jsxDEV3(SunIcon, { className: "h-5 w-5 mr-2" }, void 0, !1, {
                fileName: "app/components/Layout.tsx",
                lineNumber: 154,
                columnNumber: 17
              }, this) : /* @__PURE__ */ jsxDEV3(MoonIcon, { className: "h-5 w-5 mr-2" }, void 0, !1, {
                fileName: "app/components/Layout.tsx",
                lineNumber: 156,
                columnNumber: 17
              }, this),
              theme === "dark" ? "Light Mode" : "Dark Mode"
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/Layout.tsx",
            lineNumber: 149,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 81,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 47,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { className: "flex-1 min-w-0 p-4", children: /* @__PURE__ */ jsxDEV3("main", { className: "w-full h-full bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-lg overflow-hidden", children }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 166,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 165,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Layout.tsx",
    lineNumber: 44,
    columnNumber: 5
  }, this);
}

// app/lib/auth/session.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";

// app/env.server.ts
import { z } from "zod";
var envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // System database settings
  SYSTEM_DB_HOST: z.string().default("localhost"),
  SYSTEM_DB_PORT: z.coerce.number().default(5432),
  SYSTEM_DB_USER: z.string().default("postgres"),
  SYSTEM_DB_PASSWORD: z.string().default("postgres"),
  SYSTEM_DB_NAME: z.string().default("data_studio_system"),
  // Session configuration
  SESSION_SECRET: z.string().min(32).default("at-least-32-characters-long-session-secret"),
  // Encryption settings for database credentials
  ENCRYPTION_KEY: z.string().min(32).default("at-least-32-characters-long-encryption-key"),
  ENCRYPTION_IV: z.string().default("16-chars-enc-iv")
}), env = envSchema.parse(process.env);

// app/lib/db/db.server.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
var { Pool } = pkg, pool = new Pool({
  host: env.SYSTEM_DB_HOST,
  port: env.SYSTEM_DB_PORT,
  user: env.SYSTEM_DB_USER,
  password: env.SYSTEM_DB_PASSWORD,
  database: env.SYSTEM_DB_NAME
}), db = drizzle(pool, {
  logger: env.NODE_ENV === "development"
});

// app/lib/db/schema.ts
import { pgTable, text, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}), users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}), organizationMembers2 = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  // 'admin', 'member'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}), databaseConnections2 = pgTable("database_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // 'postgresql', etc.
  // Encrypted connection details stored as JSON
  credentials: jsonb("credentials").notNull(),
  isActive: boolean("is_active").default(!0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastConnectedAt: timestamp("last_connected_at")
}), savedQueries = pgTable("saved_queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  connectionId: uuid("connection_id").notNull().references(() => databaseConnections2.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  query: text("query").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}), queryHistory = pgTable("query_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  connectionId: uuid("connection_id").notNull().references(() => databaseConnections2.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  executionTimeMs: text("execution_time_ms"),
  status: text("status").notNull(),
  // 'success', 'error'
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}), organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers2),
  connections: many(databaseConnections2),
  savedQueries: many(savedQueries),
  queryHistory: many(queryHistory)
})), usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizationMembers2),
  savedQueries: many(savedQueries),
  queryHistory: many(queryHistory)
})), insertOrganizationSchema = createInsertSchema(organizations), insertUserSchema = createInsertSchema(users), insertDatabaseConnectionSchema = createInsertSchema(databaseConnections2), insertSavedQuerySchema = createInsertSchema(savedQueries), selectOrganizationSchema = createSelectSchema(organizations), selectUserSchema = createSelectSchema(users), selectDatabaseConnectionSchema = createSelectSchema(databaseConnections2), selectSavedQuerySchema = createSelectSchema(savedQueries);

// app/lib/auth/session.server.ts
import { eq } from "drizzle-orm";
var sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: !0,
    path: "/",
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
    secure: env.NODE_ENV === "production"
  }
});
async function getUserSession(request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}
async function getUser(request) {
  let userId = (await getUserSession(request)).get("userId");
  if (!userId)
    return null;
  let user2 = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: !0,
      email: !0,
      name: !0
    }
  });
  if (!user2)
    throw await logout(request);
  return user2;
}
async function createUserSession(userId, redirectTo) {
  let session = await sessionStorage.getSession();
  return session.set("userId", userId), redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session)
    }
  });
}
async function logout(request) {
  let session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}
async function requireUser(request, redirectTo = new URL(request.url).pathname) {
  let user2 = await getUser(request);
  if (!user2) {
    let searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user2;
}

// app/root.tsx
import { jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
var links = () => [
  { rel: "stylesheet", href: tailwind_default }
];
async function loader({ request }) {
  return json({
    user: await getUser(request),
    ENV: {
      NODE_ENV: "development"
    }
  });
}
function App() {
  let { user: user2, ENV } = useLoaderData();
  return /* @__PURE__ */ jsxDEV4("html", { lang: "en", className: "h-full", children: [
    /* @__PURE__ */ jsxDEV4("head", { children: [
      /* @__PURE__ */ jsxDEV4("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 35,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 36,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4("body", { className: "h-full bg-light-bg-primary text-light-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary", children: [
      /* @__PURE__ */ jsxDEV4(ThemeProvider, { children: /* @__PURE__ */ jsxDEV4(Layout, { user: user2, children: /* @__PURE__ */ jsxDEV4(Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 43,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 42,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 41,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 46,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 47,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 48,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV4(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `window.ENV = ${JSON.stringify(ENV)}`
          }
        },
        void 0,
        !1,
        {
          fileName: "app/root.tsx",
          lineNumber: 49,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
}

// app/routes/organizations.$orgId.connections.tsx
var organizations_orgId_connections_exports = {};
__export(organizations_orgId_connections_exports, {
  action: () => action,
  default: () => ConnectionsPage,
  loader: () => loader2
});
import { json as json2 } from "@remix-run/node";
import { Form as Form3, useLoaderData as useLoaderData2 } from "@remix-run/react";

// app/lib/db/schema/organizations.ts
import { text as text3, timestamp as timestamp3, pgTable as pgTable3, uuid as uuid3 } from "drizzle-orm/pg-core";
import { createId as createId2 } from "@paralleldrive/cuid2";

// app/lib/db/schema/auth.ts
import { text as text2, timestamp as timestamp2, pgTable as pgTable2, uuid as uuid2 } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
var users2 = pgTable2("users", {
  id: uuid2("id").primaryKey().$defaultFn(() => createId()),
  email: text2("email").notNull().unique(),
  name: text2("name").notNull(),
  hashedPassword: text2("hashed_password").notNull(),
  createdAt: timestamp2("created_at").defaultNow().notNull(),
  updatedAt: timestamp2("updated_at").defaultNow().notNull()
}), sessions = pgTable2("sessions", {
  id: uuid2("id").primaryKey().$defaultFn(() => createId()),
  userId: uuid2("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
  expiresAt: timestamp2("expires_at").notNull(),
  createdAt: timestamp2("created_at").defaultNow().notNull()
});

// app/lib/db/schema/organizations.ts
var organizations2 = pgTable3("organizations", {
  id: uuid3("id").primaryKey().$defaultFn(() => createId2()),
  name: text3("name").notNull(),
  slug: text3("slug").notNull().unique(),
  createdAt: timestamp3("created_at").defaultNow().notNull(),
  updatedAt: timestamp3("updated_at").defaultNow().notNull()
}), organizationMembers3 = pgTable3("organization_members", {
  id: uuid3("id").primaryKey().$defaultFn(() => createId2()),
  organizationId: uuid3("organization_id").notNull().references(() => organizations2.id, { onDelete: "cascade" }),
  userId: uuid3("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
  role: text3("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
  createdAt: timestamp3("created_at").defaultNow().notNull(),
  updatedAt: timestamp3("updated_at").defaultNow().notNull()
});

// app/lib/organizations/organizations.server.ts
import { eq as eq2, and } from "drizzle-orm";
import { createId as createId3 } from "@paralleldrive/cuid2";
async function createOrganization({ name, userId }) {
  let slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${createId3().slice(0, 8)}`, [organization] = await db.insert(organizations2).values({ name, slug }).returning();
  return await db.insert(organizationMembers3).values({
    organizationId: organization.id,
    userId,
    role: "owner"
  }), organization;
}
async function updateOrganization(id, { name }) {
  let [organization] = await db.update(organizations2).set({ name, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(organizations2.id, id)).returning();
  return organization;
}
async function deleteOrganization(id) {
  await db.delete(organizations2).where(eq2(organizations2.id, id));
}
async function getOrganization(id) {
  return db.query.organizations.findFirst({
    where: eq2(organizations2.id, id),
    with: {
      members: {
        with: {
          user: !0
        }
      }
    }
  });
}
async function getUserOrganizations(userId) {
  return db.query.organizationMembers.findMany({
    where: eq2(organizationMembers3.userId, userId),
    with: {
      organization: !0
    }
  });
}
async function updateOrganizationMemberRole(organizationId, userId, role) {
  let [member] = await db.update(organizationMembers3).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(
      eq2(organizationMembers3.organizationId, organizationId),
      eq2(organizationMembers3.userId, userId)
    )
  ).returning();
  return member;
}
async function removeOrganizationMember(organizationId, userId) {
  await db.delete(organizationMembers3).where(
    and(
      eq2(organizationMembers3.organizationId, organizationId),
      eq2(organizationMembers3.userId, userId)
    )
  );
}
async function getOrganizationRole(organizationId, userId) {
  return (await db.query.organizationMembers.findFirst({
    where: and(
      eq2(organizationMembers3.organizationId, organizationId),
      eq2(organizationMembers3.userId, userId)
    )
  }))?.role;
}

// app/lib/db/schema/connections.ts
import { text as text4, timestamp as timestamp4, pgTable as pgTable4, jsonb as jsonb2, uuid as uuid4 } from "drizzle-orm/pg-core";
import { createId as createId4 } from "@paralleldrive/cuid2";
var databaseConnections3 = pgTable4("database_connections", {
  id: uuid4("id").primaryKey().$defaultFn(() => createId4()),
  name: text4("name").notNull(),
  type: text4("type", { enum: ["postgresql"] }).notNull(),
  organizationId: uuid4("organization_id").notNull().references(() => organizations2.id, { onDelete: "cascade" }),
  createdById: uuid4("created_by_id").notNull().references(() => users2.id),
  config: jsonb2("config").notNull(),
  lastUsedAt: timestamp4("last_used_at"),
  createdAt: timestamp4("created_at").defaultNow().notNull(),
  updatedAt: timestamp4("updated_at").defaultNow().notNull()
}), queryHistory2 = pgTable4("query_history", {
  id: uuid4("id").primaryKey().$defaultFn(() => createId4()),
  connectionId: uuid4("connection_id").notNull().references(() => databaseConnections3.id, { onDelete: "cascade" }),
  userId: uuid4("user_id").notNull().references(() => users2.id),
  query: text4("query").notNull(),
  status: text4("status", { enum: ["success", "error"] }).notNull(),
  error: text4("error"),
  executionTimeMs: text4("execution_time_ms"),
  rowCount: text4("row_count"),
  createdAt: timestamp4("created_at").defaultNow().notNull()
});

// app/routes/organizations.$orgId.connections.tsx
import { eq as eq4 } from "drizzle-orm";

// app/lib/db/connection-manager.server.ts
import pkg2 from "pg";
import { eq as eq3 } from "drizzle-orm";
import { createHash } from "crypto";
var { Pool: Pool2 } = pkg2, ConnectionManager = class {
  // 1 minute
  constructor() {
    this.pools = /* @__PURE__ */ new Map();
    this.maxIdleTime = 5 * 60 * 1e3;
    // 5 minutes
    this.cleanupInterval = 60 * 1e3;
    this.startCleanupInterval();
  }
  static getInstance() {
    return ConnectionManager.instance || (ConnectionManager.instance = new ConnectionManager()), ConnectionManager.instance;
  }
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupIdlePools();
    }, this.cleanupInterval);
  }
  cleanupIdlePools() {
    let now = Date.now();
    for (let [key, { pool: pool3, lastUsed }] of this.pools.entries())
      now - lastUsed > this.maxIdleTime && (pool3.end(), this.pools.delete(key));
  }
  getPoolKey(config) {
    let configString = JSON.stringify(config);
    return createHash("sha256").update(configString).digest("hex");
  }
  decryptCredentials(encryptedCredentials) {
    return encryptedCredentials;
  }
  async getConnection(connectionId) {
    let connection = await db.query.databaseConnections.findFirst({
      where: eq3(databaseConnections2.id, connectionId)
    });
    if (!connection)
      throw new Error(`Connection not found: ${connectionId}`);
    if (!connection.isActive)
      throw new Error(`Connection is not active: ${connectionId}`);
    let config = this.decryptCredentials(connection.credentials), poolKey = this.getPoolKey(config), existingPool = this.pools.get(poolKey);
    if (existingPool)
      return existingPool.lastUsed = Date.now(), existingPool.pool;
    let pool3 = new Pool2(config);
    try {
      (await pool3.connect()).release();
    } catch (error) {
      throw pool3.end(), new Error(`Failed to connect to database: ${error.message}`);
    }
    return this.pools.set(poolKey, {
      pool: pool3,
      lastUsed: Date.now()
    }), await db.update(databaseConnections2).set({ lastConnectedAt: /* @__PURE__ */ new Date() }).where(eq3(databaseConnections2.id, connectionId)), pool3;
  }
  async closeConnection(connectionId) {
    let connection = await db.query.databaseConnections.findFirst({
      where: eq3(databaseConnections2.id, connectionId)
    });
    if (!connection)
      return;
    let config = this.decryptCredentials(connection.credentials), poolKey = this.getPoolKey(config), existingPool = this.pools.get(poolKey);
    existingPool && (await existingPool.pool.end(), this.pools.delete(poolKey));
  }
  async closeAllConnections() {
    let closePromises = Array.from(this.pools.values()).map(({ pool: pool3 }) => pool3.end());
    await Promise.all(closePromises), this.pools.clear();
  }
};

// app/routes/organizations.$orgId.connections.tsx
import { z as z2 } from "zod";
import { useState as useState2 } from "react";

// app/components/NewConnectionModal.tsx
import { Dialog, Transition as Transition2 } from "@headlessui/react";
import { Form as Form2 } from "@remix-run/react";
import { Fragment as Fragment2 } from "react";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
function NewConnectionModal({ isOpen, onClose }) {
  return /* @__PURE__ */ jsxDEV5(Transition2, { appear: !0, show: isOpen, as: Fragment2, children: /* @__PURE__ */ jsxDEV5(Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ jsxDEV5(
      Transition2.Child,
      {
        as: Fragment2,
        enter: "ease-out duration-300",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ jsxDEV5("div", { className: "fixed inset-0 bg-black bg-opacity-25" }, void 0, !1, {
          fileName: "app/components/NewConnectionModal.tsx",
          lineNumber: 23,
          columnNumber: 11
        }, this)
      },
      void 0,
      !1,
      {
        fileName: "app/components/NewConnectionModal.tsx",
        lineNumber: 14,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDEV5("div", { className: "fixed inset-0 overflow-y-auto", children: /* @__PURE__ */ jsxDEV5("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxDEV5(
      Transition2.Child,
      {
        as: Fragment2,
        enter: "ease-out duration-300",
        enterFrom: "opacity-0 scale-95",
        enterTo: "opacity-100 scale-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100 scale-100",
        leaveTo: "opacity-0 scale-95",
        children: /* @__PURE__ */ jsxDEV5(Dialog.Panel, { className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-light-bg-primary dark:bg-dark-bg-secondary p-6 shadow-xl transition-all", children: [
          /* @__PURE__ */ jsxDEV5(Dialog.Title, { as: "h3", className: "text-lg font-medium mb-4", children: "New Database Connection" }, void 0, !1, {
            fileName: "app/components/NewConnectionModal.tsx",
            lineNumber: 38,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV5(Form2, { method: "post", className: "space-y-4", children: [
            /* @__PURE__ */ jsxDEV5("input", { type: "hidden", name: "intent", value: "create" }, void 0, !1, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 43,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { children: [
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "name", className: "block text-sm font-medium mb-1", children: "Connection Name" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 46,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "text",
                  id: "name",
                  name: "name",
                  className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
                  required: !0
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 49,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 45,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { children: [
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "host", className: "block text-sm font-medium mb-1", children: "Host" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 59,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "text",
                  id: "host",
                  name: "host",
                  className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
                  required: !0
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 62,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 58,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { children: [
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "port", className: "block text-sm font-medium mb-1", children: "Port" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 72,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "number",
                  id: "port",
                  name: "port",
                  defaultValue: 5432,
                  className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
                  required: !0
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 75,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 71,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { children: [
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "database", className: "block text-sm font-medium mb-1", children: "Database Name" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 86,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "text",
                  id: "database",
                  name: "database",
                  className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
                  required: !0
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 89,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 85,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { children: [
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "username", className: "block text-sm font-medium mb-1", children: "Username" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 99,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "text",
                  id: "username",
                  name: "username",
                  className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
                  required: !0
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 102,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 98,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { children: [
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "password", className: "block text-sm font-medium mb-1", children: "Password" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 112,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "password",
                  id: "password",
                  name: "password",
                  className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
                  required: !0
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 115,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 111,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDEV5(
                "input",
                {
                  type: "checkbox",
                  id: "ssl",
                  name: "ssl",
                  className: "h-4 w-4 rounded border-light-border dark:border-dark-border text-blue-600 focus:ring-blue-500"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 125,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV5("label", { htmlFor: "ssl", className: "ml-2 block text-sm", children: "Use SSL" }, void 0, !1, {
                fileName: "app/components/NewConnectionModal.tsx",
                lineNumber: 131,
                columnNumber: 21
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 124,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV5("div", { className: "flex justify-end space-x-4 mt-6", children: [
              /* @__PURE__ */ jsxDEV5(
                "button",
                {
                  type: "button",
                  className: "px-4 py-2 text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors",
                  onClick: onClose,
                  children: "Cancel"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 137,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV5(
                "button",
                {
                  type: "submit",
                  className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
                  children: "Create Connection"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/NewConnectionModal.tsx",
                  lineNumber: 144,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/components/NewConnectionModal.tsx",
              lineNumber: 136,
              columnNumber: 19
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/NewConnectionModal.tsx",
            lineNumber: 42,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/NewConnectionModal.tsx",
          lineNumber: 37,
          columnNumber: 15
        }, this)
      },
      void 0,
      !1,
      {
        fileName: "app/components/NewConnectionModal.tsx",
        lineNumber: 28,
        columnNumber: 13
      },
      this
    ) }, void 0, !1, {
      fileName: "app/components/NewConnectionModal.tsx",
      lineNumber: 27,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/NewConnectionModal.tsx",
      lineNumber: 26,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/NewConnectionModal.tsx",
    lineNumber: 13,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/NewConnectionModal.tsx",
    lineNumber: 12,
    columnNumber: 5
  }, this);
}

// app/lib/db/test-connection.server.ts
import pkg3 from "pg";
var { Pool: Pool3 } = pkg3;
async function testPostgresConnection(config) {
  let pool3 = new Pool3(config);
  try {
    return (await pool3.connect()).release(), await pool3.end(), !0;
  } catch (error) {
    throw error;
  }
}

// app/routes/organizations.$orgId.connections.tsx
import { jsxDEV as jsxDEV6 } from "react/jsx-dev-runtime";
var ConnectionSchema = z2.object({
  name: z2.string().min(1, "Name is required"),
  host: z2.string().min(1, "Host is required"),
  port: z2.coerce.number().int().min(1).max(65535),
  database: z2.string().min(1, "Database name is required"),
  username: z2.string().min(1, "Username is required"),
  password: z2.string().min(1, "Password is required"),
  ssl: z2.boolean().optional()
});
async function loader2({ request, params }) {
  let user2 = await requireUser(request), role = await getOrganizationRole(params.orgId, user2.id);
  if (!role)
    throw new Response("Unauthorized", { status: 403 });
  let connections = await db.query.databaseConnections.findMany({
    where: eq4(databaseConnections3.organizationId, params.orgId)
  });
  return json2({ connections, role });
}
async function action({ request, params }) {
  let user2 = await requireUser(request), role = await getOrganizationRole(params.orgId, user2.id);
  if (!role || role === "member")
    throw new Response("Unauthorized", { status: 403 });
  let formData = await request.formData();
  switch (formData.get("intent")) {
    case "create": {
      let result = ConnectionSchema.safeParse({
        name: formData.get("name"),
        host: formData.get("host"),
        port: formData.get("port"),
        database: formData.get("database"),
        username: formData.get("username"),
        password: formData.get("password"),
        ssl: formData.get("ssl") === "true"
      });
      if (!result.success)
        return json2({ errors: result.error.flatten() }, { status: 400 });
      let { name, ...config } = result.data;
      try {
        await testPostgresConnection(config);
      } catch (error) {
        return json2({ error: `Failed to connect: ${error.message}` }, { status: 400 });
      }
      return await db.insert(databaseConnections3).values({
        name,
        type: "postgresql",
        organizationId: params.orgId,
        createdById: user2.id,
        config
      }), null;
    }
    case "delete": {
      let connectionId = formData.get("connectionId");
      return typeof connectionId != "string" ? json2({ error: "Invalid connection ID" }, { status: 400 }) : (await ConnectionManager.getInstance().closeConnection(connectionId), await db.delete(databaseConnections3).where(eq4(databaseConnections3.id, connectionId)), null);
    }
    case "test": {
      let connectionId = formData.get("connectionId");
      if (typeof connectionId != "string")
        return json2({ error: "Invalid connection ID" }, { status: 400 });
      try {
        return (await (await ConnectionManager.getInstance().getConnection(connectionId)).connect()).release(), json2({ success: !0 });
      } catch (error) {
        return json2({ error: error.message }, { status: 400 });
      }
    }
    default:
      throw new Response("Invalid intent", { status: 400 });
  }
}
function ConnectionsPage() {
  let { connections, role } = useLoaderData2(), canManage = role === "owner" || role === "admin", [isModalOpen, setIsModalOpen] = useState2(!1);
  return /* @__PURE__ */ jsxDEV6("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxDEV6("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxDEV6("div", { className: "flex justify-between items-center mb-8", children: [
        /* @__PURE__ */ jsxDEV6("h1", { className: "text-2xl font-semibold", children: "Database Connections" }, void 0, !1, {
          fileName: "app/routes/organizations.$orgId.connections.tsx",
          lineNumber: 132,
          columnNumber: 11
        }, this),
        canManage && /* @__PURE__ */ jsxDEV6(
          "button",
          {
            type: "button",
            className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
            onClick: () => setIsModalOpen(!0),
            children: "New Connection"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/organizations.$orgId.connections.tsx",
            lineNumber: 134,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.$orgId.connections.tsx",
        lineNumber: 131,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV6("div", { className: "space-y-4", children: [
        connections.map((connection) => /* @__PURE__ */ jsxDEV6(
          "div",
          {
            className: "bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6",
            children: [
              /* @__PURE__ */ jsxDEV6("div", { className: "flex justify-between items-start", children: [
                /* @__PURE__ */ jsxDEV6("div", { children: [
                  /* @__PURE__ */ jsxDEV6("h2", { className: "text-lg font-medium mb-1", children: connection.name }, void 0, !1, {
                    fileName: "app/routes/organizations.$orgId.connections.tsx",
                    lineNumber: 152,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV6("p", { className: "text-sm text-light-text-secondary dark:text-dark-text-secondary", children: [
                    connection.config.host,
                    ":",
                    connection.config.port,
                    "/",
                    connection.config.database
                  ] }, void 0, !0, {
                    fileName: "app/routes/organizations.$orgId.connections.tsx",
                    lineNumber: 153,
                    columnNumber: 19
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/routes/organizations.$orgId.connections.tsx",
                  lineNumber: 151,
                  columnNumber: 17
                }, this),
                canManage && /* @__PURE__ */ jsxDEV6("div", { className: "flex space-x-4", children: [
                  /* @__PURE__ */ jsxDEV6(Form3, { method: "post", children: [
                    /* @__PURE__ */ jsxDEV6("input", { type: "hidden", name: "intent", value: "test" }, void 0, !1, {
                      fileName: "app/routes/organizations.$orgId.connections.tsx",
                      lineNumber: 160,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV6("input", { type: "hidden", name: "connectionId", value: connection.id }, void 0, !1, {
                      fileName: "app/routes/organizations.$orgId.connections.tsx",
                      lineNumber: 161,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV6(
                      "button",
                      {
                        type: "submit",
                        className: "text-blue-600 hover:text-blue-500",
                        children: "Test Connection"
                      },
                      void 0,
                      !1,
                      {
                        fileName: "app/routes/organizations.$orgId.connections.tsx",
                        lineNumber: 162,
                        columnNumber: 23
                      },
                      this
                    )
                  ] }, void 0, !0, {
                    fileName: "app/routes/organizations.$orgId.connections.tsx",
                    lineNumber: 159,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV6(Form3, { method: "post", children: [
                    /* @__PURE__ */ jsxDEV6("input", { type: "hidden", name: "intent", value: "delete" }, void 0, !1, {
                      fileName: "app/routes/organizations.$orgId.connections.tsx",
                      lineNumber: 170,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV6("input", { type: "hidden", name: "connectionId", value: connection.id }, void 0, !1, {
                      fileName: "app/routes/organizations.$orgId.connections.tsx",
                      lineNumber: 171,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV6(
                      "button",
                      {
                        type: "submit",
                        className: "text-red-600 hover:text-red-500",
                        onClick: (e) => {
                          confirm("Are you sure you want to delete this connection?") || e.preventDefault();
                        },
                        children: "Delete"
                      },
                      void 0,
                      !1,
                      {
                        fileName: "app/routes/organizations.$orgId.connections.tsx",
                        lineNumber: 172,
                        columnNumber: 23
                      },
                      this
                    )
                  ] }, void 0, !0, {
                    fileName: "app/routes/organizations.$orgId.connections.tsx",
                    lineNumber: 169,
                    columnNumber: 21
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/routes/organizations.$orgId.connections.tsx",
                  lineNumber: 158,
                  columnNumber: 19
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/organizations.$orgId.connections.tsx",
                lineNumber: 150,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV6("div", { className: "mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary", children: [
                /* @__PURE__ */ jsxDEV6("p", { children: [
                  "Created by ",
                  connection.createdBy.name
                ] }, void 0, !0, {
                  fileName: "app/routes/organizations.$orgId.connections.tsx",
                  lineNumber: 188,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV6("p", { children: [
                  "Last used: ",
                  connection.lastUsedAt ? new Date(connection.lastUsedAt).toLocaleString() : "Never"
                ] }, void 0, !0, {
                  fileName: "app/routes/organizations.$orgId.connections.tsx",
                  lineNumber: 189,
                  columnNumber: 17
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/organizations.$orgId.connections.tsx",
                lineNumber: 187,
                columnNumber: 15
              }, this)
            ]
          },
          connection.id,
          !0,
          {
            fileName: "app/routes/organizations.$orgId.connections.tsx",
            lineNumber: 146,
            columnNumber: 13
          },
          this
        )),
        connections.length === 0 && /* @__PURE__ */ jsxDEV6("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsxDEV6("h3", { className: "text-lg font-medium mb-2", children: "No database connections" }, void 0, !1, {
            fileName: "app/routes/organizations.$orgId.connections.tsx",
            lineNumber: 196,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV6("p", { className: "text-light-text-secondary dark:text-dark-text-secondary mb-4", children: "Add your first database connection to get started" }, void 0, !1, {
            fileName: "app/routes/organizations.$orgId.connections.tsx",
            lineNumber: 197,
            columnNumber: 15
          }, this),
          canManage && /* @__PURE__ */ jsxDEV6(
            "button",
            {
              type: "button",
              className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
              onClick: () => setIsModalOpen(!0),
              children: "New Connection"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/organizations.$orgId.connections.tsx",
              lineNumber: 201,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/organizations.$orgId.connections.tsx",
          lineNumber: 195,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.$orgId.connections.tsx",
        lineNumber: 144,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/organizations.$orgId.connections.tsx",
      lineNumber: 130,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV6(NewConnectionModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(!1) }, void 0, !1, {
      fileName: "app/routes/organizations.$orgId.connections.tsx",
      lineNumber: 214,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/organizations.$orgId.connections.tsx",
    lineNumber: 129,
    columnNumber: 5
  }, this);
}

// app/routes/organizations.$id.tsx
var organizations_id_exports = {};
__export(organizations_id_exports, {
  action: () => action2,
  default: () => OrganizationPage,
  loader: () => loader3
});
import { json as json3, redirect as redirect2 } from "@remix-run/node";
import { Form as Form4, useLoaderData as useLoaderData3 } from "@remix-run/react";
import { z as z3 } from "zod";
import { jsxDEV as jsxDEV7 } from "react/jsx-dev-runtime";
var UpdateOrganizationSchema = z3.object({
  name: z3.string().min(1, "Name is required").max(100)
}), AddMemberSchema = z3.object({
  email: z3.string().email("Invalid email address"),
  role: z3.enum(["admin", "member"])
});
async function loader3({ request, params }) {
  let user2 = await requireUser(request), organization = await getOrganization(params.id);
  if (!organization)
    throw new Response("Not Found", { status: 404 });
  let role = await getOrganizationRole(organization.id, user2.id);
  if (!role)
    throw new Response("Unauthorized", { status: 403 });
  return json3({ organization, role });
}
async function action2({ request, params }) {
  let user2 = await requireUser(request), formData = await request.formData(), intent = formData.get("intent"), organization = await getOrganization(params.id);
  if (!organization)
    throw new Response("Not Found", { status: 404 });
  let role = await getOrganizationRole(organization.id, user2.id);
  if (!role || role === "member")
    throw new Response("Unauthorized", { status: 403 });
  switch (intent) {
    case "update": {
      if (role !== "owner")
        throw new Response("Unauthorized", { status: 403 });
      let name = formData.get("name"), result = UpdateOrganizationSchema.safeParse({ name });
      return result.success ? (await updateOrganization(organization.id, { name: result.data.name }), null) : json3({ errors: result.error.flatten() }, { status: 400 });
    }
    case "delete": {
      if (role !== "owner")
        throw new Response("Unauthorized", { status: 403 });
      return await deleteOrganization(organization.id), redirect2("/organizations");
    }
    case "add-member": {
      let result = AddMemberSchema.safeParse({
        email: formData.get("email"),
        role: formData.get("role")
      });
      return result.success ? null : json3({ errors: result.error.flatten() }, { status: 400 });
    }
    case "update-role": {
      if (role !== "owner")
        throw new Response("Unauthorized", { status: 403 });
      let memberId = formData.get("memberId"), newRole = formData.get("role");
      return typeof memberId != "string" || !["admin", "member"].includes(newRole) ? json3({ error: "Invalid input" }, { status: 400 }) : (await updateOrganizationMemberRole(organization.id, memberId, newRole), null);
    }
    case "remove-member": {
      if (role !== "owner")
        throw new Response("Unauthorized", { status: 403 });
      let memberId = formData.get("memberId");
      return typeof memberId != "string" ? json3({ error: "Invalid input" }, { status: 400 }) : (await removeOrganizationMember(organization.id, memberId), null);
    }
    default:
      throw new Response("Invalid intent", { status: 400 });
  }
}
function OrganizationPage() {
  let { organization, role } = useLoaderData3(), isOwner = role === "owner";
  return /* @__PURE__ */ jsxDEV7("div", { className: "p-6", children: /* @__PURE__ */ jsxDEV7("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxDEV7("div", { className: "flex justify-between items-start mb-8", children: [
      /* @__PURE__ */ jsxDEV7("div", { children: [
        /* @__PURE__ */ jsxDEV7("h1", { className: "text-2xl font-semibold mb-2", children: organization.name }, void 0, !1, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 138,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV7("p", { className: "text-light-text-secondary dark:text-dark-text-secondary", children: [
          "Created ",
          new Date(organization.createdAt).toLocaleDateString()
        ] }, void 0, !0, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 139,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.$id.tsx",
        lineNumber: 137,
        columnNumber: 11
      }, this),
      isOwner && /* @__PURE__ */ jsxDEV7(Form4, { method: "post", children: [
        /* @__PURE__ */ jsxDEV7("input", { type: "hidden", name: "intent", value: "delete" }, void 0, !1, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 146,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV7(
          "button",
          {
            type: "submit",
            className: "px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors",
            onClick: (e) => {
              confirm("Are you sure you want to delete this organization?") || e.preventDefault();
            },
            children: "Delete Organization"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 147,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.$id.tsx",
        lineNumber: 145,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/organizations.$id.tsx",
      lineNumber: 136,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV7("div", { className: "space-y-8", children: [
      isOwner && /* @__PURE__ */ jsxDEV7("section", { className: "bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6", children: [
        /* @__PURE__ */ jsxDEV7("h2", { className: "text-lg font-medium mb-4", children: "Organization Settings" }, void 0, !1, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 166,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV7(Form4, { method: "post", className: "max-w-md space-y-4", children: [
          /* @__PURE__ */ jsxDEV7("input", { type: "hidden", name: "intent", value: "update" }, void 0, !1, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 168,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV7("div", { children: [
            /* @__PURE__ */ jsxDEV7("label", { htmlFor: "name", className: "block text-sm font-medium mb-1", children: "Organization Name" }, void 0, !1, {
              fileName: "app/routes/organizations.$id.tsx",
              lineNumber: 170,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV7(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                defaultValue: organization.name,
                className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: !0
              },
              void 0,
              !1,
              {
                fileName: "app/routes/organizations.$id.tsx",
                lineNumber: 173,
                columnNumber: 19
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 169,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV7("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxDEV7(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
              children: "Save Changes"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/organizations.$id.tsx",
              lineNumber: 183,
              columnNumber: 19
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 182,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 167,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.$id.tsx",
        lineNumber: 165,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV7("section", { className: "bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6", children: [
        /* @__PURE__ */ jsxDEV7("h2", { className: "text-lg font-medium mb-4", children: "Members" }, void 0, !1, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 196,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV7("div", { className: "space-y-4", children: organization.members?.map(({ user: member, role: memberRole }) => /* @__PURE__ */ jsxDEV7(
          "div",
          {
            className: "flex items-center justify-between py-2",
            children: [
              /* @__PURE__ */ jsxDEV7("div", { children: [
                /* @__PURE__ */ jsxDEV7("p", { className: "font-medium", children: member.name }, void 0, !1, {
                  fileName: "app/routes/organizations.$id.tsx",
                  lineNumber: 204,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV7("p", { className: "text-sm text-light-text-secondary dark:text-dark-text-secondary", children: member.email }, void 0, !1, {
                  fileName: "app/routes/organizations.$id.tsx",
                  lineNumber: 205,
                  columnNumber: 21
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/organizations.$id.tsx",
                lineNumber: 203,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV7("div", { className: "flex items-center space-x-4", children: [
                /* @__PURE__ */ jsxDEV7("span", { className: "text-sm text-light-text-secondary dark:text-dark-text-secondary capitalize", children: memberRole }, void 0, !1, {
                  fileName: "app/routes/organizations.$id.tsx",
                  lineNumber: 210,
                  columnNumber: 21
                }, this),
                isOwner && member.id !== user.id && /* @__PURE__ */ jsxDEV7(Form4, { method: "post", className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxDEV7("input", { type: "hidden", name: "intent", value: "remove-member" }, void 0, !1, {
                    fileName: "app/routes/organizations.$id.tsx",
                    lineNumber: 215,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV7("input", { type: "hidden", name: "memberId", value: member.id }, void 0, !1, {
                    fileName: "app/routes/organizations.$id.tsx",
                    lineNumber: 216,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV7(
                    "button",
                    {
                      type: "submit",
                      className: "text-red-600 hover:text-red-500",
                      onClick: (e) => {
                        confirm("Are you sure you want to remove this member?") || e.preventDefault();
                      },
                      children: "Remove"
                    },
                    void 0,
                    !1,
                    {
                      fileName: "app/routes/organizations.$id.tsx",
                      lineNumber: 217,
                      columnNumber: 25
                    },
                    this
                  )
                ] }, void 0, !0, {
                  fileName: "app/routes/organizations.$id.tsx",
                  lineNumber: 214,
                  columnNumber: 23
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/organizations.$id.tsx",
                lineNumber: 209,
                columnNumber: 19
              }, this)
            ]
          },
          member.id,
          !0,
          {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 199,
            columnNumber: 17
          },
          this
        )) }, void 0, !1, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 197,
          columnNumber: 13
        }, this),
        (isOwner || role === "admin") && /* @__PURE__ */ jsxDEV7(Form4, { method: "post", className: "mt-6 max-w-md space-y-4", children: [
          /* @__PURE__ */ jsxDEV7("input", { type: "hidden", name: "intent", value: "add-member" }, void 0, !1, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 238,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV7("div", { children: [
            /* @__PURE__ */ jsxDEV7("label", { htmlFor: "email", className: "block text-sm font-medium mb-1", children: "Add Member by Email" }, void 0, !1, {
              fileName: "app/routes/organizations.$id.tsx",
              lineNumber: 240,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV7(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: !0
              },
              void 0,
              !1,
              {
                fileName: "app/routes/organizations.$id.tsx",
                lineNumber: 243,
                columnNumber: 19
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 239,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV7("div", { children: [
            /* @__PURE__ */ jsxDEV7("label", { htmlFor: "role", className: "block text-sm font-medium mb-1", children: "Role" }, void 0, !1, {
              fileName: "app/routes/organizations.$id.tsx",
              lineNumber: 252,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV7(
              "select",
              {
                id: "role",
                name: "role",
                className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500",
                defaultValue: "member",
                children: [
                  /* @__PURE__ */ jsxDEV7("option", { value: "member", children: "Member" }, void 0, !1, {
                    fileName: "app/routes/organizations.$id.tsx",
                    lineNumber: 261,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV7("option", { value: "admin", children: "Admin" }, void 0, !1, {
                    fileName: "app/routes/organizations.$id.tsx",
                    lineNumber: 262,
                    columnNumber: 21
                  }, this)
                ]
              },
              void 0,
              !0,
              {
                fileName: "app/routes/organizations.$id.tsx",
                lineNumber: 255,
                columnNumber: 19
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 251,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV7("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxDEV7(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
              children: "Add Member"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/organizations.$id.tsx",
              lineNumber: 266,
              columnNumber: 19
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/organizations.$id.tsx",
            lineNumber: 265,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/organizations.$id.tsx",
          lineNumber: 237,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.$id.tsx",
        lineNumber: 195,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/organizations.$id.tsx",
      lineNumber: 162,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/organizations.$id.tsx",
    lineNumber: 135,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/organizations.$id.tsx",
    lineNumber: 134,
    columnNumber: 5
  }, this);
}

// app/routes/organizations.new.tsx
var organizations_new_exports = {};
__export(organizations_new_exports, {
  action: () => action3,
  default: () => NewOrganizationPage
});
import { json as json4, redirect as redirect3 } from "@remix-run/node";
import { Form as Form5, useActionData } from "@remix-run/react";
import { z as z4 } from "zod";
import { jsxDEV as jsxDEV8 } from "react/jsx-dev-runtime";
var CreateOrganizationSchema = z4.object({
  name: z4.string().min(1, "Name is required").max(100)
});
async function action3({ request }) {
  let user2 = await requireUser(request), name = (await request.formData()).get("name"), result = CreateOrganizationSchema.safeParse({ name });
  if (!result.success)
    return json4({ errors: result.error.flatten() }, { status: 400 });
  let organization = await createOrganization({
    name: result.data.name,
    userId: user2.id
  });
  return redirect3(`/organizations/${organization.id}`);
}
function NewOrganizationPage() {
  let actionData = useActionData();
  return /* @__PURE__ */ jsxDEV8("div", { className: "max-w-md mx-auto p-6", children: [
    /* @__PURE__ */ jsxDEV8("h1", { className: "text-2xl font-semibold mb-6", children: "Create Organization" }, void 0, !1, {
      fileName: "app/routes/organizations.new.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV8(Form5, { method: "post", className: "space-y-4", children: [
      /* @__PURE__ */ jsxDEV8("div", { children: [
        /* @__PURE__ */ jsxDEV8("label", { htmlFor: "name", className: "block text-sm font-medium mb-1", children: "Organization Name" }, void 0, !1, {
          fileName: "app/routes/organizations.new.tsx",
          lineNumber: 38,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV8(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            className: "w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500",
            required: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/organizations.new.tsx",
            lineNumber: 41,
            columnNumber: 11
          },
          this
        ),
        actionData?.errors?.fieldErrors?.name && /* @__PURE__ */ jsxDEV8("p", { className: "mt-1 text-sm text-red-600", children: actionData.errors.fieldErrors.name[0] }, void 0, !1, {
          fileName: "app/routes/organizations.new.tsx",
          lineNumber: 49,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.new.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV8("div", { className: "flex justify-end space-x-4", children: [
        /* @__PURE__ */ jsxDEV8(
          "a",
          {
            href: "/organizations",
            className: "px-4 py-2 text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors",
            children: "Cancel"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/organizations.new.tsx",
            lineNumber: 56,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV8(
          "button",
          {
            type: "submit",
            className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
            children: "Create Organization"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/organizations.new.tsx",
            lineNumber: 62,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.new.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/organizations.new.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/organizations.new.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
}

// app/routes/api.connections.ts
var api_connections_exports = {};
__export(api_connections_exports, {
  action: () => action4
});
import { json as json5 } from "@remix-run/node";
import { z as z5 } from "zod";
import { eq as eq5 } from "drizzle-orm";
var connectionSchema = z5.object({
  name: z5.string().min(1),
  type: z5.literal("postgresql"),
  credentials: z5.object({
    host: z5.string(),
    port: z5.number(),
    database: z5.string(),
    user: z5.string(),
    password: z5.string(),
    ssl: z5.boolean().optional()
  })
});
async function action4({ request }) {
  let user2 = await requireUser(request);
  switch (request.method) {
    case "POST": {
      let data = connectionSchema.parse(await request.json()), orgMember = await db.query.organizationMembers.findFirst({
        where: eq5(organizationMembers.userId, user2.id)
      });
      if (!orgMember)
        throw json5({ error: "No organization found" }, { status: 404 });
      let [connection] = await db.insert(databaseConnections2).values({
        name: data.name,
        type: data.type,
        organizationId: orgMember.organizationId,
        credentials: data.credentials
      }).returning();
      try {
        await ConnectionManager.getInstance().getConnection(connection.id);
      } catch (error) {
        throw await db.delete(databaseConnections2).where(eq5(databaseConnections2.id, connection.id)), json5({ error: error.message }, { status: 400 });
      }
      return json5(connection);
    }
    case "PUT": {
      let { id } = z5.object({ id: z5.string() }).parse(await request.json()), data = connectionSchema.parse(await request.json()), connection = await db.query.databaseConnections.findFirst({
        where: eq5(databaseConnections2.id, id),
        with: {
          organization: {
            with: {
              members: {
                where: eq5(organizationMembers.userId, user2.id)
              }
            }
          }
        }
      });
      if (!connection || !connection.organization.members.length)
        throw json5({ error: "Connection not found" }, { status: 404 });
      let [updated] = await db.update(databaseConnections2).set({
        name: data.name,
        credentials: data.credentials,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(databaseConnections2.id, id)).returning();
      return json5(updated);
    }
    case "DELETE": {
      let { id } = z5.object({ id: z5.string() }).parse(await request.json()), connection = await db.query.databaseConnections.findFirst({
        where: eq5(databaseConnections2.id, id),
        with: {
          organization: {
            with: {
              members: {
                where: eq5(organizationMembers.userId, user2.id)
              }
            }
          }
        }
      });
      if (!connection || !connection.organization.members.length)
        throw json5({ error: "Connection not found" }, { status: 404 });
      return await ConnectionManager.getInstance().closeConnection(id), await db.delete(databaseConnections2).where(eq5(databaseConnections2.id, id)), json5({ success: !0 });
    }
    default:
      throw json5({ error: "Method not allowed" }, { status: 405 });
  }
}

// app/routes/_auth.register.tsx
var auth_register_exports = {};
__export(auth_register_exports, {
  action: () => action5,
  default: () => RegisterPage,
  meta: () => meta
});
import { json as json6 } from "@remix-run/node";
import { Form as Form6, Link as Link2, useActionData as useActionData2, useSearchParams } from "@remix-run/react";

// app/lib/auth/auth.server.ts
import bcrypt from "bcrypt";
import { eq as eq6 } from "drizzle-orm";
var SALT_ROUNDS = 10;
async function register({ email, password, name, redirectTo }) {
  if (await db.query.users.findFirst({
    where: eq6(users.email, email)
  }))
    return {
      error: "A user with this email already exists"
    };
  let passwordHash = await bcrypt.hash(password, SALT_ROUNDS), [user2] = await db.insert(users).values({
    email,
    name,
    passwordHash
  }).returning({
    id: users.id
  });
  return createUserSession(user2.id, redirectTo);
}
async function login({ email, password, redirectTo }) {
  let user2 = await db.query.users.findFirst({
    where: eq6(users.email, email)
  });
  return user2 ? await bcrypt.compare(password, user2.passwordHash) ? createUserSession(user2.id, redirectTo) : {
    error: "Invalid email or password"
  } : {
    error: "Invalid email or password"
  };
}

// app/routes/_auth.register.tsx
import { jsxDEV as jsxDEV9 } from "react/jsx-dev-runtime";
var meta = () => [{ title: "Register - Data Studio" }];
async function action5({ request }) {
  let formData = await request.formData(), email = formData.get("email"), password = formData.get("password"), name = formData.get("name"), redirectTo = formData.get("redirectTo") || "/";
  return typeof email != "string" || typeof password != "string" || typeof name != "string" || typeof redirectTo != "string" ? json6({ error: "Invalid form submission" }, { status: 400 }) : register({ email, password, name, redirectTo });
}
function RegisterPage() {
  let actionData = useActionData2(), [searchParams] = useSearchParams(), redirectTo = searchParams.get("redirectTo") || "/";
  return /* @__PURE__ */ jsxDEV9("div", { className: "flex min-h-screen flex-col justify-center", children: /* @__PURE__ */ jsxDEV9("div", { className: "mx-auto w-full max-w-md", children: [
    /* @__PURE__ */ jsxDEV9("div", { className: "flex flex-col space-y-3 text-center", children: [
      /* @__PURE__ */ jsxDEV9("h1", { className: "text-3xl font-bold tracking-tight", children: "Create an account" }, void 0, !1, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 37,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV9("p", { className: "text-sm text-gray-500", children: "Please enter your details to sign up" }, void 0, !1, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 38,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_auth.register.tsx",
      lineNumber: 36,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV9(Form6, { method: "post", className: "mt-8 space-y-6", children: [
      /* @__PURE__ */ jsxDEV9("input", { type: "hidden", name: "redirectTo", value: redirectTo }, void 0, !1, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 44,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV9("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxDEV9(
          "label",
          {
            htmlFor: "name",
            className: "block text-sm font-medium leading-6 text-gray-900",
            children: "Full name"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 47,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV9(
          "input",
          {
            id: "name",
            name: "name",
            type: "text",
            autoComplete: "name",
            required: !0,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 53,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 46,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV9("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxDEV9(
          "label",
          {
            htmlFor: "email",
            className: "block text-sm font-medium leading-6 text-gray-900",
            children: "Email address"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 64,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV9(
          "input",
          {
            id: "email",
            name: "email",
            type: "email",
            autoComplete: "email",
            required: !0,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 70,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 63,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV9("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxDEV9(
          "label",
          {
            htmlFor: "password",
            className: "block text-sm font-medium leading-6 text-gray-900",
            children: "Password"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 81,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV9(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            autoComplete: "new-password",
            required: !0,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 87,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 80,
        columnNumber: 11
      }, this),
      actionData?.error && /* @__PURE__ */ jsxDEV9("div", { className: "text-sm text-red-600", children: actionData.error }, void 0, !1, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 98,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV9(
        "button",
        {
          type: "submit",
          className: "flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          children: "Sign up"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_auth.register.tsx",
          lineNumber: 101,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV9("p", { className: "text-center text-sm text-gray-500", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsxDEV9(
          Link2,
          {
            to: {
              pathname: "/login",
              search: searchParams.toString()
            },
            className: "font-semibold leading-6 text-blue-600 hover:text-blue-500",
            children: "Sign in"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.register.tsx",
            lineNumber: 110,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.register.tsx",
        lineNumber: 108,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_auth.register.tsx",
      lineNumber: 43,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_auth.register.tsx",
    lineNumber: 35,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/_auth.register.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
}

// app/routes/organizations.tsx
var organizations_exports = {};
__export(organizations_exports, {
  default: () => OrganizationsPage,
  loader: () => loader4
});
import { json as json7 } from "@remix-run/node";
import { Link as Link3, useLoaderData as useLoaderData4 } from "@remix-run/react";
import { jsxDEV as jsxDEV10 } from "react/jsx-dev-runtime";
async function loader4({ request }) {
  let user2 = await requireUser(request), organizations3 = await getUserOrganizations(user2.id);
  return json7({ organizations: organizations3 });
}
function OrganizationsPage() {
  let { organizations: organizations3 } = useLoaderData4();
  return /* @__PURE__ */ jsxDEV10("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxDEV10("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxDEV10("h1", { className: "text-2xl font-semibold", children: "Organizations" }, void 0, !1, {
        fileName: "app/routes/organizations.tsx",
        lineNumber: 18,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV10(
        Link3,
        {
          to: "/organizations/new",
          className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
          children: "Create Organization"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/organizations.tsx",
          lineNumber: 19,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/organizations.tsx",
      lineNumber: 17,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV10("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [
      organizations3.map(({ organization }) => /* @__PURE__ */ jsxDEV10(
        Link3,
        {
          to: `/organizations/${organization.id}`,
          className: "block p-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-secondary transition-colors",
          children: [
            /* @__PURE__ */ jsxDEV10("h2", { className: "text-lg font-medium mb-2", children: organization.name }, void 0, !1, {
              fileName: "app/routes/organizations.tsx",
              lineNumber: 34,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV10("p", { className: "text-sm text-light-text-secondary dark:text-dark-text-secondary", children: [
              "Created ",
              new Date(organization.createdAt).toLocaleDateString()
            ] }, void 0, !0, {
              fileName: "app/routes/organizations.tsx",
              lineNumber: 35,
              columnNumber: 13
            }, this)
          ]
        },
        organization.id,
        !0,
        {
          fileName: "app/routes/organizations.tsx",
          lineNumber: 29,
          columnNumber: 11
        },
        this
      )),
      organizations3.length === 0 && /* @__PURE__ */ jsxDEV10("div", { className: "col-span-full text-center py-12", children: [
        /* @__PURE__ */ jsxDEV10("h3", { className: "text-lg font-medium mb-2", children: "No organizations yet" }, void 0, !1, {
          fileName: "app/routes/organizations.tsx",
          lineNumber: 43,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV10("p", { className: "text-light-text-secondary dark:text-dark-text-secondary mb-4", children: "Create your first organization to get started" }, void 0, !1, {
          fileName: "app/routes/organizations.tsx",
          lineNumber: 44,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV10(
          Link3,
          {
            to: "/organizations/new",
            className: "inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors",
            children: "Create Organization"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/organizations.tsx",
            lineNumber: 47,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/organizations.tsx",
        lineNumber: 42,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/organizations.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/organizations.tsx",
    lineNumber: 16,
    columnNumber: 5
  }, this);
}

// app/routes/_auth.login.tsx
var auth_login_exports = {};
__export(auth_login_exports, {
  action: () => action6,
  default: () => LoginPage,
  meta: () => meta2
});
import { json as json8 } from "@remix-run/node";
import { Form as Form7, Link as Link4, useActionData as useActionData3, useSearchParams as useSearchParams2 } from "@remix-run/react";
import { jsxDEV as jsxDEV11 } from "react/jsx-dev-runtime";
var meta2 = () => [{ title: "Login - Data Studio" }];
async function action6({ request }) {
  let formData = await request.formData(), email = formData.get("email"), password = formData.get("password"), redirectTo = formData.get("redirectTo") || "/";
  return typeof email != "string" || typeof password != "string" || typeof redirectTo != "string" ? json8({ error: "Invalid form submission" }, { status: 400 }) : login({ email, password, redirectTo });
}
function LoginPage() {
  let actionData = useActionData3(), [searchParams] = useSearchParams2(), redirectTo = searchParams.get("redirectTo") || "/";
  return /* @__PURE__ */ jsxDEV11("div", { className: "flex min-h-screen flex-col justify-center", children: /* @__PURE__ */ jsxDEV11("div", { className: "mx-auto w-full max-w-md", children: [
    /* @__PURE__ */ jsxDEV11("div", { className: "flex flex-col space-y-3 text-center", children: [
      /* @__PURE__ */ jsxDEV11("h1", { className: "text-3xl font-bold tracking-tight", children: "Welcome back" }, void 0, !1, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 35,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV11("p", { className: "text-sm text-gray-500", children: "Please enter your details to sign in" }, void 0, !1, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 36,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_auth.login.tsx",
      lineNumber: 34,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV11(Form7, { method: "post", className: "mt-8 space-y-6", children: [
      /* @__PURE__ */ jsxDEV11("input", { type: "hidden", name: "redirectTo", value: redirectTo }, void 0, !1, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 42,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV11("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxDEV11(
          "label",
          {
            htmlFor: "email",
            className: "block text-sm font-medium leading-6 text-gray-900",
            children: "Email address"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.login.tsx",
            lineNumber: 44,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV11(
          "input",
          {
            id: "email",
            name: "email",
            type: "email",
            autoComplete: "email",
            required: !0,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.login.tsx",
            lineNumber: 50,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 43,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV11("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxDEV11(
          "label",
          {
            htmlFor: "password",
            className: "block text-sm font-medium leading-6 text-gray-900",
            children: "Password"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.login.tsx",
            lineNumber: 61,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV11(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            autoComplete: "current-password",
            required: !0,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.login.tsx",
            lineNumber: 67,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 60,
        columnNumber: 11
      }, this),
      actionData?.error && /* @__PURE__ */ jsxDEV11("div", { className: "text-sm text-red-600", children: actionData.error }, void 0, !1, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 78,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV11(
        "button",
        {
          type: "submit",
          className: "flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          children: "Sign in"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_auth.login.tsx",
          lineNumber: 81,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV11("p", { className: "text-center text-sm text-gray-500", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsxDEV11(
          Link4,
          {
            to: {
              pathname: "/register",
              search: searchParams.toString()
            },
            className: "font-semibold leading-6 text-blue-600 hover:text-blue-500",
            children: "Sign up"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/_auth.login.tsx",
            lineNumber: 90,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 88,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_auth.login.tsx",
      lineNumber: 41,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_auth.login.tsx",
    lineNumber: 33,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/_auth.login.tsx",
    lineNumber: 32,
    columnNumber: 5
  }, this);
}

// app/routes/$tableName.tsx
var tableName_exports = {};
__export(tableName_exports, {
  default: () => TablePage,
  loader: () => loader5
});
import { json as json9 } from "@remix-run/node";
import { useLoaderData as useLoaderData5, useSearchParams as useSearchParams3 } from "@remix-run/react";

// app/components/TabView.tsx
import { startCase } from "lodash-es";

// app/utils/cn.ts
import { clsx as clsx2 } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx2(inputs));
}

// app/components/TabView.tsx
import { jsxDEV as jsxDEV12 } from "react/jsx-dev-runtime";
function TabView({ tabs, activeTab, onTabChange }) {
  return /* @__PURE__ */ jsxDEV12("div", { className: "bg-light-bg-primary dark:bg-dark-bg-secondary px-6", children: /* @__PURE__ */ jsxDEV12("div", { className: "flex", children: tabs.map((tab) => {
    let isActive = activeTab === tab.id;
    return /* @__PURE__ */ jsxDEV12(
      "button",
      {
        onClick: () => onTabChange(tab.id),
        className: cn(
          "px-6 py-3 text-sm font-medium border-b-2",
          isActive ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary hover:border-light-border dark:hover:text-dark-text-primary dark:hover:border-dark-border"
        ),
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

// app/components/DataView.tsx
import { startCase as startCase2 } from "lodash-es";
import { useCallback, useMemo, useState as useState3 } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender
} from "@tanstack/react-table";
import { jsxDEV as jsxDEV13 } from "react/jsx-dev-runtime";
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
  onRowSelect,
  isLoading = !1,
  error = ""
}) {
  let [editingCell, setEditingCell] = useState3(null), [editedValue, setEditedValue] = useState3(null), [editError, setEditError] = useState3(null), handleStartEditing = useCallback((rowIndex, columnId) => {
    isEditable && (setEditingCell([rowIndex, columnId]), setEditedValue(formatCellValue(rows[rowIndex]?.[columnId])), setEditError(null));
  }, [rows, isEditable, formatCellValue]), handleStopEditing = useCallback(() => {
    setEditingCell(null), setEditedValue(null), setEditError(null);
  }, []), handleKeyDown = useCallback(async (e, rowIndex, columnId) => {
    if (e.key === "Escape")
      handleStopEditing();
    else if (e.key === "Enter")
      try {
        let value = e.target.value, newData = {
          ...rows[rowIndex],
          [columnId]: value
        };
        await onEdit?.(rowIndex, newData), handleStopEditing();
      } catch (error2) {
        setEditError(error2 instanceof Error ? error2.message : "Failed to update value");
      }
  }, [rows, onEdit, handleStopEditing]), handleSort = useCallback((columnId) => {
    onSort(columnId);
  }, [onSort]), handleRowClick = useCallback((rowIndex) => {
    onRowSelect?.(selectedRow === rowIndex ? null : rowIndex);
  }, [selectedRow, onRowSelect]), handleDelete = useCallback(async (e, rowIndex) => {
    if (e.stopPropagation(), !!window.confirm("Are you sure you want to delete this row?"))
      try {
        await onDelete?.(rowIndex);
      } catch (error2) {
        console.error("Failed to delete row:", error2);
      }
  }, [onDelete]), columnHelper = createColumnHelper(), tableColumns = useMemo(
    () => columns.map(
      (col) => columnHelper.accessor(col.name, {
        header: () => startCase2(col.name),
        cell: (info) => {
          let rowIndex = info.row.index, columnId = col.name, isEditing = editingCell?.[0] === rowIndex && editingCell?.[1] === columnId, value = info.getValue();
          return isEditing ? /* @__PURE__ */ jsxDEV13("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV13(
              "input",
              {
                type: "text",
                value: editedValue || "",
                onChange: (e) => setEditedValue(e.target.value),
                onKeyDown: (e) => handleKeyDown(e, rowIndex, columnId),
                onBlur: () => handleStopEditing(),
                className: cn(
                  "w-full px-2 py-1 bg-white dark:bg-gray-800 border rounded-md focus:outline-none focus:ring-2",
                  editError ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400" : "border-primary-500 dark:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                ),
                autoFocus: !0
              },
              void 0,
              !1,
              {
                fileName: "app/components/DataView.tsx",
                lineNumber: 120,
                columnNumber: 17
              },
              this
            ),
            editError && /* @__PURE__ */ jsxDEV13("div", { className: "absolute left-0 right-0 -bottom-6 text-xs text-red-500 dark:text-red-400", children: editError }, void 0, !1, {
              fileName: "app/components/DataView.tsx",
              lineNumber: 135,
              columnNumber: 19
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/DataView.tsx",
            lineNumber: 119,
            columnNumber: 15
          }, this) : /* @__PURE__ */ jsxDEV13(
            "div",
            {
              className: cn(
                "cursor-pointer",
                isEditable && "hover:bg-primary-50 dark:hover:bg-primary-900/20"
              ),
              onClick: () => handleStartEditing(rowIndex, columnId),
              children: formatCellValue(value)
            },
            void 0,
            !1,
            {
              fileName: "app/components/DataView.tsx",
              lineNumber: 144,
              columnNumber: 13
            },
            this
          );
        }
      })
    ),
    [columns, formatCellValue, editingCell, editedValue, handleKeyDown, handleStartEditing, isEditable, editError]
  ), sorting = useMemo(
    () => sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    [sortBy, sortOrder]
  ), [sortingState, setSorting] = useState3(sorting), table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting: sortingState
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });
  return error ? /* @__PURE__ */ jsxDEV13("div", { className: "border rounded-lg border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/50 p-4", children: /* @__PURE__ */ jsxDEV13("div", { className: "text-red-700 dark:text-red-300", children: error }, void 0, !1, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 181,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 180,
    columnNumber: 7
  }, this) : /* @__PURE__ */ jsxDEV13("div", { className: "border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full flex flex-col relative", children: [
    isLoading && /* @__PURE__ */ jsxDEV13("div", { className: "absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10", children: /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxDEV13("div", { className: "w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 191,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV13("div", { className: "w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 192,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV13("div", { className: "w-2 h-2 bg-primary-500 rounded-full animate-bounce" }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 193,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 190,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 189,
      columnNumber: 9
    }, this),
    rows.length === 0 ? /* @__PURE__ */ jsxDEV13("div", { className: "flex flex-col items-center justify-center p-8 text-center", children: [
      /* @__PURE__ */ jsxDEV13("div", { className: "text-gray-500 dark:text-gray-400 mb-2", children: "No data available" }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 200,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV13("div", { className: "text-sm text-gray-400 dark:text-gray-500", children: "This table is empty" }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 201,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 199,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV13("div", { className: "overflow-auto flex-1 relative rounded-lg", children: /* @__PURE__ */ jsxDEV13("table", { className: "w-full text-sm text-left text-gray-500 dark:text-gray-400", children: [
      /* @__PURE__ */ jsxDEV13("thead", { className: "sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400", children: /* @__PURE__ */ jsxDEV13("tr", { children: [
        table.getAllColumns().map((column) => /* @__PURE__ */ jsxDEV13(
          "th",
          {
            scope: "col",
            className: "px-6 py-3 cursor-pointer select-none whitespace-nowrap bg-gray-50 dark:bg-gray-800",
            onClick: () => handleSort(column.id),
            children: /* @__PURE__ */ jsxDEV13("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV13("span", { children: startCase2(column.id) }, void 0, !1, {
                fileName: "app/components/DataView.tsx",
                lineNumber: 216,
                columnNumber: 23
              }, this),
              sortingState[0]?.id === column.id && /* @__PURE__ */ jsxDEV13("span", { className: "text-gray-400", children: sortingState[0].desc ? "\u2193" : "\u2191" }, void 0, !1, {
                fileName: "app/components/DataView.tsx",
                lineNumber: 218,
                columnNumber: 25
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/DataView.tsx",
              lineNumber: 215,
              columnNumber: 21
            }, this)
          },
          column.id,
          !1,
          {
            fileName: "app/components/DataView.tsx",
            lineNumber: 209,
            columnNumber: 19
          },
          this
        )),
        isEditable && /* @__PURE__ */ jsxDEV13("th", { scope: "col", className: "px-6 py-3 bg-gray-50 dark:bg-gray-800 w-24", children: /* @__PURE__ */ jsxDEV13("span", { className: "sr-only", children: "Actions" }, void 0, !1, {
          fileName: "app/components/DataView.tsx",
          lineNumber: 227,
          columnNumber: 21
        }, this) }, void 0, !1, {
          fileName: "app/components/DataView.tsx",
          lineNumber: 226,
          columnNumber: 19
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 207,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 206,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV13("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: table.getRowModel().rows.map((row, rowIndex) => /* @__PURE__ */ jsxDEV13(
        "tr",
        {
          className: cn(
            "bg-white dark:bg-gray-900",
            selectedRow === rowIndex && "bg-primary-50 dark:bg-primary-900/20",
            "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b dark:border-gray-700"
          ),
          onClick: () => handleRowClick(rowIndex),
          children: [
            row.getAllCells().map((cell) => /* @__PURE__ */ jsxDEV13(
              "td",
              {
                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                children: flexRender(cell.column.columnDef.cell, cell.getContext())
              },
              cell.id,
              !1,
              {
                fileName: "app/components/DataView.tsx",
                lineNumber: 244,
                columnNumber: 21
              },
              this
            )),
            isEditable && /* @__PURE__ */ jsxDEV13("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxDEV13(
              "button",
              {
                onClick: (e) => handleDelete(e, rowIndex),
                className: "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300",
                children: "Delete"
              },
              void 0,
              !1,
              {
                fileName: "app/components/DataView.tsx",
                lineNumber: 253,
                columnNumber: 23
              },
              this
            ) }, void 0, !1, {
              fileName: "app/components/DataView.tsx",
              lineNumber: 252,
              columnNumber: 21
            }, this)
          ]
        },
        rowIndex,
        !0,
        {
          fileName: "app/components/DataView.tsx",
          lineNumber: 234,
          columnNumber: 17
        },
        this
      )) }, void 0, !1, {
        fileName: "app/components/DataView.tsx",
        lineNumber: 232,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 205,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 204,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 187,
    columnNumber: 5
  }, this);
}

// app/components/EmptyState.tsx
import { FolderIcon, TableCellsIcon, CircleStackIcon } from "@heroicons/react/24/outline";
import { jsxDEV as jsxDEV14 } from "react/jsx-dev-runtime";
var icons = {
  table: TableCellsIcon,
  query: CircleStackIcon,
  database: FolderIcon
};
function EmptyState({ type, title, message, action: action10 }) {
  let Icon = icons[type];
  return /* @__PURE__ */ jsxDEV14("div", { className: "flex flex-col items-center justify-center h-full p-8 text-center", children: [
    /* @__PURE__ */ jsxDEV14("div", { className: "flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary", children: /* @__PURE__ */ jsxDEV14(Icon, { className: "w-8 h-8 text-light-text-secondary dark:text-dark-text-secondary" }, void 0, !1, {
      fileName: "app/components/EmptyState.tsx",
      lineNumber: 27,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/EmptyState.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV14("h3", { className: "mb-2 text-lg font-medium text-light-text-primary dark:text-dark-text-primary", children: title }, void 0, !1, {
      fileName: "app/components/EmptyState.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV14("p", { className: "mb-6 text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-sm", children: message }, void 0, !1, {
      fileName: "app/components/EmptyState.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this),
    action10 && /* @__PURE__ */ jsxDEV14(
      "button",
      {
        onClick: action10.onClick,
        className: "px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
        children: action10.label
      },
      void 0,
      !1,
      {
        fileName: "app/components/EmptyState.tsx",
        lineNumber: 36,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/EmptyState.tsx",
    lineNumber: 25,
    columnNumber: 5
  }, this);
}

// app/components/RowDetailsSidebar.tsx
import { useEffect as useEffect2, useState as useState4 } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { startCase as startCase3 } from "lodash-es";
import { Fragment as Fragment3, jsxDEV as jsxDEV15 } from "react/jsx-dev-runtime";
function RowDetailsSidebar({
  row,
  columns,
  isOpen,
  onClose,
  formatCellValue
}) {
  let [mounted, setMounted] = useState4(!1);
  if (useEffect2(() => (setMounted(!0), () => setMounted(!1)), []), !mounted)
    return null;
  let sidebarContent = /* @__PURE__ */ jsxDEV15(Fragment3, { children: [
    /* @__PURE__ */ jsxDEV15(
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
        lineNumber: 34,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV15(
      "div",
      {
        className: cn(
          "m-6 border rounded-lg fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxDEV15("div", { className: " rounded-lg flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800", children: [
            /* @__PURE__ */ jsxDEV15("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100", children: "Row Details" }, void 0, !1, {
              fileName: "app/components/RowDetailsSidebar.tsx",
              lineNumber: 48,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV15(
              "button",
              {
                onClick: onClose,
                className: "p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
                children: /* @__PURE__ */ jsxDEV15(XMarkIcon, { className: "h-5 w-5" }, void 0, !1, {
                  fileName: "app/components/RowDetailsSidebar.tsx",
                  lineNumber: 53,
                  columnNumber: 13
                }, this)
              },
              void 0,
              !1,
              {
                fileName: "app/components/RowDetailsSidebar.tsx",
                lineNumber: 49,
                columnNumber: 11
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 47,
            columnNumber: 9
          }, this),
          row && /* @__PURE__ */ jsxDEV15("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxDEV15("div", { className: "p-4 space-y-4", children: columns.map((column) => /* @__PURE__ */ jsxDEV15(
            "div",
            {
              className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
              children: [
                /* @__PURE__ */ jsxDEV15("div", { className: "px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV15("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxDEV15("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: startCase3(column.name) }, void 0, !1, {
                    fileName: "app/components/RowDetailsSidebar.tsx",
                    lineNumber: 66,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV15("span", { className: "text-xs text-gray-500 dark:text-gray-400 font-mono", children: column.type }, void 0, !1, {
                    fileName: "app/components/RowDetailsSidebar.tsx",
                    lineNumber: 69,
                    columnNumber: 23
                  }, this)
                ] }, void 0, !0, {
                  fileName: "app/components/RowDetailsSidebar.tsx",
                  lineNumber: 65,
                  columnNumber: 21
                }, this) }, void 0, !1, {
                  fileName: "app/components/RowDetailsSidebar.tsx",
                  lineNumber: 64,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV15("div", { className: "px-4 py-3 bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxDEV15("div", { className: "font-mono text-sm text-gray-900 dark:text-gray-100 break-words", children: formatCellValue(row[column.name]) }, void 0, !1, {
                  fileName: "app/components/RowDetailsSidebar.tsx",
                  lineNumber: 75,
                  columnNumber: 21
                }, this) }, void 0, !1, {
                  fileName: "app/components/RowDetailsSidebar.tsx",
                  lineNumber: 74,
                  columnNumber: 19
                }, this)
              ]
            },
            column.name,
            !0,
            {
              fileName: "app/components/RowDetailsSidebar.tsx",
              lineNumber: 60,
              columnNumber: 17
            },
            this
          )) }, void 0, !1, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 58,
            columnNumber: 13
          }, this) }, void 0, !1, {
            fileName: "app/components/RowDetailsSidebar.tsx",
            lineNumber: 57,
            columnNumber: 11
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/components/RowDetailsSidebar.tsx",
        lineNumber: 41,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/RowDetailsSidebar.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
  return createPortal(sidebarContent, document.body);
}

// app/routes/$tableName.tsx
import { useCallback as useCallback2, useState as useState6 } from "react";
import { isNumber, startCase as startCase4 } from "lodash-es";

// app/hooks/useClient.ts
import { useState as useState5, useEffect as useEffect3 } from "react";
function useClient() {
  let [isClient, setIsClient] = useState5(!1);
  return useEffect3(() => {
    setIsClient(!0);
  }, []), isClient;
}

// app/routes/$tableName.tsx
init_api_server();
init_api_server();
import { Fragment as Fragment4, jsxDEV as jsxDEV16 } from "react/jsx-dev-runtime";
async function loader5({ params, request }) {
  let tableName = params.tableName;
  if (!tableName)
    throw new Error("Table name is required");
  let url = new URL(request.url), sortBy = url.searchParams.get("sortBy") || void 0, sortOrder = url.searchParams.get("sortOrder"), data = await fetchTableData(tableName, sortBy, sortOrder), tableSchema = (await fetchSchema()).find((t) => t.name === tableName);
  if (!tableSchema)
    throw new Error(`Table ${tableName} not found`);
  return json9({
    tableName,
    data,
    columns: tableSchema.columns
  });
}
function TablePage() {
  let { tableName, data, columns } = useLoaderData5(), [searchParams, setSearchParams] = useSearchParams3(), isClient = useClient(), [selectedRow, setSelectedRow] = useState6(null), [isLoading, setIsLoading] = useState6(!1), [error, setError] = useState6(null), activeTab = searchParams.get("tab") || "content", sortBy = searchParams.get("sortBy") || void 0, sortOrder = searchParams.get("sortOrder") || void 0, handleSort = useCallback2((columnId) => {
    setSearchParams((prev) => {
      let newParams = new URLSearchParams(prev);
      return newParams.set("sortBy", columnId), newParams.set("sortOrder", prev.get("sortBy") === columnId && prev.get("sortOrder") === "asc" ? "desc" : "asc"), newParams;
    });
  }, [setSearchParams]), handleTabChange = useCallback2((tabId) => {
    setSearchParams((prev) => {
      let newParams = new URLSearchParams(prev);
      return newParams.set("tab", tabId), newParams;
    });
  }, [setSearchParams]), handleEdit = useCallback2(async (rowIndex, newData) => {
    if (tableName) {
      setIsLoading(!0), setError(null);
      try {
        let response = await fetch(`/api/tables/${tableName}/rows/${rowIndex}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newData)
        });
        if (!response.ok)
          throw new Error(`Failed to update row: ${response.statusText}`);
      } catch (err) {
        throw setError(err instanceof Error ? err.message : "Failed to update row"), err;
      } finally {
        setIsLoading(!1);
      }
    }
  }, [tableName]), handleDelete = useCallback2(async (rowIndex) => {
    if (tableName) {
      setIsLoading(!0), setError(null);
      try {
        let response = await fetch(`/api/tables/${tableName}/rows/${rowIndex}`, {
          method: "DELETE"
        });
        if (!response.ok)
          throw new Error(`Failed to delete row: ${response.statusText}`);
        selectedRow === rowIndex && setSelectedRow(null);
      } catch (err) {
        throw setError(err instanceof Error ? err.message : "Failed to delete row"), err;
      } finally {
        setIsLoading(!1);
      }
    }
  }, [tableName, selectedRow]), formatCellValue = useCallback2((value) => value === null ? "NULL" : value === void 0 ? "" : typeof value == "object" ? JSON.stringify(value) : String(value), []), tabs = [
    { id: "content", label: "Content" },
    { id: "structure", label: "Structure" },
    { id: "indexes", label: "Indexes" },
    { id: "foreign-keys", label: "Foreign Keys" }
  ], renderTabContent = () => {
    if (!isClient)
      return null;
    switch (activeTab) {
      case "content":
        return data.data.length === 0 ? /* @__PURE__ */ jsxDEV16(
          EmptyState,
          {
            type: "table",
            title: "No Data",
            message: "This table is empty"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 152,
            columnNumber: 13
          },
          this
        ) : /* @__PURE__ */ jsxDEV16(
          DataView,
          {
            columns,
            rows: data.data,
            sortBy,
            sortOrder,
            onSort: handleSort,
            formatCellValue,
            isEditable: !0,
            onEdit: handleEdit,
            onDelete: handleDelete,
            selectedRow: isNumber(selectedRow) ? selectedRow : void 0,
            onRowSelect: setSelectedRow,
            isLoading,
            error: error || void 0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 160,
            columnNumber: 11
          },
          this
        );
      case "structure":
        return columns.length === 0 ? /* @__PURE__ */ jsxDEV16(
          EmptyState,
          {
            type: "database",
            title: "No Columns",
            message: "This table has no columns defined"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 179,
            columnNumber: 13
          },
          this
        ) : /* @__PURE__ */ jsxDEV16("div", { className: "space-y-4", children: /* @__PURE__ */ jsxDEV16("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV16("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [
          /* @__PURE__ */ jsxDEV16("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxDEV16("tr", { children: [
            /* @__PURE__ */ jsxDEV16("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Name" }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 192,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV16("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Type" }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 193,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV16("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Nullable" }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 194,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV16("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Default" }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 195,
              columnNumber: 21
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 191,
            columnNumber: 19
          }, this) }, void 0, !1, {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 190,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV16("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: columns.map((column, idx) => /* @__PURE__ */ jsxDEV16("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-800", children: [
            /* @__PURE__ */ jsxDEV16("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: column.name }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 201,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV16("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: column.type }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 202,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV16("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: column.nullable ? "Yes" : "No" }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 203,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV16("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: column.defaultValue || "-" }, void 0, !1, {
              fileName: "app/routes/$tableName.tsx",
              lineNumber: 204,
              columnNumber: 23
            }, this)
          ] }, idx, !0, {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 200,
            columnNumber: 21
          }, this)) }, void 0, !1, {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 198,
            columnNumber: 17
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 189,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 188,
          columnNumber: 13
        }, this) }, void 0, !1, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 187,
          columnNumber: 11
        }, this);
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxDEV16("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxDEV16("div", { className: "flex-none p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxDEV16("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-gray-100", children: startCase4(tableName) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 220,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 219,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV16("div", { className: "flex-1 flex flex-col min-h-0", children: [
      /* @__PURE__ */ jsxDEV16("div", { className: "flex-none border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV16(
        TabView,
        {
          tabs,
          activeTab,
          onTabChange: handleTabChange
        },
        void 0,
        !1,
        {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 227,
          columnNumber: 11
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 226,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV16(Fragment4, { children: [
        /* @__PURE__ */ jsxDEV16("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: renderTabContent() }, void 0, !1, {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 234,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV16(
          RowDetailsSidebar,
          {
            row: selectedRow !== null ? data.data[selectedRow] : null,
            columns,
            isOpen: selectedRow !== null,
            onClose: () => setSelectedRow(null),
            formatCellValue
          },
          void 0,
          !1,
          {
            fileName: "app/routes/$tableName.tsx",
            lineNumber: 237,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 233,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 225,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 218,
    columnNumber: 5
  }, this);
}

// app/routes/api.query.ts
var api_query_exports = {};
__export(api_query_exports, {
  action: () => action7
});
import { json as json10 } from "@remix-run/node";
import { z as z6 } from "zod";
import { eq as eq7 } from "drizzle-orm";
var querySchema = z6.object({
  connectionId: z6.string(),
  query: z6.string().min(1)
});
async function action7({ request }) {
  let user2 = await requireUser(request);
  if (request.method !== "POST")
    throw json10({ error: "Method not allowed" }, { status: 405 });
  let { connectionId, query } = querySchema.parse(await request.json()), connection = await db.query.databaseConnections.findFirst({
    where: eq7(databaseConnections.id, connectionId),
    with: {
      organization: {
        with: {
          members: {
            where: eq7(organizationMembers.userId, user2.id)
          }
        }
      }
    }
  });
  if (!connection || !connection.organization.members.length)
    throw json10({ error: "Connection not found" }, { status: 404 });
  let pool3 = await ConnectionManager.getInstance().getConnection(connectionId), startTime = Date.now(), result, error, status = "success";
  try {
    let client = await pool3.connect();
    try {
      result = await client.query(query);
    } catch (e) {
      error = e.message, status = "error", result = null;
    } finally {
      client.release();
    }
  } catch (e) {
    error = e.message, status = "error", result = null;
  }
  let executionTimeMs = Date.now() - startTime;
  if (await db.insert(queryHistory).values({
    organizationId: connection.organizationId,
    connectionId,
    userId: user2.id,
    query,
    executionTimeMs: executionTimeMs.toString(),
    status,
    error: error || null
  }), error)
    throw json10({ error }, { status: 400 });
  return json10({
    rows: result.rows,
    rowCount: result.rowCount,
    fields: result.fields.map((f) => ({
      name: f.name,
      dataTypeId: f.dataTypeID
    })),
    executionTimeMs
  });
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader6,
  meta: () => meta3
});
import { json as json11 } from "@remix-run/node";
import { useLoaderData as useLoaderData6 } from "@remix-run/react";
import { useState as useState7 } from "react";

// app/components/TableList.tsx
import { Link as Link5 } from "@remix-run/react";
import { startCase as startCase5 } from "lodash-es";
import { jsxDEV as jsxDEV17 } from "react/jsx-dev-runtime";
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
  return startCase5(name.toLowerCase());
}
function TableList({ tables }) {
  return /* @__PURE__ */ jsxDEV17("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: tables.map((table) => /* @__PURE__ */ jsxDEV17(
    Link5,
    {
      to: `/${table.name}`,
      className: "group block w-full p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl",
      children: [
        /* @__PURE__ */ jsxDEV17("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxDEV17("h5", { className: "text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate max-w-[80%]", children: prettyPrintName(table.name) }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 41,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV17("span", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400", children: /* @__PURE__ */ jsxDEV17("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV17("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }, void 0, !1, {
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
        /* @__PURE__ */ jsxDEV17("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV17("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxDEV17("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV17("span", { className: "font-bold", children: table.columns.length }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 53,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV17("span", { className: "italic text-gray-500 dark:text-gray-400", children: "columns" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 54,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 52,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV17("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 56,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV17("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV17("span", { className: "font-bold", children: formatNumber(table.rowCount) }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 58,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV17("span", { className: "italic text-gray-500 dark:text-gray-400", children: "rows" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 59,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 57,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV17("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 61,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV17("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV17("span", { className: "font-bold", children: formatBytes(table.sizeInBytes) }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 63,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV17("span", { className: "italic text-gray-500 dark:text-gray-400", children: "size" }, void 0, !1, {
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
          Array.isArray(table.primaryKey) && table.primaryKey.length > 0 && /* @__PURE__ */ jsxDEV17("p", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: [
            /* @__PURE__ */ jsxDEV17("span", { className: "font-normal text-gray-500 dark:text-gray-400", children: "Primary Key:" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 69,
              columnNumber: 17
            }, this),
            " ",
            /* @__PURE__ */ jsxDEV17("span", { className: "font-mono text-purple-600 dark:text-purple-400", children: table.primaryKey.map(prettyPrintName).join(", ") }, void 0, !1, {
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
        /* @__PURE__ */ jsxDEV17("div", { className: "mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400", children: [
          /* @__PURE__ */ jsxDEV17("span", { children: "View table" }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 77,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV17("svg", { className: "flex-shrink-0 w-4 h-4 ml-1 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV17("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }, void 0, !1, {
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

// app/components/PageContainer.tsx
import { jsxDEV as jsxDEV18 } from "react/jsx-dev-runtime";
function PageContainer({ children }) {
  return /* @__PURE__ */ jsxDEV18("div", { className: "h-screen bg-gray-100 dark:bg-gray-950", children: /* @__PURE__ */ jsxDEV18("div", { className: "h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden flex flex-col", children }, void 0, !1, {
    fileName: "app/components/PageContainer.tsx",
    lineNumber: 10,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/PageContainer.tsx",
    lineNumber: 9,
    columnNumber: 5
  }, this);
}

// app/routes/_index.tsx
import { jsxDEV as jsxDEV19 } from "react/jsx-dev-runtime";
var meta3 = () => [
  { title: "Data Studio" },
  { name: "description", content: "Database management studio" }
];
async function loader6({ request }) {
  try {
    let { fetchSchema: fetchSchema2 } = await Promise.resolve().then(() => (init_api_server(), api_server_exports)), tables = await fetchSchema2();
    return json11({ tables });
  } catch (error) {
    return console.error("Error loading tables:", error), json11({ tables: [] });
  }
}
function Index() {
  let { tables } = useLoaderData6(), [searchTerm, setSearchTerm] = useState7(""), filteredTables = tables.filter(
    (table) => table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return /* @__PURE__ */ jsxDEV19(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV19("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV19("div", { className: "relative", children: [
      /* @__PURE__ */ jsxDEV19(
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
          lineNumber: 42,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV19("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxDEV19("svg", { className: "h-5 w-5 text-gray-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxDEV19("path", { fillRule: "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule: "evenodd" }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 51,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 50,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 49,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 41,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV19(TableList, { tables: filteredTables }, void 0, !1, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 56,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 39,
    columnNumber: 5
  }, this);
}

// app/routes/signup.tsx
var signup_exports = {};
__export(signup_exports, {
  action: () => action8,
  default: () => SignUp,
  loader: () => loader7
});
import { json as json12, redirect as redirect5 } from "@remix-run/node";
import { Form as Form8, Link as Link6, useActionData as useActionData4 } from "@remix-run/react";

// app/services/auth.server.ts
import { createCookieSessionStorage as createCookieSessionStorage2, redirect as redirect4 } from "@remix-run/node";
import * as bcrypt2 from "bcryptjs";
import { eq as eq8 } from "drizzle-orm";
var sessionStorage2 = createCookieSessionStorage2({
  cookie: {
    name: "__session",
    httpOnly: !0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret-please-change"],
    secure: !1
  }
}), USER_SESSION_KEY = "userId", SESSION_EXPIRY = 60 * 60 * 24 * 30;
async function createUser(email, password) {
  let hashedPassword = await bcrypt2.hash(password, 10);
  if (await db.query(users).where(eq8(users.email, email)).get())
    throw new Error("User already exists");
  return (await db.insert(users).values({
    email,
    name: email.split("@")[0],
    // Default name from email
    passwordHash: hashedPassword,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).returning())[0];
}
async function createUserSession2({
  request,
  userId,
  remember,
  redirectTo
}) {
  let session = await getSession(request);
  return session.set(USER_SESSION_KEY, userId), redirect4(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage2.commitSession(session, {
        maxAge: remember ? SESSION_EXPIRY : void 0
      })
    }
  });
}
async function getUserSession2(request) {
  return sessionStorage2.getSession(request.headers.get("Cookie"));
}
async function getSession(request) {
  let cookie = request.headers.get("Cookie");
  return sessionStorage2.getSession(cookie);
}
function validatePassword(password) {
  return password.length < 8 ? "Password must be at least 8 characters" : /\d/.test(password) ? /[a-z]/.test(password) ? /[A-Z]/.test(password) ? null : "Password must contain at least one uppercase letter" : "Password must contain at least one lowercase letter" : "Password must contain at least one number";
}

// app/routes/signup.tsx
import { jsxDEV as jsxDEV20 } from "react/jsx-dev-runtime";
async function loader7({ request }) {
  return await getUserSession2(request) ? redirect5("/") : json12({});
}
async function action8({ request }) {
  let formData = await request.formData(), email = formData.get("email"), password = formData.get("password"), confirmPassword = formData.get("confirmPassword");
  if (!email || !password || !confirmPassword)
    return json12(
      {
        errors: {
          email: email ? null : "Email is required",
          password: password ? null : "Password is required",
          confirmPassword: confirmPassword ? null : "Password confirmation is required"
        }
      },
      { status: 400 }
    );
  if (typeof email != "string" || typeof password != "string" || typeof confirmPassword != "string")
    return json12(
      {
        errors: {
          email: typeof email != "string" ? "Invalid email" : null,
          password: typeof password != "string" ? "Invalid password" : null,
          confirmPassword: typeof confirmPassword != "string" ? "Invalid password confirmation" : null
        }
      },
      { status: 400 }
    );
  let errors = {
    email: null,
    password: null,
    confirmPassword: null
  };
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (errors.email = "Invalid email address");
  let passwordError = await validatePassword(password);
  if (passwordError && (errors.password = passwordError), password !== confirmPassword && (errors.confirmPassword = "Passwords do not match"), Object.values(errors).some(Boolean))
    return json12({ errors }, { status: 400 });
  try {
    let user2 = await createUser(email, password);
    return createUserSession2({
      request,
      userId: user2.id,
      remember: !1,
      redirectTo: "/"
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists")
      return json12(
        { errors: { email: "A user already exists with this email" } },
        { status: 400 }
      );
    throw error;
  }
}
function SignUp() {
  let actionData = useActionData4();
  return /* @__PURE__ */ jsxDEV20("div", { className: "flex min-h-screen items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxDEV20("div", { className: "w-full max-w-md", children: /* @__PURE__ */ jsxDEV20("div", { className: "rounded-lg bg-white px-8 pb-8 pt-6 shadow-md", children: [
    /* @__PURE__ */ jsxDEV20("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsxDEV20("h1", { className: "text-2xl font-bold", children: "Create an account" }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 95,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV20("p", { className: "text-gray-600", children: "Start managing your databases" }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 96,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 94,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV20(Form8, { method: "post", className: "space-y-6", children: [
      /* @__PURE__ */ jsxDEV20("div", { children: [
        /* @__PURE__ */ jsxDEV20(
          "label",
          {
            htmlFor: "email",
            className: "block text-sm font-medium text-gray-700",
            children: "Email"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 101,
            columnNumber: 15
          },
          this
        ),
        /* @__PURE__ */ jsxDEV20(
          "input",
          {
            type: "email",
            name: "email",
            id: "email",
            required: !0,
            autoFocus: !0,
            autoComplete: "email",
            "aria-invalid": actionData?.errors?.email ? !0 : void 0,
            "aria-describedby": "email-error",
            className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 107,
            columnNumber: 15
          },
          this
        ),
        actionData?.errors?.email && /* @__PURE__ */ jsxDEV20("div", { className: "mt-1 text-red-600", id: "email-error", children: actionData.errors.email }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 119,
          columnNumber: 17
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 100,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV20("div", { children: [
        /* @__PURE__ */ jsxDEV20(
          "label",
          {
            htmlFor: "password",
            className: "block text-sm font-medium text-gray-700",
            children: "Password"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 126,
            columnNumber: 15
          },
          this
        ),
        /* @__PURE__ */ jsxDEV20(
          "input",
          {
            type: "password",
            name: "password",
            id: "password",
            required: !0,
            autoComplete: "new-password",
            "aria-invalid": actionData?.errors?.password ? !0 : void 0,
            "aria-describedby": "password-error",
            className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 132,
            columnNumber: 15
          },
          this
        ),
        actionData?.errors?.password && /* @__PURE__ */ jsxDEV20("div", { className: "mt-1 text-red-600", id: "password-error", children: actionData.errors.password }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 143,
          columnNumber: 17
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 125,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV20("div", { children: [
        /* @__PURE__ */ jsxDEV20(
          "label",
          {
            htmlFor: "confirmPassword",
            className: "block text-sm font-medium text-gray-700",
            children: "Confirm Password"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 150,
            columnNumber: 15
          },
          this
        ),
        /* @__PURE__ */ jsxDEV20(
          "input",
          {
            type: "password",
            name: "confirmPassword",
            id: "confirmPassword",
            required: !0,
            autoComplete: "new-password",
            "aria-invalid": actionData?.errors?.confirmPassword ? !0 : void 0,
            "aria-describedby": "confirmPassword-error",
            className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/signup.tsx",
            lineNumber: 156,
            columnNumber: 15
          },
          this
        ),
        actionData?.errors?.confirmPassword && /* @__PURE__ */ jsxDEV20("div", { className: "mt-1 text-red-600", id: "confirmPassword-error", children: actionData.errors.confirmPassword }, void 0, !1, {
          fileName: "app/routes/signup.tsx",
          lineNumber: 167,
          columnNumber: 17
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 149,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV20("div", { children: /* @__PURE__ */ jsxDEV20(
        "button",
        {
          type: "submit",
          className: "flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          children: "Create Account"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 174,
          columnNumber: 15
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/signup.tsx",
        lineNumber: 173,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 99,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV20("div", { className: "mt-6 text-center text-sm text-gray-600", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsxDEV20(
        Link6,
        {
          to: "/login",
          className: "font-medium text-blue-600 hover:text-blue-500",
          children: "Sign in"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 185,
          columnNumber: 13
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 183,
      columnNumber: 11
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/signup.tsx",
    lineNumber: 93,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/routes/signup.tsx",
    lineNumber: 92,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/signup.tsx",
    lineNumber: 91,
    columnNumber: 5
  }, this);
}

// app/routes/query.tsx
var query_exports = {};
__export(query_exports, {
  action: () => action9,
  default: () => QueryPage,
  loader: () => loader8
});
import { useState as useState9 } from "react";
import { format as format2 } from "sql-formatter";

// app/components/LoadingSpinner.tsx
import { jsxDEV as jsxDEV21 } from "react/jsx-dev-runtime";
var sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8"
};
function LoadingSpinner({ size = "md", className = "" }) {
  return /* @__PURE__ */ jsxDEV21("div", { role: "status", className, children: [
    /* @__PURE__ */ jsxDEV21(
      "svg",
      {
        className: `${sizeClasses[size]} animate-spin text-light-border dark:text-dark-border fill-primary-600`,
        viewBox: "0 0 100 101",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: [
          /* @__PURE__ */ jsxDEV21(
            "path",
            {
              d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",
              fill: "currentColor"
            },
            void 0,
            !1,
            {
              fileName: "app/components/LoadingSpinner.tsx",
              lineNumber: 21,
              columnNumber: 9
            },
            this
          ),
          /* @__PURE__ */ jsxDEV21(
            "path",
            {
              d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",
              fill: "currentFill"
            },
            void 0,
            !1,
            {
              fileName: "app/components/LoadingSpinner.tsx",
              lineNumber: 25,
              columnNumber: 9
            },
            this
          )
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/components/LoadingSpinner.tsx",
        lineNumber: 15,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV21("span", { className: "sr-only", children: "Loading..." }, void 0, !1, {
      fileName: "app/components/LoadingSpinner.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/LoadingSpinner.tsx",
    lineNumber: 14,
    columnNumber: 5
  }, this);
}

// app/components/Alert.tsx
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { jsxDEV as jsxDEV22 } from "react/jsx-dev-runtime";
var alertStyles = {
  error: {
    container: "bg-red-50 dark:bg-red-900/50",
    icon: "text-red-400 dark:text-red-300",
    title: "text-red-800 dark:text-red-200",
    message: "text-red-700 dark:text-red-300",
    Icon: XCircleIcon
  },
  success: {
    container: "bg-green-50 dark:bg-green-900/50",
    icon: "text-green-400 dark:text-green-300",
    title: "text-green-800 dark:text-green-200",
    message: "text-green-700 dark:text-green-300",
    Icon: CheckCircleIcon
  },
  warning: {
    container: "bg-yellow-50 dark:bg-yellow-900/50",
    icon: "text-yellow-400 dark:text-yellow-300",
    title: "text-yellow-800 dark:text-yellow-200",
    message: "text-yellow-700 dark:text-yellow-300",
    Icon: ExclamationTriangleIcon
  },
  info: {
    container: "bg-blue-50 dark:bg-blue-900/50",
    icon: "text-blue-400 dark:text-blue-300",
    title: "text-blue-800 dark:text-blue-200",
    message: "text-blue-700 dark:text-blue-300",
    Icon: InformationCircleIcon
  }
};
function Alert({ type, title, message, className = "" }) {
  let styles = alertStyles[type], Icon = styles.Icon;
  return /* @__PURE__ */ jsxDEV22("div", { className: `rounded-lg p-4 ${styles.container} ${className}`, children: /* @__PURE__ */ jsxDEV22("div", { className: "flex", children: [
    /* @__PURE__ */ jsxDEV22("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV22(Icon, { className: `h-5 w-5 ${styles.icon}`, "aria-hidden": "true" }, void 0, !1, {
      fileName: "app/components/Alert.tsx",
      lineNumber: 49,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/Alert.tsx",
      lineNumber: 48,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV22("div", { className: "ml-3", children: [
      /* @__PURE__ */ jsxDEV22("h3", { className: `text-sm font-medium ${styles.title}`, children: title }, void 0, !1, {
        fileName: "app/components/Alert.tsx",
        lineNumber: 52,
        columnNumber: 11
      }, this),
      message && /* @__PURE__ */ jsxDEV22("div", { className: `mt-2 text-sm ${styles.message}`, children: /* @__PURE__ */ jsxDEV22("p", { children: message }, void 0, !1, {
        fileName: "app/components/Alert.tsx",
        lineNumber: 55,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/components/Alert.tsx",
        lineNumber: 54,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Alert.tsx",
      lineNumber: 51,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Alert.tsx",
    lineNumber: 47,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/Alert.tsx",
    lineNumber: 46,
    columnNumber: 5
  }, this);
}

// app/routes/query.tsx
import { json as json13 } from "@remix-run/node";
import { useActionData as useActionData5, Form as Form9, useNavigation, useLoaderData as useLoaderData7 } from "@remix-run/react";

// app/lib/db/query-engine.server.ts
import { createId as createId5 } from "@paralleldrive/cuid2";
var DEFAULT_QUERY_TIMEOUT = 3e4, MAX_ROWS = 1e3, QueryEngine = class {
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }
  static getInstance() {
    return QueryEngine.instance || (QueryEngine.instance = new QueryEngine()), QueryEngine.instance;
  }
  async recordQuery(options, sql2, startTime, result) {
    let executionTime = Date.now() - startTime;
    await db.insert(queryHistory2).values({
      id: createId5(),
      connectionId: options.connectionId,
      userId: options.userId,
      query: sql2,
      status: result.success ? "success" : "error",
      error: result.error,
      executionTimeMs: executionTime.toString(),
      rowCount: result.rowCount?.toString()
    });
  }
  async executeQuery(sql2, options) {
    let startTime = Date.now(), client = await (await this.connectionManager.getConnection(options.connectionId)).connect();
    try {
      let timeout = options.timeout || DEFAULT_QUERY_TIMEOUT;
      await client.query(`SET statement_timeout = ${timeout}`);
      let maxRows = options.maxRows || MAX_ROWS, limitedSql = this.addRowLimit(sql2, maxRows), result = await client.query(limitedSql);
      return await this.recordQuery(options, sql2, startTime, {
        success: !0,
        rowCount: result.rowCount
      }), {
        rows: result.rows,
        fields: result.fields.map((field) => ({
          name: field.name,
          dataTypeID: field.dataTypeID
        }))
      };
    } catch (error) {
      throw await this.recordQuery(options, sql2, startTime, {
        success: !1,
        error: error instanceof Error ? error.message : "Unknown error"
      }), error;
    } finally {
      client.release();
    }
  }
  addRowLimit(sql2, limit) {
    let normalizedSql = sql2.trim().toLowerCase();
    return !normalizedSql.startsWith("select") || normalizedSql.includes("limit") ? sql2 : `${sql2} LIMIT ${limit}`;
  }
};

// app/components/SQLEditor.tsx
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";

// app/hooks/useTheme.ts
import { useEffect as useEffect4, useState as useState8 } from "react";
function useTheme2() {
  let [isDark, setIsDark] = useState8(!1);
  return useEffect4(() => {
    let darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(darkModeMediaQuery.matches);
    let listener = (e) => setIsDark(e.matches);
    return darkModeMediaQuery.addEventListener("change", listener), () => darkModeMediaQuery.removeEventListener("change", listener);
  }, []), { isDark };
}

// app/components/SQLEditor.tsx
import { EditorView } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { useCallback as useCallback3, useEffect as useEffect5, useRef, useMemo as useMemo2 } from "react";
import { basicSetup } from "codemirror";
import { linter, lintGutter } from "@codemirror/lint";
import { autocompletion } from "@codemirror/autocomplete";
import { jsxDEV as jsxDEV23 } from "react/jsx-dev-runtime";
var SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "TRUNCATE TABLE",
  "INDEX",
  "VIEW",
  "FUNCTION",
  "TRIGGER",
  "CONSTRAINT",
  "PRIMARY KEY",
  "FOREIGN KEY",
  "NOT NULL",
  "UNIQUE",
  "DEFAULT",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "DISTINCT",
  "AND",
  "OR",
  "IN",
  "NOT IN",
  "LIKE",
  "BETWEEN",
  "ASC",
  "DESC",
  "LIMIT",
  "OFFSET",
  "AS"
];
function getSQLCompletions(context, schema) {
  let triggerChar = context.matchBefore(/\w*$/), previousChar = context.state.doc.sliceString(Math.max(0, context.pos - 1), context.pos);
  if (!context.explicit && previousChar !== " " && previousChar !== "." || !triggerChar)
    return null;
  let lastWord = context.state.doc.sliceString(0, context.pos).split(/\s+/).pop()?.toUpperCase() || "", options = [];
  if (options.push(...SQL_KEYWORDS.map((keyword) => ({
    label: keyword,
    type: "keyword",
    boost: 0.5
  }))), schema) {
    ["FROM", "JOIN", "UPDATE", "INTO"].includes(lastWord) && options.push(...schema.map((table) => ({
      label: table.name,
      type: "type",
      boost: 2,
      info: `${table.columns.length} columns`
    })));
    let isAfterTable = schema.some((table) => lastWord === table.name.toUpperCase());
    (["SELECT", "WHERE", "BY", "ON"].includes(lastWord) || isAfterTable || previousChar === ".") && schema.forEach((table) => {
      table.columns.forEach((column) => {
        options.push({
          label: column.name,
          type: "property",
          boost: 3,
          info: `${table.name}.${column.name} (${column.type})`
        });
      });
    });
  }
  return {
    from: triggerChar.from,
    options,
    validFor: /^\w*$/
  };
}
function createSQLLinter() {
  return linter((view) => {
    let text5 = view.state.doc.toString();
    if (!text5.trim())
      return [];
    let diagnostics = [];
    text5.toLowerCase().match(/^(select|insert|update|delete|create|drop|alter|with)/) || diagnostics.push({
      from: 0,
      to: text5.length,
      severity: "warning",
      message: "Query should start with a valid SQL command"
    });
    let singleQuotes = (text5.match(/'/g) || []).length, doubleQuotes = (text5.match(/"/g) || []).length;
    return singleQuotes % 2 !== 0 && diagnostics.push({
      from: 0,
      to: text5.length,
      severity: "error",
      message: "Unmatched single quotes"
    }), doubleQuotes % 2 !== 0 && diagnostics.push({
      from: 0,
      to: text5.length,
      severity: "error",
      message: "Unmatched double quotes"
    }), diagnostics;
  }, {
    delay: 300
    // Reduced delay for more responsive feedback
  });
}
var lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent"
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none"
  },
  ".cm-content": {
    caretColor: "#000"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#000"
  },
  ".cm-placeholder": {
    color: "#999"
  }
});
function SQLEditor({
  value,
  onChange,
  placeholder = "Enter your SQL query here...",
  className = "",
  height = "200px",
  onError,
  schema
}) {
  let { isDark } = useTheme2(), editorRef = useRef(null), viewRef = useRef(), sqlLinter = useMemo2(() => createSQLLinter(), []), isInternalChange = useRef(!1), themeCompartment = useMemo2(() => new Compartment(), []), lintCompartment = useMemo2(() => new Compartment(), []), completionCompartment = useMemo2(() => new Compartment(), []), createEditor = useCallback3(() => {
    if (!editorRef.current)
      return;
    let baseExtensions = [
      basicSetup,
      sql(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          isInternalChange.current = !0;
          let newValue = update.state.doc.toString();
          onChange(newValue), setTimeout(() => {
            isInternalChange.current = !1;
          }, 0);
        }
      }),
      EditorView.theme({
        "&": {
          height
        }
      }),
      themeCompartment.of(isDark ? oneDark : lightTheme),
      lintCompartment.of([lintGutter(), sqlLinter])
    ];
    schema && baseExtensions.push(
      completionCompartment.of(
        autocompletion({
          override: [(context) => getSQLCompletions(context, schema)],
          closeOnBlur: !0,
          defaultKeymap: !0,
          maxRenderedOptions: 10,
          activateOnTyping: !1,
          icons: !1
        })
      )
    );
    let view = new EditorView({
      doc: value,
      extensions: baseExtensions,
      parent: editorRef.current
    });
    return viewRef.current = view, () => {
      view.destroy();
    };
  }, [onChange, height, isDark, schema, sqlLinter]);
  return useEffect5(() => {
    let view = viewRef.current;
    view && view.dispatch({
      effects: themeCompartment.reconfigure(isDark ? oneDark : lightTheme)
    });
  }, [isDark]), useEffect5(() => {
    let view = viewRef.current;
    if (!isInternalChange.current && view && view.state.doc.toString() !== value) {
      let transaction = view.state.update({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        },
        selection: view.state.selection
      });
      view.dispatch(transaction);
    }
  }, [value]), useEffect5(() => {
    if (editorRef.current)
      return createEditor();
  }, [createEditor]), /* @__PURE__ */ jsxDEV23(
    "div",
    {
      ref: editorRef,
      className: `overflow-hidden rounded-lg border border-light-border dark:border-dark-border ${className}`,
      style: { height }
    },
    void 0,
    !1,
    {
      fileName: "app/components/SQLEditor.tsx",
      lineNumber: 263,
      columnNumber: 5
    },
    this
  );
}

// app/routes/query.tsx
init_api_server();
import { Fragment as Fragment5, jsxDEV as jsxDEV24 } from "react/jsx-dev-runtime";
async function loader8() {
  let schema = await fetchSchema();
  return json13({ schema });
}
async function action9({ request }) {
  let formData = await request.formData(), query = formData.get("query"), connectionId = formData.get("connectionId");
  if (!query?.trim())
    return json13({ error: "Query is required" });
  if (!connectionId)
    return json13({ error: "Database connection is required" });
  try {
    let user2 = await requireUser(request), result = await QueryEngine.getInstance().executeQuery(query, {
      connectionId,
      userId: user2.id
    });
    return json13({ result });
  } catch (error) {
    return json13({
      error: error instanceof Error ? error.message : "An error occurred"
    });
  }
}
function QueryPage() {
  let [query, setQuery] = useState9(""), [isFormatting, setIsFormatting] = useState9(!1), [syntaxError, setSyntaxError] = useState9(null), actionData = useActionData5(), { schema } = useLoaderData7(), isExecuting = useNavigation().state === "submitting", handleFormat = async () => {
    if (query.trim()) {
      setIsFormatting(!0);
      try {
        let formatted = format2(query, { language: "postgresql" });
        setQuery(formatted);
      } catch (err) {
        console.error("Error formatting query:", err);
      } finally {
        setIsFormatting(!1);
      }
    }
  }, handleSyntaxError = (error) => {
    setSyntaxError(error);
  }, renderError = () => syntaxError ? /* @__PURE__ */ jsxDEV24(
    Alert,
    {
      type: "warning",
      title: "SQL Syntax Warning",
      message: syntaxError,
      className: "mb-4"
    },
    void 0,
    !1,
    {
      fileName: "app/routes/query.tsx",
      lineNumber: 87,
      columnNumber: 9
    },
    this
  ) : actionData?.error ? /* @__PURE__ */ jsxDEV24(
    Alert,
    {
      type: "error",
      title: "Query Error",
      message: actionData.error,
      className: "mb-4"
    },
    void 0,
    !1,
    {
      fileName: "app/routes/query.tsx",
      lineNumber: 98,
      columnNumber: 9
    },
    this
  ) : null, renderResults = () => isExecuting ? /* @__PURE__ */ jsxDEV24("div", { className: "flex flex-col items-center justify-center p-12 space-y-4", children: [
    /* @__PURE__ */ jsxDEV24(LoadingSpinner, { size: "lg" }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 114,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV24("p", { className: "text-light-text-secondary dark:text-dark-text-secondary", children: "Executing query..." }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 115,
      columnNumber: 11
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/query.tsx",
    lineNumber: 113,
    columnNumber: 9
  }, this) : actionData?.result ? actionData.result.rows.length === 0 ? /* @__PURE__ */ jsxDEV24(
    Alert,
    {
      type: "info",
      title: "Query Executed Successfully",
      message: "Your query returned no results.",
      className: "mb-4"
    },
    void 0,
    !1,
    {
      fileName: "app/routes/query.tsx",
      lineNumber: 134,
      columnNumber: 9
    },
    this
  ) : /* @__PURE__ */ jsxDEV24("div", { children: [
    /* @__PURE__ */ jsxDEV24("h2", { className: "text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary", children: "Results" }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 145,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV24("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV24("table", { className: "w-full divide-y divide-light-border dark:divide-dark-border", children: [
      /* @__PURE__ */ jsxDEV24("thead", { className: "bg-light-bg-secondary dark:bg-dark-bg-tertiary", children: /* @__PURE__ */ jsxDEV24("tr", { children: actionData.result.fields?.map((field) => /* @__PURE__ */ jsxDEV24(
        "th",
        {
          className: "px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider",
          children: field.name
        },
        field.name,
        !1,
        {
          fileName: "app/routes/query.tsx",
          lineNumber: 151,
          columnNumber: 19
        },
        this
      )) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 149,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 148,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV24("tbody", { className: "bg-light-bg-primary dark:bg-dark-bg-secondary divide-y divide-light-border dark:divide-dark-border", children: actionData.result.rows?.map((row, rowIndex) => /* @__PURE__ */ jsxDEV24("tr", { className: "hover:bg-light-bg-secondary dark:hover:bg-dark-bg-tertiary", children: Object.values(row).map((value, colIndex) => /* @__PURE__ */ jsxDEV24(
        "td",
        {
          className: "px-6 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary",
          children: value === null ? "NULL" : String(value)
        },
        colIndex,
        !1,
        {
          fileName: "app/routes/query.tsx",
          lineNumber: 164,
          columnNumber: 21
        },
        this
      )) }, rowIndex, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 162,
        columnNumber: 17
      }, this)) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 160,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/query.tsx",
      lineNumber: 147,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 146,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/query.tsx",
    lineNumber: 144,
    columnNumber: 7
  }, this) : /* @__PURE__ */ jsxDEV24(
    EmptyState,
    {
      type: "query",
      title: "No Query Results",
      message: "Write and execute a SQL query to see the results here."
    },
    void 0,
    !1,
    {
      fileName: "app/routes/query.tsx",
      lineNumber: 124,
      columnNumber: 9
    },
    this
  );
  return /* @__PURE__ */ jsxDEV24(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV24("div", { className: "flex-none px-4 py-3", children: /* @__PURE__ */ jsxDEV24("h1", { className: "text-xl font-semibold text-light-text-primary dark:text-dark-text-primary", children: "SQL Query" }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 183,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 182,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV24("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxDEV24("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxDEV24("div", { children: [
        /* @__PURE__ */ jsxDEV24("div", { className: "flex justify-between mb-2", children: [
          /* @__PURE__ */ jsxDEV24("label", { htmlFor: "query", className: "block text-sm font-medium text-light-text-primary dark:text-dark-text-primary", children: "SQL Query" }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 190,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV24(
            "button",
            {
              onClick: handleFormat,
              type: "button",
              disabled: isFormatting || !query.trim(),
              className: "text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2",
              children: isFormatting ? /* @__PURE__ */ jsxDEV24(Fragment5, { children: [
                /* @__PURE__ */ jsxDEV24(LoadingSpinner, { size: "sm" }, void 0, !1, {
                  fileName: "app/routes/query.tsx",
                  lineNumber: 201,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV24("span", { children: "Formatting..." }, void 0, !1, {
                  fileName: "app/routes/query.tsx",
                  lineNumber: 202,
                  columnNumber: 21
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/query.tsx",
                lineNumber: 200,
                columnNumber: 19
              }, this) : /* @__PURE__ */ jsxDEV24("span", { children: "Format Query" }, void 0, !1, {
                fileName: "app/routes/query.tsx",
                lineNumber: 205,
                columnNumber: 19
              }, this)
            },
            void 0,
            !1,
            {
              fileName: "app/routes/query.tsx",
              lineNumber: 193,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/query.tsx",
          lineNumber: 189,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV24(Form9, { method: "post", children: [
          /* @__PURE__ */ jsxDEV24("input", { type: "hidden", name: "query", value: query }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 210,
            columnNumber: 15
          }, this),
          renderError(),
          /* @__PURE__ */ jsxDEV24(
            SQLEditor,
            {
              value: query,
              onChange: setQuery,
              onError: handleSyntaxError,
              className: "mb-4",
              schema
            },
            void 0,
            !1,
            {
              fileName: "app/routes/query.tsx",
              lineNumber: 212,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV24("div", { className: "mt-4", children: /* @__PURE__ */ jsxDEV24(
            "button",
            {
              type: "submit",
              disabled: isExecuting || !query.trim(),
              className: "w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2",
              children: isExecuting ? /* @__PURE__ */ jsxDEV24(Fragment5, { children: [
                /* @__PURE__ */ jsxDEV24(LoadingSpinner, { size: "sm", className: "text-white" }, void 0, !1, {
                  fileName: "app/routes/query.tsx",
                  lineNumber: 227,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV24("span", { children: "Executing..." }, void 0, !1, {
                  fileName: "app/routes/query.tsx",
                  lineNumber: 228,
                  columnNumber: 23
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/query.tsx",
                lineNumber: 226,
                columnNumber: 21
              }, this) : /* @__PURE__ */ jsxDEV24("span", { children: "Execute Query" }, void 0, !1, {
                fileName: "app/routes/query.tsx",
                lineNumber: 231,
                columnNumber: 21
              }, this)
            },
            void 0,
            !1,
            {
              fileName: "app/routes/query.tsx",
              lineNumber: 220,
              columnNumber: 17
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 219,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/query.tsx",
          lineNumber: 209,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/query.tsx",
        lineNumber: 188,
        columnNumber: 11
      }, this),
      renderResults()
    ] }, void 0, !0, {
      fileName: "app/routes/query.tsx",
      lineNumber: 187,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 186,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/query.tsx",
    lineNumber: 181,
    columnNumber: 5
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-XCGZKRYB.js", imports: ["/build/_shared/chunk-3VPVJWTU.js", "/build/_shared/chunk-5VEUQK5Q.js", "/build/_shared/chunk-HRUNE67B.js", "/build/_shared/chunk-RTBKPWXJ.js", "/build/_shared/chunk-NO3FWBWP.js", "/build/_shared/chunk-ULL77KT2.js", "/build/_shared/chunk-R3YRPWCC.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-K4PZM6Z7.js", imports: ["/build/_shared/chunk-H4RZZSLZ.js", "/build/_shared/chunk-TF3XO5XL.js", "/build/_shared/chunk-DTYA7WJF.js", "/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/$tableName": { id: "routes/$tableName", parentId: "root", path: ":tableName", index: void 0, caseSensitive: void 0, module: "/build/routes/$tableName-ZB2ZYHG2.js", imports: ["/build/_shared/chunk-M4VBACUD.js", "/build/_shared/chunk-7YKZMUHK.js", "/build/_shared/chunk-N3ZAQ5C4.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_auth.login": { id: "routes/_auth.login", parentId: "root", path: "login", index: void 0, caseSensitive: void 0, module: "/build/routes/_auth.login-R5LL4QM3.js", imports: ["/build/_shared/chunk-WDRDG2CH.js"], hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_auth.register": { id: "routes/_auth.register", parentId: "root", path: "register", index: void 0, caseSensitive: void 0, module: "/build/routes/_auth.register-MN2XCUG2.js", imports: ["/build/_shared/chunk-WDRDG2CH.js"], hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-T3K46C2C.js", imports: ["/build/_shared/chunk-M4VBACUD.js", "/build/_shared/chunk-WUUQRNG3.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.connections": { id: "routes/api.connections", parentId: "root", path: "api/connections", index: void 0, caseSensitive: void 0, module: "/build/routes/api.connections-IWLM5RZK.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.query": { id: "routes/api.query", parentId: "root", path: "api/query", index: void 0, caseSensitive: void 0, module: "/build/routes/api.query-GDVT4CH7.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/organizations": { id: "routes/organizations", parentId: "root", path: "organizations", index: void 0, caseSensitive: void 0, module: "/build/routes/organizations-H3G4G7KK.js", imports: ["/build/_shared/chunk-3HRUN5TH.js", "/build/_shared/chunk-YMKNCCHG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/organizations.$id": { id: "routes/organizations.$id", parentId: "routes/organizations", path: ":id", index: void 0, caseSensitive: void 0, module: "/build/routes/organizations.$id-NOB7WQKR.js", imports: ["/build/_shared/chunk-3XRQ6YKL.js", "/build/_shared/chunk-G7CHZRZX.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/organizations.$orgId.connections": { id: "routes/organizations.$orgId.connections", parentId: "routes/organizations", path: ":orgId/connections", index: void 0, caseSensitive: void 0, module: "/build/routes/organizations.$orgId.connections-BUD5XPKS.js", imports: ["/build/_shared/chunk-DTYA7WJF.js", "/build/_shared/chunk-3XRQ6YKL.js", "/build/_shared/chunk-G7CHZRZX.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/organizations.new": { id: "routes/organizations.new", parentId: "routes/organizations", path: "new", index: void 0, caseSensitive: void 0, module: "/build/routes/organizations.new-VB435NX4.js", imports: ["/build/_shared/chunk-3XRQ6YKL.js", "/build/_shared/chunk-G7CHZRZX.js"], hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/query": { id: "routes/query", parentId: "root", path: "query", index: void 0, caseSensitive: void 0, module: "/build/routes/query-RLYJPMHJ.js", imports: ["/build/_shared/chunk-7YKZMUHK.js", "/build/_shared/chunk-N3ZAQ5C4.js", "/build/_shared/chunk-WUUQRNG3.js", "/build/_shared/chunk-YMKNCCHG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/signup": { id: "routes/signup", parentId: "root", path: "signup", index: void 0, caseSensitive: void 0, module: "/build/routes/signup-2CYNTFIA.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "843e0588", hmr: { runtime: "/build/_shared/chunk-HRUNE67B.js", timestamp: 1732999746813 }, url: "/build/manifest-843E0588.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/organizations.$orgId.connections": {
    id: "routes/organizations.$orgId.connections",
    parentId: "routes/organizations",
    path: ":orgId/connections",
    index: void 0,
    caseSensitive: void 0,
    module: organizations_orgId_connections_exports
  },
  "routes/organizations.$id": {
    id: "routes/organizations.$id",
    parentId: "routes/organizations",
    path: ":id",
    index: void 0,
    caseSensitive: void 0,
    module: organizations_id_exports
  },
  "routes/organizations.new": {
    id: "routes/organizations.new",
    parentId: "routes/organizations",
    path: "new",
    index: void 0,
    caseSensitive: void 0,
    module: organizations_new_exports
  },
  "routes/api.connections": {
    id: "routes/api.connections",
    parentId: "root",
    path: "api/connections",
    index: void 0,
    caseSensitive: void 0,
    module: api_connections_exports
  },
  "routes/_auth.register": {
    id: "routes/_auth.register",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: auth_register_exports
  },
  "routes/organizations": {
    id: "routes/organizations",
    parentId: "root",
    path: "organizations",
    index: void 0,
    caseSensitive: void 0,
    module: organizations_exports
  },
  "routes/_auth.login": {
    id: "routes/_auth.login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: auth_login_exports
  },
  "routes/$tableName": {
    id: "routes/$tableName",
    parentId: "root",
    path: ":tableName",
    index: void 0,
    caseSensitive: void 0,
    module: tableName_exports
  },
  "routes/api.query": {
    id: "routes/api.query",
    parentId: "root",
    path: "api/query",
    index: void 0,
    caseSensitive: void 0,
    module: api_query_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: signup_exports
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
