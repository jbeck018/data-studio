import {
  Layout
} from "/build/_shared/chunk-VDNH4KCN.js";
import {
  useMutation
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

// app/routes/query.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/query.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/query.tsx"
  );
  import.meta.hot.lastModified = "1732560430879.1604";
}
var meta = () => {
  return [{
    title: "SQL Query - Data Studio"
  }, {
    name: "description",
    content: "Execute SQL queries"
  }];
};
async function executeQuery(query) {
  const response = await fetch("http://localhost:3001/api/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query
    })
  });
  if (!response.ok) {
    throw new Error("Failed to execute query");
  }
  return response.json();
}
function Query() {
  var _a, _b;
  _s();
  const [query, setQuery] = (0, import_react.useState)("");
  const {
    mutate,
    data,
    isLoading,
    error
  } = useMutation({
    mutationFn: executeQuery
  });
  const handleExecute = () => {
    if (query.trim()) {
      mutate(query);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-6", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", { htmlFor: "query", className: "block text-sm font-medium text-gray-700", children: "SQL Query" }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 67,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mt-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("textarea", { id: "query", name: "query", rows: 4, className: "shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "SELECT * FROM your_table" }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 71,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 70,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/query.tsx",
      lineNumber: 66,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "button", onClick: handleExecute, disabled: isLoading, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500", children: isLoading ? "Executing..." : "Execute Query" }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 76,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 75,
      columnNumber: 9
    }, this),
    error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "ml-3", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { className: "text-sm font-medium text-red-800", children: "Error" }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 84,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mt-2 text-sm text-red-700", children: error instanceof Error ? error.message : "Failed to execute query" }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 85,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/query.tsx",
      lineNumber: 83,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 82,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 81,
      columnNumber: 19
    }, this),
    data && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "overflow-x-auto", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("thead", { className: "bg-gray-50", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: (_a = data.fields) == null ? void 0 : _a.map((field) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: field.name }, field.name, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 96,
          columnNumber: 46
        }, this)) }, void 0, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 95,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 94,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tbody", { className: "bg-white divide-y divide-gray-200", children: (_b = data.rows) == null ? void 0 : _b.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: Object.values(row).map((value, colIndex) => {
          var _a2;
          return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (_a2 = value == null ? void 0 : value.toString()) != null ? _a2 : "null" }, colIndex, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 103,
            columnNumber: 66
          }, this);
        }) }, rowIndex, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 102,
          columnNumber: 52
        }, this)) }, void 0, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 101,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/query.tsx",
        lineNumber: 93,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-gray-500", children: [
        data.rowCount,
        " rows returned"
      ] }, void 0, true, {
        fileName: "app/routes/query.tsx",
        lineNumber: 111,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 110,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/query.tsx",
      lineNumber: 92,
      columnNumber: 18
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/query.tsx",
    lineNumber: 65,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/query.tsx",
    lineNumber: 64,
    columnNumber: 10
  }, this);
}
_s(Query, "WEE6oQKHx4OizG3me8TRY76/Dl4=", false, function() {
  return [useMutation];
});
_c = Query;
var _c;
$RefreshReg$(_c, "Query");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Query as default,
  meta
};
//# sourceMappingURL=/build/routes/query-CAMVBCYP.js.map
