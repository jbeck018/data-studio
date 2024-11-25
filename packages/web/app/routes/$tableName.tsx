import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import { EditableTable } from "~/components/EditableTable";
import type { Schema, Column, PrimaryKey } from "~/types";
import { getWebSocketClient } from "~/utils/ws.client";

interface SchemaResponse {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const tableName = params.tableName;
  if (!tableName) {
    throw new Error("Table name is required");
  }

  return json({ tableName });
}

export default function TableRoute() {
  const { tableName } = useLoaderData<typeof loader>();
  const [schema, setSchema] = useState<Schema | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const revalidator = useRevalidator();

  useEffect(() => {
    const ws = getWebSocketClient();

    const loadData = async () => {
      try {
        const [schemaData, tableData] = await Promise.all([
          ws.getTableSchema(tableName),
          ws.queryTable(tableName),
        ]);

        const columns: Column[] = (schemaData as SchemaResponse[]).map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === "YES",
          default: col.column_default ?? undefined,
        }));

        const primaryKeyCol = (schemaData as SchemaResponse[]).find(
          (col) => col.is_primary_key
        );

        const primaryKey: PrimaryKey | undefined = primaryKeyCol
          ? {
              column: primaryKeyCol.column_name,
              value: "",
            }
          : undefined;

        setSchema({
          tableName,
          columns,
          primaryKey,
        });
        setData(tableData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [tableName]);

  const handleSave = async (rowIndex: number, updatedData: Record<string, any>) => {
    if (!schema?.primaryKey) return;

    const ws = getWebSocketClient();
    try {
      await ws.updateRow(
        tableName,
        {
          column: schema.primaryKey.column,
          value: data[rowIndex][schema.primaryKey.column],
        },
        updatedData
      );
      revalidator.revalidate();
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    if (!schema?.primaryKey) return;

    const ws = getWebSocketClient();
    try {
      await ws.deleteRow(tableName, {
        column: schema.primaryKey.column,
        value: data[rowIndex][schema.primaryKey.column],
      });
      revalidator.revalidate();
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const handleAdd = async (newData: Record<string, any>) => {
    if (!schema) return;

    const ws = getWebSocketClient();
    try {
      await ws.insertRow(tableName, newData);
      revalidator.revalidate();
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {schema.tableName}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all rows in the {schema.tableName} table.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <EditableTable
          schema={schema}
          data={data}
          onSave={handleSave}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>
    </div>
  );
}
