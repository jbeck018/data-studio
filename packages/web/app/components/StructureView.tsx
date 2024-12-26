import type { TableSchema } from "../types";
import { TableStructure } from "./TableStructure";

interface StructureViewProps {
  schema: TableSchema;
  onSave: (updatedSchema: TableSchema) => Promise<void>;
}

export function StructureView({ schema, onSave }: StructureViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <TableStructure table={schema} onSave={onSave} />
      </div>
    </div>
  );
}
