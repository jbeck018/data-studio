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
var tailwind_default = "/build/_assets/tailwind-JKZIOKG4.css";

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
  default: () => TablePage,
  loader: () => loader
});
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams as useSearchParams2 } from "@remix-run/react";

// app/components/TabView.tsx
import { startCase } from "lodash-es";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
function TabView({ tabs, activeTab, onTabChange }) {
  return /* @__PURE__ */ jsxDEV5("div", { className: "flex flex-col bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxDEV5("div", { className: "flex border-b border-gray-200 dark:border-gray-700", children: tabs.map((tab) => {
    let isActive = activeTab === tab.id;
    return /* @__PURE__ */ jsxDEV5(
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
        lineNumber: 37,
        columnNumber: 13
      },
      this
    );
  }) }, void 0, !1, {
    fileName: "app/components/TabView.tsx",
    lineNumber: 33,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/TabView.tsx",
    lineNumber: 32,
    columnNumber: 5
  }, this);
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

// app/utils/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// app/hooks/useClient.ts
import { useState as useState2, useEffect as useEffect2 } from "react";
function useClient() {
  let [isClient, setIsClient] = useState2(!1);
  return useEffect2(() => {
    setIsClient(!0);
  }, []), isClient;
}

// app/components/DataView.tsx
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
  let isClient = useClient(), [searchParams, setSearchParams] = useSearchParams(), editingCell = searchParams.get("editCell")?.split(",").map(Number), editedValue = searchParams.get("editValue"), handleStartEditing = (rowIndex, columnId) => {
    !isClient || !isEditable || setSearchParams((prev) => (prev.set("editCell", `${rowIndex},${columnId}`), prev.set("editValue", formatCellValue(rows[rowIndex][columnId])), prev), { replace: !0 });
  }, handleFinishEditing = (rowIndex, columnId) => {
    isClient && (onEdit && editedValue !== null && onEdit(rowIndex, {
      ...rows[rowIndex],
      [columnId]: editedValue
    }), setSearchParams((prev) => (prev.delete("editCell"), prev.delete("editValue"), prev), { replace: !0 }));
  }, columnHelper = createColumnHelper(), tableColumns = useMemo(() => [
    ...columns.map(
      (col) => columnHelper.accessor(col.name, {
        header: () => /* @__PURE__ */ jsxDEV6("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsxDEV6("span", { children: startCase2(col.name) }, void 0, !1, {
            fileName: "app/components/DataView.tsx",
            lineNumber: 81,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV6("span", { className: "text-xs text-gray-500", children: [
            "(",
            col.type,
            ")"
          ] }, void 0, !0, {
            fileName: "app/components/DataView.tsx",
            lineNumber: 82,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/DataView.tsx",
          lineNumber: 80,
          columnNumber: 11
        }, this),
        cell: ({ row, column, getValue }) => {
          let value = getValue();
          return isClient && isEditable && editingCell?.[0] === row.index && String(column.id) === String(editingCell?.[1]) ? /* @__PURE__ */ jsxDEV6(
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
              lineNumber: 93,
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
                isClient && (isEditable && handleStartEditing(row.index, column.id), onRowSelect && onRowSelect(selectedRow === row.index ? null : row.index));
              },
              style: { maxWidth: "300px" },
              children: formatCellValue(value)
            },
            void 0,
            !1,
            {
              fileName: "app/components/DataView.tsx",
              lineNumber: 109,
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
        cell: ({ row }) => /* @__PURE__ */ jsxDEV6(
          "button",
          {
            onClick: () => isClient && onDelete(row.index),
            className: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
            children: "Delete"
          },
          void 0,
          !1,
          {
            fileName: "app/components/DataView.tsx",
            lineNumber: 139,
            columnNumber: 15
          },
          this
        )
      })
    ] : []
  ], [columns, isEditable, onDelete, selectedRow, editingCell, editedValue, formatCellValue, isClient]), table = useReactTable({
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
  return /* @__PURE__ */ jsxDEV6("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ jsxDEV6("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsxDEV6("div", { className: "absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxDEV6("div", { className: "h-full overflow-auto", children: /* @__PURE__ */ jsxDEV6("table", { className: "w-full divide-y divide-gray-200 dark:divide-gray-700", style: { width: table.getTotalSize() }, children: [
    /* @__PURE__ */ jsxDEV6("thead", { className: "sticky top-0 bg-white dark:bg-gray-900 shadow-sm z-10", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxDEV6("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxDEV6(
      "th",
      {
        className: "group relative px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap select-none bg-white dark:bg-gray-900",
        onClick: header.column.getToggleSortingHandler(),
        style: {
          width: header.getSize(),
          position: "relative"
        },
        children: /* @__PURE__ */ jsxDEV6("div", { className: "flex items-center justify-center", children: [
          flexRender(
            header.column.columnDef.header,
            header.getContext()
          ),
          /* @__PURE__ */ jsxDEV6("span", { className: "ml-1", children: [
            header.column.getIsSorted() === "asc" ? "\u2191" : "",
            header.column.getIsSorted() === "desc" ? "\u2193" : ""
          ] }, void 0, !0, {
            fileName: "app/components/DataView.tsx",
            lineNumber: 193,
            columnNumber: 27
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/DataView.tsx",
          lineNumber: 188,
          columnNumber: 25
        }, this)
      },
      header.id,
      !1,
      {
        fileName: "app/components/DataView.tsx",
        lineNumber: 179,
        columnNumber: 23
      },
      this
    )) }, headerGroup.id, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 177,
      columnNumber: 19
    }, this)) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 175,
      columnNumber: 15
    }, this),
    /* @__PURE__ */ jsxDEV6("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsxDEV6("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-800", children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsxDEV6(
      "td",
      {
        className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
        children: flexRender(cell.column.columnDef.cell, cell.getContext())
      },
      cell.id,
      !1,
      {
        fileName: "app/components/DataView.tsx",
        lineNumber: 207,
        columnNumber: 23
      },
      this
    )) }, row.id, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 205,
      columnNumber: 19
    }, this)) }, void 0, !1, {
      fileName: "app/components/DataView.tsx",
      lineNumber: 203,
      columnNumber: 15
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 174,
    columnNumber: 13
  }, this) }, void 0, !1, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 173,
    columnNumber: 11
  }, this) }, void 0, !1, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 172,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 171,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/components/DataView.tsx",
    lineNumber: 170,
    columnNumber: 5
  }, this);
}

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

