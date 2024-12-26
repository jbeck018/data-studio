import { Fragment, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import type { ColumnSchema } from "~/types";

interface CreateRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  columns: ColumnSchema[];
}

export function CreateRowModal({
  isOpen,
  onClose,
  onSubmit,
  columns,
}: CreateRowModalProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    onClose();
  };

  const handleInputChange = (columnName: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Row</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {columns.map((column) => (
            <div key={column.name} className="space-y-2">
              <Label>
                {column.name}
                {!column.isNullable && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              {renderInput(column, values[column.name], (value) =>
                handleInputChange(column.name, value)
              )}
              {column.isNullable && (
                <div className="text-xs text-gray-500">Optional</div>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function renderInput(
  column: ColumnSchema,
  value: any,
  onChange: (value: any) => void
) {
  const dataType = column.dataType.toLowerCase();

  if (dataType.includes("bool")) {
    return (
      <Switch
        checked={value ?? false}
        onCheckedChange={onChange}
      />
    );
  }

  if (dataType.includes("text") || dataType.includes("char")) {
    if (dataType.includes("long") || dataType.includes("var")) {
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${column.name}`}
        />
      );
    }
    return (
      <Input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${column.name}`}
      />
    );
  }

  if (
    dataType.includes("int") ||
    dataType.includes("decimal") ||
    dataType.includes("numeric") ||
    dataType.includes("float") ||
    dataType.includes("double")
  ) {
    return (
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        placeholder={`Enter ${column.name}`}
      />
    );
  }

  if (dataType.includes("date")) {
    if (dataType.includes("time")) {
      return (
        <Input
          type="datetime-local"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    return (
      <Input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (dataType.includes("time")) {
    return (
      <Input
        type="time"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Default to text input for unknown types
  return (
    <Input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${column.name}`}
    />
  );
}
