import { useState } from "react";
import type { TableSchema, Column } from "~/types";

interface TableStructureProps {
  schema: TableSchema;
  onSave?: (updatedSchema: TableSchema) => Promise<void>;
  readOnly?: boolean;
}

export function TableStructure({ schema, onSave, readOnly = false }: TableStructureProps) {
  const [editingSchema, setEditingSchema] = useState<TableSchema>(schema);
  const [isEditing, setIsEditing] = useState(false);

  const handleColumnChange = (index: number, field: keyof Column, value: string | boolean) => {
    const newColumns = [...editingSchema.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setEditingSchema({ ...editingSchema, columns: newColumns });
  };

  const addColumn = () => {
    const newColumn: Column = {
      name: "",
      type: "text",
      nullable: true,
    };
    setEditingSchema({
      ...editingSchema,
      columns: [...editingSchema.columns, newColumn],
    });
  };

  const removeColumn = (index: number) => {
    const newColumns = editingSchema.columns.filter((_, i) => i !== index);
    setEditingSchema({ ...editingSchema, columns: newColumns });
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(editingSchema);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditingSchema(schema);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Table Structure
        </h2>
        {!readOnly && (
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Edit Structure
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Column Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nullable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Default Value
              </th>
              {isEditing && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {editingSchema.columns.map((column, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => handleColumnChange(index, "name", e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{column.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <select
                      value={column.type}
                      onChange={(e) => handleColumnChange(index, "type", e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="text">Text</option>
                      <option value="integer">Integer</option>
                      <option value="boolean">Boolean</option>
                      <option value="timestamp">Timestamp</option>
                      <option value="numeric">Numeric</option>
                    </select>
                  ) : (
                    <span className="text-gray-900 dark:text-white">{column.type}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={column.nullable}
                      onChange={(e) => handleColumnChange(index, "nullable", e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">
                      {column.nullable ? "Yes" : "No"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={column.defaultValue || ""}
                      onChange={(e) => handleColumnChange(index, "defaultValue", e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">
                      {column.defaultValue || "-"}
                    </span>
                  )}
                </td>
                {isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => removeColumn(index)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <button
          onClick={addColumn}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Add Column
        </button>
      )}

      {schema.primaryKey && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Primary Key</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {schema.primaryKey.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