// app/routes/$tableName.tsx
import { useCallback } from "react";
import { startCase as startCase3 } from "lodash-es";
import { jsxDEV as jsxDEV7 } from "react/jsx-dev-runtime";
async function loader({ params, request }) {
  let tableName = params.tableName;
  if (!tableName)
    throw new Error("Table name is required");
  let url = new URL(request.url), sortBy = url.searchParams.get("sortBy") || void 0, sortOrder = url.searchParams.get("sortOrder"), data = await fetchTableData(tableName, sortBy, sortOrder);
  return json({ tableName, data });
}
function TablePage() {
  let { tableName, data } = useLoaderData(), [searchParams, setSearchParams] = useSearchParams2(), isClient = useClient(), activeTab = searchParams.get("tab") || "data", sortBy = searchParams.get("sortBy") || void 0, sortOrder = searchParams.get("sortOrder") || void 0, columns = Object.keys(data.data[0] || {}).map((name) => ({
    name,
    type: typeof data.data[0]?.[name]
  })), handleTabChange = useCallback((tabId) => {
    setSearchParams((prev) => (prev.set("tab", tabId), prev), { replace: !0 });
  }, [setSearchParams]), handleSort = useCallback((column) => {
    setSearchParams((prev) => {
      let currentSortBy = prev.get("sortBy"), currentSortOrder = prev.get("sortOrder");
      return currentSortBy === column ? currentSortOrder === "asc" ? prev.set("sortOrder", "desc") : currentSortOrder === "desc" && (prev.delete("sortBy"), prev.delete("sortOrder")) : (prev.set("sortBy", column), prev.set("sortOrder", "asc")), prev;
    }, { replace: !0 });
  }, [setSearchParams]), formatCellValue = useCallback((value) => value === null ? "NULL" : value === void 0 ? "" : typeof value == "object" ? JSON.stringify(value) : String(value), []), handleEdit = useCallback((rowIndex, newData) => {
    console.log("Edit row", rowIndex, newData);
  }, []), handleDelete = useCallback((rowIndex) => {
    console.log("Delete row", rowIndex);
  }, []), handleRowSelect = useCallback((rowIndex) => {
    setSearchParams((prev) => (rowIndex === null ? prev.delete("selectedRow") : prev.set("selectedRow", String(rowIndex)), prev), { replace: !0 });
  }, [setSearchParams]), selectedRow = searchParams.has("selectedRow") ? Number(searchParams.get("selectedRow")) : void 0, tabs = [
    { id: "data", label: "Data" },
    { id: "schema", label: "Schema" },
    { id: "sql", label: "SQL" }
  ];
  return /* @__PURE__ */ jsxDEV7("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxDEV7("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV7("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-gray-100", children: startCase3(tableName) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 105,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 104,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV7(
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
        lineNumber: 110,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV7("div", { className: "flex-1 min-h-0 p-6", children: [
      activeTab === "data" && /* @__PURE__ */ jsxDEV7(
        DataView,
        {
          columns,
          rows: data.data,
          sortBy,
          sortOrder,
          onSort: handleSort,
          formatCellValue,
          onEdit: handleEdit,
          onDelete: handleDelete,
          isEditable: isClient,
          selectedRow,
          onRowSelect: handleRowSelect
        },
        void 0,
        !1,
        {
          fileName: "app/routes/$tableName.tsx",
          lineNumber: 118,
          columnNumber: 11
        },
        this
      ),
      activeTab === "schema" && /* @__PURE__ */ jsxDEV7("pre", { className: "whitespace-pre-wrap font-mono text-sm", children: JSON.stringify(columns, null, 2) }, void 0, !1, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 133,
        columnNumber: 11
      }, this),
      activeTab === "sql" && /* @__PURE__ */ jsxDEV7("pre", { className: "whitespace-pre-wrap font-mono text-sm", children: `SELECT * FROM ${tableName};` }, void 0, !1, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 138,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 116,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 103,
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
import { useState as useState3 } from "react";

// app/components/TableList.tsx
import { Link as Link2 } from "@remix-run/react";
import { startCase as startCase4 } from "lodash-es";
import { jsxDEV as jsxDEV8 } from "react/jsx-dev-runtime";
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
  return /* @__PURE__ */ jsxDEV8("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: tables.map((table) => /* @__PURE__ */ jsxDEV8(
    Link2,
    {
      to: `/${table.name}`,
      className: "group block w-full p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl",
      children: [
        /* @__PURE__ */ jsxDEV8("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxDEV8("h5", { className: "text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate max-w-[80%]", children: prettyPrintName(table.name) }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 41,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV8("span", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400", children: /* @__PURE__ */ jsxDEV8("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV8("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }, void 0, !1, {
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
        /* @__PURE__ */ jsxDEV8("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV8("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxDEV8("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV8("span", { className: "font-bold", children: table.columns.length }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 53,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV8("span", { className: "italic text-gray-500 dark:text-gray-400", children: "columns" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 54,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 52,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV8("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 56,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV8("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV8("span", { className: "font-bold", children: formatNumber(table.rowCount) }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 58,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV8("span", { className: "italic text-gray-500 dark:text-gray-400", children: "rows" }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 59,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 57,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV8("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 61,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV8("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxDEV8("span", { className: "font-bold", children: formatBytes(table.sizeInBytes) }, void 0, !1, {
                fileName: "app/components/TableList.tsx",
                lineNumber: 63,
                columnNumber: 17
              }, this),
              " ",
              /* @__PURE__ */ jsxDEV8("span", { className: "italic text-gray-500 dark:text-gray-400", children: "size" }, void 0, !1, {
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
          Array.isArray(table.primaryKey) && table.primaryKey.length > 0 && /* @__PURE__ */ jsxDEV8("p", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: [
            /* @__PURE__ */ jsxDEV8("span", { className: "font-normal text-gray-500 dark:text-gray-400", children: "Primary Key:" }, void 0, !1, {
              fileName: "app/components/TableList.tsx",
              lineNumber: 69,
              columnNumber: 17
            }, this),
            " ",
            /* @__PURE__ */ jsxDEV8("span", { className: "font-mono text-purple-600 dark:text-purple-400", children: table.primaryKey.map(prettyPrintName).join(", ") }, void 0, !1, {
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
        /* @__PURE__ */ jsxDEV8("div", { className: "mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400", children: [
          /* @__PURE__ */ jsxDEV8("span", { children: "View table" }, void 0, !1, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 77,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV8("svg", { className: "flex-shrink-0 w-4 h-4 ml-1 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV8("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }, void 0, !1, {
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
import { jsxDEV as jsxDEV9 } from "react/jsx-dev-runtime";
function PageContainer({ children }) {
  return /* @__PURE__ */ jsxDEV9("div", { className: "h-screen p-4 bg-gray-100 dark:bg-gray-950", children: /* @__PURE__ */ jsxDEV9("div", { className: "h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden flex flex-col", children }, void 0, !1, {
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
import { jsxDEV as jsxDEV10 } from "react/jsx-dev-runtime";
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
  let { tables } = useLoaderData2(), [searchTerm, setSearchTerm] = useState3(""), filteredTables = tables.filter(
    (table) => table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return /* @__PURE__ */ jsxDEV10(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV10("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV10("div", { className: "relative", children: [
      /* @__PURE__ */ jsxDEV10(
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
      /* @__PURE__ */ jsxDEV10("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxDEV10("svg", { className: "h-5 w-5 text-gray-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxDEV10("path", { fillRule: "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule: "evenodd" }, void 0, !1, {
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
    /* @__PURE__ */ jsxDEV10("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxDEV10(TableList, { tables: filteredTables }, void 0, !1, {
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
import { useState as useState4 } from "react";
import { format as format2 } from "sql-formatter";
import { jsxDEV as jsxDEV11 } from "react/jsx-dev-runtime";
function QueryPage() {
  let [query, setQuery] = useState4(""), [results, setResults] = useState4(null), [error, setError] = useState4(null), [isLoading, setIsLoading] = useState4(!1);
  return /* @__PURE__ */ jsxDEV11(PageContainer, { children: [
    /* @__PURE__ */ jsxDEV11("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV11("h1", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "SQL Query" }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV11("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxDEV11("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxDEV11("div", { children: [
        /* @__PURE__ */ jsxDEV11("div", { className: "flex justify-between mb-2", children: [
          /* @__PURE__ */ jsxDEV11("label", { htmlFor: "query", className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "SQL Query" }, void 0, !1, {
            fileName: "app/routes/query.tsx",
            lineNumber: 45,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV11(
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
        /* @__PURE__ */ jsxDEV11(
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
      /* @__PURE__ */ jsxDEV11("div", { children: /* @__PURE__ */ jsxDEV11(
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
      error && /* @__PURE__ */ jsxDEV11("div", { className: "p-4 bg-red-50 dark:bg-red-900/50 rounded-lg", children: /* @__PURE__ */ jsxDEV11("p", { className: "text-sm text-red-700 dark:text-red-300", children: error }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 77,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 76,
        columnNumber: 13
      }, this),
      results && /* @__PURE__ */ jsxDEV11("div", { children: [
        /* @__PURE__ */ jsxDEV11("h2", { className: "text-xl font-semibold mb-4", children: "Results" }, void 0, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 83,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV11("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV11("table", { className: "w-full divide-y divide-gray-300 dark:divide-gray-700", children: [
          /* @__PURE__ */ jsxDEV11("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxDEV11("tr", { children: results.fields?.map((field) => /* @__PURE__ */ jsxDEV11(
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
          /* @__PURE__ */ jsxDEV11("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: results.rows?.map((row, rowIndex) => /* @__PURE__ */ jsxDEV11("tr", { children: Object.values(row).map((value, colIndex) => /* @__PURE__ */ jsxDEV11(
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
var assets_manifest_default = { entry: { module: "/build/entry.client-F52VPBZ7.js", imports: ["/build/_shared/chunk-3VPVJWTU.js", "/build/_shared/chunk-HDRCTI32.js", "/build/_shared/chunk-RTBKPWXJ.js", "/build/_shared/chunk-NO3FWBWP.js", "/build/_shared/chunk-ULL77KT2.js", "/build/_shared/chunk-UG3ISROB.js", "/build/_shared/chunk-R3YRPWCC.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-3VTWYCAD.js", imports: ["/build/_shared/chunk-56WY5XKF.js", "/build/_shared/chunk-2ITZUYVB.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/$tableName": { id: "routes/$tableName", parentId: "root", path: ":tableName", index: void 0, caseSensitive: void 0, module: "/build/routes/$tableName-S2KUSMX4.js", imports: ["/build/_shared/chunk-FRNKA3J3.js", "/build/_shared/chunk-W3H43JBD.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-OREX2632.js", imports: ["/build/_shared/chunk-FRNKA3J3.js", "/build/_shared/chunk-HZ3UXEUT.js", "/build/_shared/chunk-W3H43JBD.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/query": { id: "routes/query", parentId: "root", path: "query", index: void 0, caseSensitive: void 0, module: "/build/routes/query-QJSQYMXK.js", imports: ["/build/_shared/chunk-HZ3UXEUT.js", "/build/_shared/chunk-W3H43JBD.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "6d40be42", hmr: { runtime: "/build/_shared/chunk-UG3ISROB.js", timestamp: 1732655250359 }, url: "/build/manifest-6D40BE42.js" };

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
