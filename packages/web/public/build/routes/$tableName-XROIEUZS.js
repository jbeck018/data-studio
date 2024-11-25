import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "/build/_shared/chunk-TR7OV4PM.js";
import {
  useLoaderData,
  useRevalidator
} from "/build/_shared/chunk-BLPX6SSX.js";
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
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// empty-module:@remix-run/node
var require_node = __commonJS({
  "empty-module:@remix-run/node"(exports, module) {
    module.exports = {};
  }
});

// app/routes/$tableName.tsx
var import_node = __toESM(require_node(), 1);
var import_react3 = __toESM(require_react(), 1);

// app/components/EditableTable.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/EditableTable.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/EditableTable.tsx"
  );
  import.meta.hot.lastModified = "1732561491881.7795";
}
function EditableTable({
  schema,
  data,
  onSave,
  onDelete,
  onAdd
}) {
  _s();
  const [editingCell, setEditingCell] = (0, import_react.useState)(null);
  const [editedData, setEditedData] = (0, import_react.useState)({});
  const columnHelper = createColumnHelper();
  const columns = [...schema.columns.map((col) => columnHelper.accessor(col.name, {
    header: () => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "font-medium text-gray-900", children: [
      col.name,
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "ml-2 text-xs text-gray-500", children: [
        "(",
        col.type,
        ")"
      ] }, void 0, true, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 38,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 36,
      columnNumber: 19
    }, this),
    cell: ({
      row,
      column,
      getValue
    }) => {
      var _a;
      const isEditing = (editingCell == null ? void 0 : editingCell.rowIndex) === row.index && (editingCell == null ? void 0 : editingCell.columnId) === column.id;
      const value = getValue();
      if (isEditing) {
        return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { className: "w-full px-2 py-1 border rounded", value: (_a = editedData[column.id]) != null ? _a : value, onChange: (e) => setEditedData({
          ...editedData,
          [column.id]: e.target.value
        }), onBlur: () => {
          onSave(row.index, {
            ...row.original,
            [column.id]: editedData[column.id]
          });
          setEditingCell(null);
          setEditedData({});
        }, autoFocus: true }, void 0, false, {
          fileName: "app/components/EditableTable.tsx",
          lineNumber: 48,
          columnNumber: 16
        }, this);
      }
      return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "px-2 py-1 cursor-pointer hover:bg-gray-50", onClick: () => {
        setEditingCell({
          rowIndex: row.index,
          columnId: column.id
        });
        setEditedData({
          [column.id]: value
        });
      }, children: value }, void 0, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 60,
        columnNumber: 14
      }, this);
    }
  })), columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({
      row
    }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => onDelete(row.index), className: "text-red-600 hover:text-red-800", children: "Delete" }, void 0, false, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 78,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 77,
      columnNumber: 11
    }, this)
  })];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("thead", { className: "bg-gray-50", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: flexRender(header.column.columnDef.header, header.getContext()) }, header.id, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 92,
        columnNumber: 50
      }, this)) }, headerGroup.id, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 91,
        columnNumber: 55
      }, this)) }, void 0, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 90,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tbody", { className: "bg-white divide-y divide-gray-200", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 99,
        columnNumber: 50
      }, this)) }, row.id, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 98,
        columnNumber: 48
      }, this)) }, void 0, false, {
        fileName: "app/components/EditableTable.tsx",
        lineNumber: 97,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 89,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => {
      const newRow = schema.columns.reduce((acc, col) => ({
        ...acc,
        [col.name]: ""
      }), {});
      onAdd(newRow);
    }, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: "Add Row" }, void 0, false, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 106,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/EditableTable.tsx",
      lineNumber: 105,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/EditableTable.tsx",
    lineNumber: 88,
    columnNumber: 10
  }, this);
}
_s(EditableTable, "DMB2CcRMC6qjDUVilhVHjV2GOTI=", false, function() {
  return [useReactTable];
});
_c = EditableTable;
var _c;
$RefreshReg$(_c, "EditableTable");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/utils/ws.client.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/utils/ws.client.ts"
  );
  import.meta.hot.lastModified = "1732562054575.9158";
}
var WebSocketClient = class {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.messageQueue = [];
    this.messageId = 0;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1e3;
    this.connect();
  }
  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.processQueue();
    };
    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.ws = null;
      this.handleReconnect();
    };
    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    this.ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const pendingMessage = this.messageQueue[response.id];
      if (pendingMessage) {
        if (response.error) {
          pendingMessage.reject(new Error(response.error));
        } else {
          pendingMessage.resolve(response.data);
        }
        delete this.messageQueue[response.id];
      }
    };
  }
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }
  async sendMessage(type, payload = {}) {
    return new Promise((resolve, reject) => {
      var _a;
      const id = this.messageId++;
      this.messageQueue[id] = { resolve, reject };
      const message = {
        id,
        type,
        payload
      };
      if (((_a = this.ws) == null ? void 0 : _a.readyState) === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        this.messageQueue[id] = { resolve, reject };
      }
    });
  }
  processQueue() {
    var _a;
    for (const [id, { resolve, reject }] of Object.entries(this.messageQueue)) {
      const message = {
        id: parseInt(id),
        type: "retry",
        payload: {}
      };
      if (((_a = this.ws) == null ? void 0 : _a.readyState) === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        reject(new Error("WebSocket is not connected"));
      }
    }
  }
  async getTableSchema(tableName) {
    return this.sendMessage("getSchema", { tableName });
  }
  async queryTable(tableName) {
    return this.sendMessage("query", { tableName });
  }
  async updateRow(tableName, primaryKey, data) {
    return this.sendMessage("update", { tableName, primaryKey, data });
  }
  async deleteRow(tableName, primaryKey) {
    return this.sendMessage("delete", { tableName, primaryKey });
  }
  async insertRow(tableName, data) {
    return this.sendMessage("insert", { tableName, data });
  }
};
var wsClient = null;
function getWebSocketClient() {
  if (!wsClient) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    wsClient = new WebSocketClient(wsUrl);
  }
  return wsClient;
}

