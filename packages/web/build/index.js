var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
));

// empty-module:~/utils/ws.client
var require_ws = __commonJS({
  "empty-module:~/utils/ws.client"(exports, module) {
    module.exports = {};
  }
});

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
var tailwind_default = "/build/_assets/tailwind-VQNGIPJJ.css";

// app/root.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { jsxDEV as jsxDEV2 } from "react/jsx-dev-runtime";
var links = () => [
  { rel: "stylesheet", href: tailwind_default }
], queryClient = new QueryClient();
function App() {
  return /* @__PURE__ */ jsxDEV2("html", { lang: "en", children: [
    /* @__PURE__ */ jsxDEV2("head", { children: [
      /* @__PURE__ */ jsxDEV2("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 24,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 25,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 26,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV2("body", { className: "bg-gray-50", children: /* @__PURE__ */ jsxDEV2(QueryClientProvider, { client: queryClient, children: [
      /* @__PURE__ */ jsxDEV2(Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 31,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV2(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 32,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV2(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 33,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV2(LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 34,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV2(ReactQueryDevtools, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 35,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 30,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}

// app/routes/$tableName.tsx
var tableName_exports = {};
__export(tableName_exports, {
  default: () => TableRoute,
  loader: () => loader
});
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect, useState as useState2 } from "react";

// app/components/EditableTable.tsx
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useState } from "react";
import { jsxDEV as jsxDEV3 } from "react/jsx-dev-runtime";
function EditableTable({
  schema,
  data,
  onSave,
  onDelete,
  onAdd
}) {
  let [editingCell, setEditingCell] = useState(null), [editedData, setEditedData] = useState({}), columnHelper = createColumnHelper(), columns = [
    ...schema.columns.map(
      (col) => columnHelper.accessor(col.name, {
        header: () => /* @__PURE__ */ jsxDEV3("div", { className: "font-medium text-gray-900", children: [
          col.name,
          /* @__PURE__ */ jsxDEV3("span", { className: "ml-2 text-xs text-gray-500", children: [
            "(",
            col.type,
            ")"
          ] }, void 0, !0, {
            fileName: "app/components/EditableTable.tsx",
            lineNumber: 40,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/EditableTable.tsx",
          lineNumber: 38,
          columnNumber: 11
        }, this),
        cell: ({ row, column, getValue }) => {
          let isEditing = editingCell?.rowIndex === row.index && editingCell?.columnId === column.id, value = getValue();
          return isEditing ? /* @__PURE__ */ jsxDEV3(
            "input",
            {
              className: "w-full px-2 py-1 border rounded",
              value: editedData[column.id] ?? value,
              onChange: (e) => setEditedData({
                ...editedData,
                [column.id]: e.target.value
              }),
              onBlur: () => {
                onSave(row.index, {
                  ...row.original,
                  [column.id]: editedData[column.id]
                }), setEditingCell(null), setEditedData({});
              },
              autoFocus: !0
            },
            void 0,
            !1,
            {
              fileName: "app/components/EditableTable.tsx",
              lineNumber: 51,
              columnNumber: 15
            },
            this
          ) : /* @__PURE__ */ jsxDEV3(
            "div",
            {
              className: "px-2 py-1 cursor-pointer hover:bg-gray-50",
              onClick: () => {
                setEditingCell({ rowIndex: row.index, columnId: column.id }), setEditedData({ [column.id]: value });
              },
              children: value
            },
            void 0,
            !1,
            {
              fileName: "app/components/EditableTable.tsx",
              lineNumber: 74,
              columnNumber: 13
            },
            this
          );
        }
      })
    ),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => /* @__PURE__ */ jsxDEV3("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxDEV3(
        "button",
        {
          onClick: () => onDelete(row.index),
          className: "text-red-600 hover:text-red-800",
          children: "Delete"
        },
        void 0,
        !1,
        {
          fileName: "app/components/EditableTable.tsx",
          lineNumber: 92,
          columnNumber: 11
        },
        this
      ) }, void 0, !1, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 91,
        columnNumber: 9
      }, this)
    })
  ], table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  return /* @__PURE__ */ jsxDEV3("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ jsxDEV3("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsxDEV3("thead", { className: "bg-gray-50", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxDEV3("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxDEV3(
        "th",
        {
          className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
          children: flexRender(
            header.column.columnDef.header,
            header.getContext()
          )
        },
        header.id,
        !1,
        {
          fileName: "app/components/EditableTable.tsx",
          lineNumber: 116,
          columnNumber: 17
        },
        this
      )) }, headerGroup.id, !1, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 114,
        columnNumber: 13
      }, this)) }, void 0, !1, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 112,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV3("tbody", { className: "bg-white divide-y divide-gray-200", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsxDEV3("tr", { children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsxDEV3("td", { className: "px-6 py-4 whitespace-nowrap", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id, !1, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 133,
        columnNumber: 17
      }, this)) }, row.id, !1, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 131,
        columnNumber: 13
      }, this)) }, void 0, !1, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 129,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV3("div", { className: "mt-4", children: /* @__PURE__ */ jsxDEV3(
      "button",
      {
        onClick: () => {
          let newRow = schema.columns.reduce(
            (acc, col) => ({ ...acc, [col.name]: "" }),
            {}
          );
          onAdd(newRow);
        },
        className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        children: "Add Row"
      },
      void 0,
      !1,
      {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 142,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 141,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/EditableTable.tsx",
    lineNumber: 110,
    columnNumber: 5
  }, this);
}

// app/routes/$tableName.tsx
var import_ws = __toESM(require_ws(), 1);
import { jsxDEV as jsxDEV4 } from "react/jsx-dev-runtime";
async function loader({ params }) {
  let tableName = params.tableName;
  if (!tableName)
    throw new Error("Table name is required");
  return json({ tableName });
}
function TableRoute() {
  let { tableName } = useLoaderData(), [schema, setSchema] = useState2(null), [data, setData] = useState2([]), revalidator = useRevalidator();
  useEffect(() => {
    let ws = (0, import_ws.getWebSocketClient)();
    (async () => {
      try {
        let [schemaData, tableData] = await Promise.all([
          ws.getTableSchema(tableName),
          ws.queryTable(tableName)
        ]), columns = schemaData.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === "YES",
          default: col.column_default ?? void 0
        })), primaryKeyCol = schemaData.find(
          (col) => col.is_primary_key
        ), primaryKey = primaryKeyCol ? {
          column: primaryKeyCol.column_name,
          value: ""
        } : void 0;
        setSchema({
          tableName,
          columns,
          primaryKey
        }), setData(tableData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    })();
  }, [tableName]);
  let handleSave = async (rowIndex, updatedData) => {
    if (!schema?.primaryKey)
      return;
    let ws = (0, import_ws.getWebSocketClient)();
    try {
      await ws.updateRow(
        tableName,
        {
          column: schema.primaryKey.column,
          value: data[rowIndex][schema.primaryKey.column]
        },
        updatedData
      ), revalidator.revalidate();
    } catch (error) {
      console.error("Error updating row:", error);
    }
  }, handleDelete = async (rowIndex) => {
    if (!schema?.primaryKey)
      return;
    let ws = (0, import_ws.getWebSocketClient)();
    try {
      await ws.deleteRow(tableName, {
        column: schema.primaryKey.column,
        value: data[rowIndex][schema.primaryKey.column]
      }), revalidator.revalidate();
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  }, handleAdd = async (newData) => {
    if (!schema)
      return;
    let ws = (0, import_ws.getWebSocketClient)();
    try {
      await ws.insertRow(tableName, newData), revalidator.revalidate();
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };
  return schema ? /* @__PURE__ */ jsxDEV4("div", { className: "px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxDEV4("div", { className: "sm:flex sm:items-center", children: /* @__PURE__ */ jsxDEV4("div", { className: "sm:flex-auto", children: [
      /* @__PURE__ */ jsxDEV4("h1", { className: "text-2xl font-semibold text-gray-900", children: schema.tableName }, void 0, !1, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 131,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV4("p", { className: "mt-2 text-sm text-gray-700", children: [
        "A list of all rows in the ",
        schema.tableName,
        " table."
      ] }, void 0, !0, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 134,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 130,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 129,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV4("div", { className: "mt-8", children: /* @__PURE__ */ jsxDEV4(
      EditableTable,
      {
        schema,
        data,
        onSave: handleSave,
        onDelete: handleDelete,
        onAdd: handleAdd
      },
      void 0,
      !1,
      {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 140,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 139,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 128,
    columnNumber: 5
  }, this) : /* @__PURE__ */ jsxDEV4("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxDEV4("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }, void 0, !1, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 122,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 121,
    columnNumber: 7
  }, this);
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  meta: () => meta
});
import { useQuery } from "@tanstack/react-query";

// app/components/Layout.tsx
import { Link } from "@remix-run/react";
import { jsxDEV as jsxDEV5 } from "react/jsx-dev-runtime";
function Layout({ children }) {
  return /* @__PURE__ */ jsxDEV5("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxDEV5("nav", { className: "bg-white shadow-sm", children: /* @__PURE__ */ jsxDEV5("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV5("div", { className: "flex justify-between h-16", children: /* @__PURE__ */ jsxDEV5("div", { className: "flex", children: [
      /* @__PURE__ */ jsxDEV5("div", { className: "flex-shrink-0 flex items-center", children: /* @__PURE__ */ jsxDEV5(Link, { to: "/", className: "text-xl font-bold text-primary-600", children: "Data Studio" }, void 0, !1, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 16,
        columnNumber: 17
      }, this) }, void 0, !1, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 15,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV5("div", { className: "hidden sm:ml-6 sm:flex sm:space-x-8", children: [
        /* @__PURE__ */ jsxDEV5(
          Link,
          {
            to: "/",
            className: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
            children: "Schema"
          },
          void 0,
          !1,
          {
            fileName: "app/components/Layout.tsx",
            lineNumber: 21,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ jsxDEV5(
          Link,
          {
            to: "/query",
            className: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
            children: "Query"
          },
          void 0,
          !1,
          {
            fileName: "app/components/Layout.tsx",
            lineNumber: 27,
            columnNumber: 17
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 20,
        columnNumber: 15
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 14,
      columnNumber: 13
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 13,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 12,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 11,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV5("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children }, void 0, !1, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 39,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Layout.tsx",
    lineNumber: 10,
    columnNumber: 5
  }, this);
}

// app/components/DataTable.tsx
import {
  createColumnHelper as createColumnHelper2,
  flexRender as flexRender2,
  getCoreRowModel as getCoreRowModel2,
  useReactTable as useReactTable2,
  getSortedRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";
import { useState as useState3 } from "react";
import { jsxDEV as jsxDEV6 } from "react/jsx-dev-runtime";
function DataTable({
  data,
  columns,
  pageCount,
  onPaginationChange,
  currentPage
}) {
  let [sorting, setSorting] = useState3([]), columnHelper = createColumnHelper2(), tableColumns = columns.map(
    (col) => columnHelper.accessor((row) => row[col.name], {
      id: col.name,
      header: col.name,
      cell: (info) => info.getValue()
    })
  ), table = useReactTable2({
    data,
    columns: tableColumns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel2(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  return /* @__PURE__ */ jsxDEV6("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ jsxDEV6("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsxDEV6("thead", { className: "bg-gray-50", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxDEV6("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxDEV6(
        "th",
        {
          className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer",
          onClick: header.column.getToggleSortingHandler(),
          children: [
            flexRender2(
              header.column.columnDef.header,
              header.getContext()
            ),
            /* @__PURE__ */ jsxDEV6("span", { children: [
              header.column.getIsSorted() === "asc" ? " \u2191" : "",
              header.column.getIsSorted() === "desc" ? " \u2193" : ""
            ] }, void 0, !0, {
              fileName: "app/components/DataTable.tsx",
              lineNumber: 69,
              columnNumber: 19
            }, this)
          ]
        },
        header.id,
        !0,
        {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 60,
          columnNumber: 17
        },
        this
      )) }, headerGroup.id, !1, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 58,
        columnNumber: 13
      }, this)) }, void 0, !1, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV6("tbody", { className: "bg-white divide-y divide-gray-200", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsxDEV6("tr", { children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsxDEV6(
        "td",
        {
          className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
          children: flexRender2(cell.column.columnDef.cell, cell.getContext())
        },
        cell.id,
        !1,
        {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 82,
          columnNumber: 17
        },
        this
      )) }, row.id, !1, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 80,
        columnNumber: 13
      }, this)) }, void 0, !1, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 78,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/DataTable.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV6("div", { className: "py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxDEV6("div", { className: "flex-1 flex justify-between sm:hidden", children: [
        /* @__PURE__ */ jsxDEV6(
          "button",
          {
            onClick: () => onPaginationChange(currentPage - 1),
            disabled: currentPage === 1,
            className: "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
            children: "Previous"
          },
          void 0,
          !1,
          {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 96,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV6(
          "button",
          {
            onClick: () => onPaginationChange(currentPage + 1),
            disabled: currentPage === pageCount,
            className: "ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
            children: "Next"
          },
          void 0,
          !1,
          {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 103,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 95,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV6("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV6("div", { children: /* @__PURE__ */ jsxDEV6("p", { className: "text-sm text-gray-700", children: [
          "Page ",
          /* @__PURE__ */ jsxDEV6("span", { className: "font-medium", children: currentPage }, void 0, !1, {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 114,
            columnNumber: 20
          }, this),
          " of",
          " ",
          /* @__PURE__ */ jsxDEV6("span", { className: "font-medium", children: pageCount }, void 0, !1, {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 115,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 113,
          columnNumber: 13
        }, this) }, void 0, !1, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 112,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV6("div", { children: /* @__PURE__ */ jsxDEV6(
          "nav",
          {
            className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px",
            "aria-label": "Pagination",
            children: [
              /* @__PURE__ */ jsxDEV6(
                "button",
                {
                  onClick: () => onPaginationChange(currentPage - 1),
                  disabled: currentPage === 1,
                  className: "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
                  children: "Previous"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/DataTable.tsx",
                  lineNumber: 123,
                  columnNumber: 15
                },
                this
              ),
              /* @__PURE__ */ jsxDEV6(
                "button",
                {
                  onClick: () => onPaginationChange(currentPage + 1),
                  disabled: currentPage === pageCount,
                  className: "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
                  children: "Next"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/DataTable.tsx",
                  lineNumber: 130,
                  columnNumber: 15
                },
                this
              )
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 119,
            columnNumber: 13
          },
          this
        ) }, void 0, !1, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 118,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 111,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/DataTable.tsx",
      lineNumber: 94,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/DataTable.tsx",
    lineNumber: 54,
    columnNumber: 5
  }, this);
}

// app/routes/_index.tsx
import { useState as useState4 } from "react";
import { jsxDEV as jsxDEV7 } from "react/jsx-dev-runtime";
var meta = () => [
  { title: "Data Studio" },
  { name: "description", content: "Database management studio" }
];
async function fetchSchema() {
  let response = await fetch("http://localhost:3001/api/schema");
  if (!response.ok)
    throw new Error("Failed to fetch schema");
  return response.json();
}
async function fetchTableData(schema, table, page) {
  let response = await fetch(
    `http://localhost:3001/api/query/${schema}/${table}?page=${page}`
  );
  if (!response.ok)
    throw new Error("Failed to fetch table data");
  return response.json();
}
function Index() {
  let [selectedTable, setSelectedTable] = useState4(null), [currentPage, setCurrentPage] = useState4(1), { data: schema, isLoading: isLoadingSchema } = useQuery({
    queryKey: ["schema"],
    queryFn: fetchSchema
  }), { data: tableData, isLoading: isLoadingData } = useQuery({
    queryKey: ["tableData", selectedTable?.schema, selectedTable?.tableName, currentPage],
    queryFn: () => selectedTable ? fetchTableData(selectedTable.schema, selectedTable.tableName, currentPage) : null,
    enabled: !!selectedTable
  });
  return isLoadingSchema ? /* @__PURE__ */ jsxDEV7(Layout, { children: /* @__PURE__ */ jsxDEV7("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxDEV7("div", { className: "text-lg text-gray-600", children: "Loading schema..." }, void 0, !1, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 66,
    columnNumber: 11
  }, this) }, void 0, !1, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 65,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 64,
    columnNumber: 7
  }, this) : /* @__PURE__ */ jsxDEV7(Layout, { children: /* @__PURE__ */ jsxDEV7("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxDEV7("div", { className: "bg-white shadow overflow-hidden sm:rounded-lg", children: [
      /* @__PURE__ */ jsxDEV7("div", { className: "px-4 py-5 sm:px-6", children: /* @__PURE__ */ jsxDEV7("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "Database Schema" }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 77,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 76,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV7("div", { className: "border-t border-gray-200", children: /* @__PURE__ */ jsxDEV7("div", { className: "grid grid-cols-1 gap-6 p-6", children: schema?.map((table) => /* @__PURE__ */ jsxDEV7(
        "div",
        {
          className: "bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:bg-gray-50",
          onClick: () => setSelectedTable(table),
          children: [
            /* @__PURE__ */ jsxDEV7("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: [
              table.schema,
              ".",
              table.tableName
            ] }, void 0, !0, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 89,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV7("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV7("table", { className: "min-w-full divide-y divide-gray-200", children: [
              /* @__PURE__ */ jsxDEV7("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxDEV7("tr", { children: [
                /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Column" }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 97,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 100,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nullable" }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 103,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV7("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Primary Key" }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 106,
                  columnNumber: 27
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 96,
                columnNumber: 25
              }, this) }, void 0, !1, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 95,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV7("tbody", { className: "bg-white divide-y divide-gray-200", children: table.columns.map((column) => /* @__PURE__ */ jsxDEV7("tr", { children: [
                /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: column.name }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 114,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.type }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 117,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.nullable ? "Yes" : "No" }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 120,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV7("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.isPrimaryKey ? "Yes" : "No" }, void 0, !1, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 123,
                  columnNumber: 29
                }, this)
              ] }, column.name, !0, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 113,
                columnNumber: 27
              }, this)) }, void 0, !1, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 111,
                columnNumber: 23
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 94,
              columnNumber: 21
            }, this) }, void 0, !1, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 93,
              columnNumber: 19
            }, this)
          ]
        },
        `${table.schema}.${table.tableName}`,
        !0,
        {
          fileName: "app/routes/_index.tsx",
          lineNumber: 84,
          columnNumber: 17
        },
        this
      )) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 82,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 81,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 75,
      columnNumber: 9
    }, this),
    selectedTable && /* @__PURE__ */ jsxDEV7("div", { className: "bg-white shadow overflow-hidden sm:rounded-lg", children: [
      /* @__PURE__ */ jsxDEV7("div", { className: "px-4 py-5 sm:px-6", children: /* @__PURE__ */ jsxDEV7("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: [
        "Table Data: ",
        selectedTable.schema,
        ".",
        selectedTable.tableName
      ] }, void 0, !0, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 140,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 139,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV7("div", { className: "border-t border-gray-200", children: isLoadingData ? /* @__PURE__ */ jsxDEV7("div", { className: "p-6 text-center text-gray-500", children: "Loading table data..." }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 146,
        columnNumber: 17
      }, this) : tableData ? /* @__PURE__ */ jsxDEV7("div", { className: "p-6", children: /* @__PURE__ */ jsxDEV7(
        DataTable,
        {
          data: tableData.rows,
          columns: selectedTable.columns,
          pageCount: tableData.totalPages,
          currentPage,
          onPaginationChange: setCurrentPage
        },
        void 0,
        !1,
        {
          fileName: "app/routes/_index.tsx",
          lineNumber: 151,
          columnNumber: 19
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 150,
        columnNumber: 17
      }, this) : null }, void 0, !1, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 144,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 138,
      columnNumber: 11
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 74,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 73,
    columnNumber: 5
  }, this);
}

// app/routes/query.tsx
var query_exports = {};
__export(query_exports, {
  default: () => Query,
  meta: () => meta2
});
import { useState as useState5 } from "react";
import { useMutation } from "@tanstack/react-query";
import { jsxDEV as jsxDEV8 } from "react/jsx-dev-runtime";
var meta2 = () => [
  { title: "SQL Query - Data Studio" },
  { name: "description", content: "Execute SQL queries" }
];
async function executeQuery(query) {
  let response = await fetch("http://localhost:3001/api/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
  if (!response.ok)
    throw new Error("Failed to execute query");
  return response.json();
}
function Query() {
  let [query, setQuery] = useState5(""), { mutate, data, isLoading, error } = useMutation({
    mutationFn: executeQuery
  });
  return /* @__PURE__ */ jsxDEV8(Layout, { children: /* @__PURE__ */ jsxDEV8("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxDEV8("div", { children: [
      /* @__PURE__ */ jsxDEV8("label", { htmlFor: "query", className: "block text-sm font-medium text-gray-700", children: "SQL Query" }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 46,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV8("div", { className: "mt-1", children: /* @__PURE__ */ jsxDEV8(
        "textarea",
        {
          id: "query",
          name: "query",
          rows: 4,
          className: "shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: "SELECT * FROM your_table"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/query.tsx",
          lineNumber: 50,
          columnNumber: 13
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 49,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/query.tsx",
      lineNumber: 45,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV8("div", { children: /* @__PURE__ */ jsxDEV8(
      "button",
      {
        type: "button",
        onClick: () => {
          query.trim() && mutate(query);
        },
        disabled: isLoading,
        className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
        children: isLoading ? "Executing..." : "Execute Query"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/query.tsx",
        lineNumber: 63,
        columnNumber: 11
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 62,
      columnNumber: 9
    }, this),
    error && /* @__PURE__ */ jsxDEV8("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ jsxDEV8("div", { className: "flex", children: /* @__PURE__ */ jsxDEV8("div", { className: "ml-3", children: [
      /* @__PURE__ */ jsxDEV8("h3", { className: "text-sm font-medium text-red-800", children: "Error" }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 77,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV8("div", { className: "mt-2 text-sm text-red-700", children: error instanceof Error ? error.message : "Failed to execute query" }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 78,
        columnNumber: 17
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/query.tsx",
      lineNumber: 76,
      columnNumber: 15
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 75,
      columnNumber: 13
    }, this) }, void 0, !1, {
      fileName: "app/routes/query.tsx",
      lineNumber: 74,
      columnNumber: 11
    }, this),
    data && /* @__PURE__ */ jsxDEV8("div", { className: "overflow-x-auto", children: [
      /* @__PURE__ */ jsxDEV8("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsxDEV8("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxDEV8("tr", { children: data.fields?.map((field) => /* @__PURE__ */ jsxDEV8(
          "th",
          {
            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
            children: field.name
          },
          field.name,
          !1,
          {
            fileName: "app/routes/query.tsx",
            lineNumber: 92,
            columnNumber: 21
          },
          this
        )) }, void 0, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 90,
          columnNumber: 17
        }, this) }, void 0, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 89,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV8("tbody", { className: "bg-white divide-y divide-gray-200", children: data.rows?.map((row, rowIndex) => /* @__PURE__ */ jsxDEV8("tr", { children: Object.values(row).map((value, colIndex) => /* @__PURE__ */ jsxDEV8(
          "td",
          {
            className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
            children: value?.toString() ?? "null"
          },
          colIndex,
          !1,
          {
            fileName: "app/routes/query.tsx",
            lineNumber: 105,
            columnNumber: 23
          },
          this
        )) }, rowIndex, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 103,
          columnNumber: 19
        }, this)) }, void 0, !1, {
          fileName: "app/routes/query.tsx",
          lineNumber: 101,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/query.tsx",
        lineNumber: 88,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV8("div", { className: "mt-4", children: /* @__PURE__ */ jsxDEV8("p", { className: "text-sm text-gray-500", children: [
        data.rowCount,
        " rows returned"
      ] }, void 0, !0, {
        fileName: "app/routes/query.tsx",
        lineNumber: 118,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/query.tsx",
        lineNumber: 117,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/query.tsx",
      lineNumber: 87,
      columnNumber: 11
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/query.tsx",
    lineNumber: 44,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/query.tsx",
    lineNumber: 43,
    columnNumber: 5
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-TLMER3GK.js", imports: ["/build/_shared/chunk-3VPVJWTU.js", "/build/_shared/chunk-BLPX6SSX.js", "/build/_shared/chunk-RTBKPWXJ.js", "/build/_shared/chunk-NO3FWBWP.js", "/build/_shared/chunk-ULL77KT2.js", "/build/_shared/chunk-UG3ISROB.js", "/build/_shared/chunk-R3YRPWCC.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-5DWAQVZW.js", imports: ["/build/_shared/chunk-2ITZUYVB.js", "/build/_shared/chunk-NN7AFZOG.js", "/build/_shared/chunk-56WY5XKF.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/$tableName": { id: "routes/$tableName", parentId: "root", path: ":tableName", index: void 0, caseSensitive: void 0, module: "/build/routes/$tableName-XROIEUZS.js", imports: ["/build/_shared/chunk-TR7OV4PM.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-SW5LZDWQ.js", imports: ["/build/_shared/chunk-TR7OV4PM.js", "/build/_shared/chunk-VDNH4KCN.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/query": { id: "routes/query", parentId: "root", path: "query", index: void 0, caseSensitive: void 0, module: "/build/routes/query-CAMVBCYP.js", imports: ["/build/_shared/chunk-VDNH4KCN.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "55fd40f5", hmr: { runtime: "/build/_shared/chunk-UG3ISROB.js", timestamp: 1732563049906 }, url: "/build/manifest-55FD40F5.js" };

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
