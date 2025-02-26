import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { TabView } from "../components/TabView";
import { EmptyState } from "../components/EmptyState";
import { RowDetailsSidebar } from "../components/RowDetailsSidebar";
import { useCallback, useState } from "react";
import { isNumber, startCase } from "lodash-es";
import { useClient } from "../hooks/useClient";
import type { TableDataResponse } from "../types";
import { fetchTableData } from "../utils/api.server";
import { fetchSchema } from "../utils/api.server";
import { useTableUpdates } from "../hooks/useTableUpdates";
import { Column } from "~/types/schema";
import { DataGrid } from "~/components/DataGrid";

interface LoaderData {
  tableName: string;
  data: TableDataResponse;
  columns: Column[];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const tableName = params.tableName;
  if (!tableName) {
    throw new Error("Table name is required");
  }

  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || undefined;
  const sortOrder = url.searchParams.get("sortOrder") as "asc" | "desc" | undefined;

  const data = await fetchTableData(tableName, sortBy, sortOrder);
  const schema = await fetchSchema();
  const tableSchema = schema.find(t => t.name === tableName);
  
  if (!tableSchema) {
    throw new Error(`Table ${tableName} not found`);
  }

  return { 
    tableName, 
    data,
    columns: tableSchema.columns
  };
}

export default function TablePage() {
  const { tableName, data: initialData, columns } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const client = useClient();

  // Use real-time updates
  const liveData = useTableUpdates(tableName, initialData);

  const activeTab = searchParams.get("tab") || "content";
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;

  const handleSort = useCallback((columnId: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("sortBy", columnId);
      newParams.set("sortOrder", prev.get("sortBy") === columnId && prev.get("sortOrder") === "asc" ? "desc" : "asc");
      return newParams;
    });
  }, [setSearchParams]);

  const handleTabChange = useCallback((tabId: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tabId);
      return newParams;
    });
  }, [setSearchParams]);

  const handleEdit = useCallback(async (rowIndex: number, newData: Record<string, unknown>) => {
    if (!tableName) return;
    try {
      const response = await fetch(`/api/tables/${tableName}/rows/${rowIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update row: ${response.statusText}`);
      }
    } catch (err) {
      throw err;
    }
  }, [tableName]);

  const handleDelete = useCallback(async (rowIndex: number) => {
    if (!tableName) return;

    try {
      const response = await fetch(`/api/tables/${tableName}/rows/${rowIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete row: ${response.statusText}`);
      }

      if (selectedRow === rowIndex) {
        setSelectedRow(null);
      }
    } catch (err) {
      throw err;
    }
  }, [tableName, selectedRow]);

  const formatCellValue = useCallback((value: unknown): string => {
    if (value === null) return "NULL";
    if (value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }, []);

  const tabs = [
    { id: "content", label: "Content" },
    { id: "structure", label: "Structure" },
    { id: "indexes", label: "Indexes" },
    { id: "foreign-keys", label: "Foreign Keys" },
  ];

  const renderTabContent = () => {
    if (!client) {
      return null;
    }

    switch (activeTab) {
      case "content":
        if (liveData.data.length === 0) {
          return (
            <EmptyState
              type="table"
              title="No Data"
              message="This table is empty"
            />
          );
        }
        return (
          <DataGrid
            columns={columns as any}
            rows={liveData.data}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            formatCellValue={formatCellValue}
            isEditable={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRow={isNumber(selectedRow) ? selectedRow : undefined}
            onRowSelect={setSelectedRow}
            isLoading={false}
            error={undefined}
          />
        );
      case "structure":
        if (columns.length === 0) {
          return (
            <EmptyState
              type="database"
              title="No Columns"
              message="This table has no columns defined"
            />
          );
        }
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nullable</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                  </tr>
                </thead>
                <tbody className="bg-current dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {columns.map((column, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{column.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{column.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{column.nullable ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{column.defaultValue || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700 bg-current dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {startCase(tableName)}
        </h1>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-none border-b border-gray-200 dark:border-gray-700">
          <TabView 
            tabs={tabs} 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        <>
          <div className="flex-1 min-h-0 p-4 overflow-y-auto">
            {renderTabContent()}
          </div>
          <RowDetailsSidebar
            row={selectedRow !== null ? liveData.data[selectedRow] : null}
            columns={columns as any}
            isOpen={selectedRow !== null}
            onClose={() => setSelectedRow(null)}
            formatCellValue={formatCellValue}
            fields={columns.map(col => ({
              name: col.name,
              type: col.type,
              dataType: col.type
            }))}
          />
        </>
      </div>
    </div>
  );
}
