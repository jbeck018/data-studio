import { useQuery } from "@tanstack/react-query";
import { json, type MetaFunction } from "@remix-run/node";
import { Layout } from "~/components/Layout";
import { DataTable } from "~/components/DataTable";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Data Studio" },
    { name: "description", content: "Database management studio" },
  ];
};

interface TableInfo {
  tableName: string;
  schema: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    defaultValue: string | null;
    isPrimaryKey: boolean;
  }>;
}

async function fetchSchema(): Promise<TableInfo[]> {
  const response = await fetch('http://localhost:3001/api/schema');
  if (!response.ok) {
    throw new Error('Failed to fetch schema');
  }
  return response.json();
}

async function fetchTableData(schema: string, table: string, page: number) {
  const response = await fetch(
    `http://localhost:3001/api/query/${schema}/${table}?page=${page}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch table data');
  }
  return response.json();
}

export default function Index() {
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: schema, isLoading: isLoadingSchema } = useQuery({
    queryKey: ['schema'],
    queryFn: fetchSchema,
  });

  const { data: tableData, isLoading: isLoadingData } = useQuery({
    queryKey: ['tableData', selectedTable?.schema, selectedTable?.tableName, currentPage],
    queryFn: () =>
      selectedTable
        ? fetchTableData(selectedTable.schema, selectedTable.tableName, currentPage)
        : null,
    enabled: !!selectedTable,
  });

  if (isLoadingSchema) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading schema...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Database Schema
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 gap-6 p-6">
              {schema?.map((table) => (
                <div
                  key={`${table.schema}.${table.tableName}`}
                  className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTable(table)}
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {table.schema}.{table.tableName}
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nullable
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Primary Key
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {table.columns.map((column) => (
                          <tr key={column.name}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {column.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.nullable ? 'Yes' : 'No'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.isPrimaryKey ? 'Yes' : 'No'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedTable && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Table Data: {selectedTable.schema}.{selectedTable.tableName}
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {isLoadingData ? (
                <div className="p-6 text-center text-gray-500">
                  Loading table data...
                </div>
              ) : tableData ? (
                <div className="p-6">
                  <DataTable
                    data={tableData.rows}
                    columns={selectedTable.columns}
                    pageCount={tableData.totalPages}
                    currentPage={currentPage}
                    onPaginationChange={setCurrentPage}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