// app/routes/$tableName.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/$tableName.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/$tableName.tsx"
  );
  import.meta.hot.lastModified = "1732562014413.4119";
}
function TableRoute() {
  _s2();
  const {
    tableName
  } = useLoaderData();
  const [schema, setSchema] = (0, import_react3.useState)(null);
  const [data, setData] = (0, import_react3.useState)([]);
  const revalidator = useRevalidator();
  (0, import_react3.useEffect)(() => {
    const ws = getWebSocketClient();
    const loadData = async () => {
      try {
        const [schemaData, tableData] = await Promise.all([ws.getTableSchema(tableName), ws.queryTable(tableName)]);
        const columns = schemaData.map((col) => {
          var _a;
          return {
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === "YES",
            default: (_a = col.column_default) != null ? _a : void 0
          };
        });
        const primaryKeyCol = schemaData.find((col) => col.is_primary_key);
        const primaryKey = primaryKeyCol ? {
          column: primaryKeyCol.column_name,
          value: ""
        } : void 0;
        setSchema({
          tableName,
          columns,
          primaryKey
        });
        setData(tableData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [tableName]);
  const handleSave = async (rowIndex, updatedData) => {
    if (!(schema == null ? void 0 : schema.primaryKey))
      return;
    const ws = getWebSocketClient();
    try {
      await ws.updateRow(tableName, {
        column: schema.primaryKey.column,
        value: data[rowIndex][schema.primaryKey.column]
      }, updatedData);
      revalidator.revalidate();
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };
  const handleDelete = async (rowIndex) => {
    if (!(schema == null ? void 0 : schema.primaryKey))
      return;
    const ws = getWebSocketClient();
    try {
      await ws.deleteRow(tableName, {
        column: schema.primaryKey.column,
        value: data[rowIndex][schema.primaryKey.column]
      });
      revalidator.revalidate();
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };
  const handleAdd = async (newData) => {
    if (!schema)
      return;
    const ws = getWebSocketClient();
    try {
      await ws.insertRow(tableName, newData);
      revalidator.revalidate();
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };
  if (!schema) {
    return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }, void 0, false, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 112,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 111,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "sm:flex sm:items-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "sm:flex-auto", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h1", { className: "text-2xl font-semibold text-gray-900", children: schema.tableName }, void 0, false, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 118,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "mt-2 text-sm text-gray-700", children: [
        "A list of all rows in the ",
        schema.tableName,
        " table."
      ] }, void 0, true, {
        fileName: "app/routes/$tableName.tsx",
        lineNumber: 121,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 117,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 116,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "mt-8", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(EditableTable, { schema, data, onSave: handleSave, onDelete: handleDelete, onAdd: handleAdd }, void 0, false, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 127,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/$tableName.tsx",
      lineNumber: 126,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/$tableName.tsx",
    lineNumber: 115,
    columnNumber: 10
  }, this);
}
_s2(TableRoute, "fNNUEk/FJZ2kTQGOSZpVd2dUFDQ=", false, function() {
  return [useLoaderData, useRevalidator];
});
_c2 = TableRoute;
var _c2;
$RefreshReg$(_c2, "TableRoute");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  TableRoute as default
};
//# sourceMappingURL=/build/routes/$tableName-XROIEUZS.js.map
