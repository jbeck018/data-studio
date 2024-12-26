import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import type { ColumnSchema, TableSchema } from "~/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Dialog } from "@radix-ui/react-dialog";
import { Input } from "~/components/ui/input";

interface DataViewProps {
  table: TableSchema;
  onRefresh?: () => void;
}

export function DataView({ table, onRefresh }: DataViewProps) {
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleRowClick = useCallback((row: Record<string, any>) => {
    setSelectedRow(row);
  }, []);

  const handleCreateRow = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const handleCloseDetails = useCallback(() => {
    setSelectedRow(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{table.name}</h2>
          <Button onClick={handleCreateRow}>Create Row</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {table.columns.map((column) => (
                <th
                  key={column.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add table rows here */}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateRowModal
          columns={table.columns}
          onClose={handleCloseModal}
          onSubmit={handleCloseModal}
        />
      )}

      {selectedRow && (
        <RowDetailsSidebar
          row={selectedRow}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

interface CreateRowModalProps {
  columns: ColumnSchema[];
  onClose: () => void;
  onSubmit: () => void;
}

function CreateRowModal({ columns, onClose, onSubmit }: CreateRowModalProps) {
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <h3 className="text-lg font-semibold mb-4">Create New Row</h3>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column.name}>
                  <label className="block text-sm font-medium text-gray-700">
                    {column.name}
                  </label>
                  <Input
                    type="text"
                    className="mt-1"
                    placeholder={`Enter ${column.name}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

interface RowDetailsSidebarProps {
  row: Record<string, any>;
  onClose: () => void;
}

function RowDetailsSidebar({ row, onClose }: RowDetailsSidebarProps) {
  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Row Details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(row).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {key}
              </label>
              <Input
                type="text"
                readOnly
                value={String(value)}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
