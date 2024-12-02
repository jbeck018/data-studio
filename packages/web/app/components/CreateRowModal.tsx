import { useState } from "react";
import type { TableSchema } from "../types";
import { Button } from "./Button";

interface CreateRowModalProps {
  tableName: string;
  fields: TableSchema["columns"];
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function CreateRowModal({ tableName, fields, onClose, onSubmit }: CreateRowModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Create Row in {tableName}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.name}
                    {!field.nullable && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    name={field.name}
                    id={field.name}
                    required={!field.nullable}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
              ))}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center sm:col-start-2"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="mt-3 inline-flex w-full justify-center sm:col-start-1 sm:mt-0"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
