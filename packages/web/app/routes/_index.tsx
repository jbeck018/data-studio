import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { fetchSchema } from "~/utils/api";
import { TableList } from "~/components/TableList";
import { PageContainer } from "~/components/PageContainer";

export const meta: MetaFunction = () => {
  return [
    { title: "Data Studio" },
    { name: "description", content: "Database management studio" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const tables = await fetchSchema();
    return json({ tables });
  } catch (error) {
    console.error('Error loading tables:', error);
    return json({ tables: [] });
  }
}

export default function Index() {
  const { tables } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <TableList tables={filteredTables} />
      </div>
    </PageContainer>
  );
}
