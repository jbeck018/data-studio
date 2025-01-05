import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { QueryField } from "~/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "~/components/ui/sheet";

interface RowDetailsSidebarProps {
  row: Record<string, any> | null;
  onClose: () => void;
  fields: QueryField[];
}

export function RowDetailsSidebar({
  row,
  onClose,
  fields,
}: RowDetailsSidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const sidebarContent = (
    <Sheet open={!!row} onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Row Details</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          <div className="mt-6 divide-y divide-gray-200">
            {fields.map((field) => (
              <div key={field.name} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {field.name}
                    </div>
                    <div className="text-xs text-gray-500">{field.dataType}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatValue(row?.[field.name])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );

  return createPortal(sidebarContent, document.body);
}

function formatValue(value: any): string {
  if (value === null) return "NULL";
  if (value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
