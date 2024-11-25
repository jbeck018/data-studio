import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { fetchTableData, fetchSchema, updateTableSchema, createTableRow } from "~/utils/api";
import type { TableSchema, TableDataResponse } from "~/types";
import { useState } from "react";
import { DataView } from "~/components/DataView";
import { StructureView } from "~/components/StructureView";
import { TabView } from "~/components/TabView";
import { Button } from "~/components/Button";
import { CreateRowModal } from "~/components/CreateRowModal";
import { PageContainer } from "~/components/PageContainer";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || undefined;
  const sortOrder = url.searchParams.get("sortOrder") as "asc" | "desc" | undefined;
  const activeTab = url.searchParams.get("tab") || "data";
  const showCreateModal = url.searchParams.get("showCreateModal") === "true";

  const tableName = params.tableName;
  if (!tableName) {
    throw new Response("Table name is required", { status: 400 });
  }

  try {
    const [schemas, tableData] = await Promise.all([
      fetchSchema(),
      fetchTableData(tableName, sortBy, sortOrder)
    ]);

    const schema = schemas.find(s => s.name === tableName);
    if (!schema) {
      throw new Response("Table not found", { status: 404 });
    }

    return json({
      tableName,
      schema,
      tableData,
      activeTab,
      showCreateModal
    });
  } catch (error) {
    console.error(`Error loading table ${tableName}:`, error);
    throw new Response("Error loading table data", { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const tableName = params.tableName;
  if (!tableName) {
    throw new Response("Table name is required", { status: 400 });
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await createTableRow(tableName, data);
    return json({ success: true });
  } catch (error) {
    console.error(`Error creating row in table ${tableName}:`, error);
    throw new Response("Error creating row", { status: 500 });
  }
}

export default function TableRoute() {
  const { tableName, schema, tableData, activeTab, showCreateModal } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | undefined;

  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSearchParams(prev => {
      prev.set("sortBy", column);
      prev.set("sortOrder", newSortOrder);
      return prev;
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams(prev => {
      prev.set("tab", tab);
      return prev;
    });
  };

  const handleCreateModalToggle = (show: boolean) => {
    setSearchParams(prev => {
      if (show) {
        prev.set("showCreateModal", "true");
      } else {
        prev.delete("showCreateModal");
      }
      return prev;
    });
  };

  const handleSchemaUpdate = async (updatedSchema: TableSchema) => {
    try {
      await updateTableSchema(tableName, updatedSchema);
      // Reload the page to get the updated schema
      window.location.reload();
    } catch (error) {
      console.error("Failed to update schema:", error);
      alert("Failed to update schema. Please try again.");
    }
  };

  const handleCreateRow = async (data: Record<string, any>) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      await submit(formData, { method: "post" });
      handleCreateModalToggle(false);
    } catch (error) {
      console.error("Failed to create row:", error);
      alert("Failed to create row. Please try again.");
    }
  };

  const handleEdit = async (rowIndex: number, data: Record<string, any>) => {
    try {
      // TODO: Implement edit functionality
      console.log('Editing row:', rowIndex, data);
    } catch (error) {
      console.error('Error editing row:', error);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    try {
      // TODO: Implement delete functionality
      console.log('Deleting row:', rowIndex);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return '';
    
    // Handle JSON objects and arrays
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    
    return String(value);
  };

  const tabs = [
    { label: "Data", id: "data" },
    { label: "Structure", id: "structure" },
  ];

  return (
    <PageContainer>
      <div className="flex-none">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {tableName}
          </h1>
          {activeTab === "data" && (
            <div className="flex gap-2">
              <Button onClick={() => handleCreateModalToggle(true)}>
                Create Row
              </Button>
            </div>
          )}
        </div>
        <TabView
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        {activeTab === "data" ? (
          tableData ? (
            <DataView
              columns={schema?.columns || []}
              rows={tableData.data}
              sortBy={sortBy || ''}
              sortOrder={sortOrder}
              onSort={handleSort}
              formatCellValue={formatCellValue}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isEditable={true}
            />
          ) : null
        ) : (
          <StructureView
            schema={schema}
            onSave={handleSchemaUpdate}
          />
        )}
      </div>
      {showCreateModal && (
        <CreateRowModal
          tableName={tableName}
          fields={schema?.columns || []}
          onClose={() => handleCreateModalToggle(false)}
          onSubmit={handleCreateRow}
        />
      )}
    </PageContainer>
  );
}
