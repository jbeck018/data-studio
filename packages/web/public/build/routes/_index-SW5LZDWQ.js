import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "/build/_shared/chunk-TR7OV4PM.js";
import {
  Layout
} from "/build/_shared/chunk-VDNH4KCN.js";
import {
  useQuery
} from "/build/_shared/chunk-NN7AFZOG.js";
import "/build/_shared/chunk-56WY5XKF.js";
import "/build/_shared/chunk-BLPX6SSX.js";
import "/build/_shared/chunk-RTBKPWXJ.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-NO3FWBWP.js";
import {
  require_react
} from "/build/_shared/chunk-ULL77KT2.js";
import {
  createHotContext
} from "/build/_shared/chunk-UG3ISROB.js";
import "/build/_shared/chunk-R3YRPWCC.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/components/DataTable.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/DataTable.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/DataTable.tsx"
  );
  import.meta.hot.lastModified = "1732560039293.8784";
}
function DataTable({
  data,
  columns,
  pageCount,
  onPaginationChange,
  currentPage
}) {
  _s();
  const [sorting, setSorting] = (0, import_react.useState)([]);
  const columnHelper = createColumnHelper();
  const tableColumns = columns.map((col) => columnHelper.accessor((row) => row[col.name], {
    id: col.name,
    header: col.name,
    cell: (info) => info.getValue()
  }));
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("thead", { className: "bg-gray-50", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer", onClick: header.column.getToggleSortingHandler(), children: [
        flexRender(header.column.columnDef.header, header.getContext()),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
          header.column.getIsSorted() === "asc" ? " \u2191" : "",
          header.column.getIsSorted() === "desc" ? " \u2193" : ""
        ] }, void 0, true, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 56,
          columnNumber: 19
        }, this)
      ] }, header.id, true, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 54,
        columnNumber: 50
      }, this)) }, headerGroup.id, false, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 53,
        columnNumber: 55
      }, this)) }, void 0, false, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 52,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tbody", { className: "bg-white divide-y divide-gray-200", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id, false, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 65,
        columnNumber: 50
      }, this)) }, row.id, false, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 64,
        columnNumber: 48
      }, this)) }, void 0, false, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 63,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/DataTable.tsx",
      lineNumber: 51,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-1 flex justify-between sm:hidden", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => onPaginationChange(currentPage - 1), disabled: currentPage === 1, className: "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50", children: "Previous" }, void 0, false, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 74,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => onPaginationChange(currentPage + 1), disabled: currentPage === pageCount, className: "ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50", children: "Next" }, void 0, false, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 77,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 73,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-gray-700", children: [
          "Page ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-medium", children: currentPage }, void 0, false, {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 84,
            columnNumber: 20
          }, this),
          " of",
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-medium", children: pageCount }, void 0, false, {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 85,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 83,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 82,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", { className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px", "aria-label": "Pagination", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => onPaginationChange(currentPage - 1), disabled: currentPage === 1, className: "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50", children: "Previous" }, void 0, false, {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 90,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => onPaginationChange(currentPage + 1), disabled: currentPage === pageCount, className: "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50", children: "Next" }, void 0, false, {
            fileName: "app/components/DataTable.tsx",
            lineNumber: 93,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 89,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/DataTable.tsx",
          lineNumber: 88,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/DataTable.tsx",
        lineNumber: 81,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/DataTable.tsx",
      lineNumber: 72,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/DataTable.tsx",
    lineNumber: 50,
    columnNumber: 10
  }, this);
}
_s(DataTable, "qg5rok0fZeVwH4q3itwzrlIy2qs=", false, function() {
  return [useReactTable];
});
_c = DataTable;
var _c;
$RefreshReg$(_c, "DataTable");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/_index.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1732560430898.8423";
}
var meta = () => {
  return [{
    title: "Data Studio"
  }, {
    name: "description",
    content: "Database management studio"
  }];
};
async function fetchSchema() {
  const response = await fetch("http://localhost:3001/api/schema");
  if (!response.ok) {
    throw new Error("Failed to fetch schema");
  }
  return response.json();
}
async function fetchTableData(schema, table, page) {
  const response = await fetch(`http://localhost:3001/api/query/${schema}/${table}?page=${page}`);
  if (!response.ok) {
    throw new Error("Failed to fetch table data");
  }
  return response.json();
}
function Index() {
  _s2();
  const [selectedTable, setSelectedTable] = (0, import_react2.useState)(null);
  const [currentPage, setCurrentPage] = (0, import_react2.useState)(1);
  const {
    data: schema,
    isLoading: isLoadingSchema
  } = useQuery({
    queryKey: ["schema"],
    queryFn: fetchSchema
  });
  const {
    data: tableData,
    isLoading: isLoadingData
  } = useQuery({
    queryKey: ["tableData", selectedTable == null ? void 0 : selectedTable.schema, selectedTable == null ? void 0 : selectedTable.tableName, currentPage],
    queryFn: () => selectedTable ? fetchTableData(selectedTable.schema, selectedTable.tableName, currentPage) : null,
    enabled: !!selectedTable
  });
  if (isLoadingSchema) {
    return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Layout, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "text-lg text-gray-600", children: "Loading schema..." }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 70,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 69,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 68,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Layout, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "bg-white shadow overflow-hidden sm:rounded-lg", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "px-4 py-5 sm:px-6", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "Database Schema" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 78,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 77,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "border-t border-gray-200", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "grid grid-cols-1 gap-6 p-6", children: schema == null ? void 0 : schema.map((table) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:bg-gray-50", onClick: () => setSelectedTable(table), children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: [
          table.schema,
          ".",
          table.tableName
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 85,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("table", { className: "min-w-full divide-y divide-gray-200", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("thead", { className: "bg-gray-50", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("tr", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Column" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 93,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 96,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nullable" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 99,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Primary Key" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 102,
              columnNumber: 27
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 92,
            columnNumber: 25
          }, this) }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 91,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("tbody", { className: "bg-white divide-y divide-gray-200", children: table.columns.map((column) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("tr", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: column.name }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 109,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.type }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 112,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.nullable ? "Yes" : "No" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 115,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.isPrimaryKey ? "Yes" : "No" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 118,
              columnNumber: 29
            }, this)
          ] }, column.name, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 108,
            columnNumber: 54
          }, this)) }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 107,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 90,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 89,
          columnNumber: 19
        }, this)
      ] }, `${table.schema}.${table.tableName}`, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 84,
        columnNumber: 37
      }, this)) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 83,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 82,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 76,
      columnNumber: 9
    }, this),
    selectedTable && /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "bg-white shadow overflow-hidden sm:rounded-lg", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "px-4 py-5 sm:px-6", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: [
        "Table Data: ",
        selectedTable.schema,
        ".",
        selectedTable.tableName
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 132,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 131,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "border-t border-gray-200", children: isLoadingData ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "p-6 text-center text-gray-500", children: "Loading table data..." }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 137,
        columnNumber: 32
      }, this) : tableData ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "p-6", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(DataTable, { data: tableData.rows, columns: selectedTable.columns, pageCount: tableData.totalPages, currentPage, onPaginationChange: setCurrentPage }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 140,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 139,
        columnNumber: 38
      }, this) : null }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 136,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 130,
      columnNumber: 27
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 75,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 74,
    columnNumber: 10
  }, this);
}
_s2(Index, "Vr/jhiWAku2eJuKrOJ4CATM9jj4=", false, function() {
  return [useQuery, useQuery];
});
_c2 = Index;
var _c2;
$RefreshReg$(_c2, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default,
  meta
};
//# sourceMappingURL=/build/routes/_index-SW5LZDWQ.js.map
