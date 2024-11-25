import {
  require_node,
  startCase_default
} from "/build/_shared/chunk-FRNKA3J3.js";
import {
  Link,
  useLoaderData
} from "/build/_shared/chunk-HDRCTI32.js";
import "/build/_shared/chunk-RTBKPWXJ.js";
import {
  PageContainer
} from "/build/_shared/chunk-47F22B26.js";
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

// app/routes/_index.tsx
var import_node = __toESM(require_node(), 1);
var import_react3 = __toESM(require_react(), 1);

// app/components/TableList.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/TableList.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/TableList.tsx"
  );
  import.meta.hot.lastModified = "1732572451904.6697";
}
function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
function formatNumber(num) {
  if (!num || num < 0)
    return "0";
  return new Intl.NumberFormat().format(num);
}
function prettyPrintName(name) {
  return startCase_default(name.toLowerCase());
}
function TableList({
  tables
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: tables.map((table) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: `/${table.name}`, className: "group block w-full p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h5", { className: "text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate max-w-[80%]", children: prettyPrintName(table.name) }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 46,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 51,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 50,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 49,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/TableList.tsx",
      lineNumber: 45,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-bold", children: table.columns.length }, void 0, false, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 58,
            columnNumber: 17
          }, this),
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "italic text-gray-500 dark:text-gray-400", children: "columns" }, void 0, false, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 59,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 57,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, false, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 61,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-bold", children: formatNumber(table.rowCount) }, void 0, false, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 63,
            columnNumber: 17
          }, this),
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "italic text-gray-500 dark:text-gray-400", children: "rows" }, void 0, false, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 64,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 62,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" }, void 0, false, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 66,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-bold", children: formatBytes(table.sizeInBytes) }, void 0, false, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 68,
            columnNumber: 17
          }, this),
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "italic text-gray-500 dark:text-gray-400", children: "size" }, void 0, false, {
            fileName: "app/components/TableList.tsx",
            lineNumber: 69,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 67,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 56,
        columnNumber: 13
      }, this),
      Array.isArray(table.primaryKey) && table.primaryKey.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-normal text-gray-500 dark:text-gray-400", children: "Primary Key:" }, void 0, false, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 73,
          columnNumber: 17
        }, this),
        " ",
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "font-mono text-purple-600 dark:text-purple-400", children: table.primaryKey.map(prettyPrintName).join(", ") }, void 0, false, {
          fileName: "app/components/TableList.tsx",
          lineNumber: 74,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 72,
        columnNumber: 80
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/TableList.tsx",
      lineNumber: 55,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "View table" }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 80,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", { className: "flex-shrink-0 w-4 h-4 ml-1 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 82,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/components/TableList.tsx",
        lineNumber: 81,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/TableList.tsx",
      lineNumber: 79,
      columnNumber: 11
    }, this)
  ] }, table.name, true, {
    fileName: "app/components/TableList.tsx",
    lineNumber: 44,
    columnNumber: 28
  }, this)) }, void 0, false, {
    fileName: "app/components/TableList.tsx",
    lineNumber: 43,
    columnNumber: 10
  }, this);
}
_c = TableList;
var _c;
$RefreshReg$(_c, "TableList");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/_index.tsx
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
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1732570763568.8157";
}
var meta = () => {
  return [{
    title: "Data Studio"
  }, {
    name: "description",
    content: "Database management studio"
  }];
};
function Index() {
  _s();
  const {
    tables
  } = useLoaderData();
  const [searchTerm, setSearchTerm] = (0, import_react3.useState)("");
  const filteredTables = tables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(PageContainer, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "relative", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { type: "text", placeholder: "Search tables...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full p-3 pl-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 61,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("svg", { className: "h-5 w-5 text-gray-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("path", { fillRule: "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule: "evenodd" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 64,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 63,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 62,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 60,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 59,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(TableList, { tables: filteredTables }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 58,
    columnNumber: 10
  }, this);
}
_s(Index, "OZftIQFGbKBs6g+3aCu5a3xMQRE=", false, function() {
  return [useLoaderData];
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
//# sourceMappingURL=/build/routes/_index-OUCT5THC.js.map
