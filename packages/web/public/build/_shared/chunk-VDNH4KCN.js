import {
  Link
} from "/build/_shared/chunk-BLPX6SSX.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-NO3FWBWP.js";
import {
  createHotContext
} from "/build/_shared/chunk-UG3ISROB.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/components/Layout.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/Layout.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/Layout.tsx"
  );
  import.meta.hot.lastModified = "1732560430877.8533";
}
function Layout({
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", { className: "bg-white shadow-sm", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex justify-between h-16", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-shrink-0 flex items-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/", className: "text-xl font-bold text-primary-600", children: "Data Studio" }, void 0, false, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 32,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 31,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "hidden sm:ml-6 sm:flex sm:space-x-8", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/", className: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", children: "Schema" }, void 0, false, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 37,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/query", className: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", children: "Query" }, void 0, false, {
          fileName: "app/components/Layout.tsx",
          lineNumber: 40,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/Layout.tsx",
        lineNumber: 36,
        columnNumber: 15
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 30,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 29,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 28,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children }, void 0, false, {
      fileName: "app/components/Layout.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/Layout.tsx",
    lineNumber: 26,
    columnNumber: 10
  }, this);
}
_c = Layout;
var _c;
$RefreshReg$(_c, "Layout");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  Layout
};
//# sourceMappingURL=/build/_shared/chunk-VDNH4KCN.js.map
