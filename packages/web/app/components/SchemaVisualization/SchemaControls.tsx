import { ChangeEvent, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LayoutType } from '../../types/schema';

interface SchemaControlsProps {
  selectedLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onSearch?: (term: string) => void;
}

export default function SchemaControls({
  selectedLayout,
  onLayoutChange,
  onSearch,
}: SchemaControlsProps) {
  const handleLayoutChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onLayoutChange(e.target.value as LayoutType);
    },
    [onLayoutChange]
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onSearch?.(e.target.value);
    },
    [onSearch]
  );

  return (
    <div className="flex gap-4 p-4 border-b">
      <Select value={selectedLayout} onValueChange={handleLayoutChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select layout" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto Layout</SelectItem>
          <SelectItem value="force">Force-Directed</SelectItem>
          <SelectItem value="circular">Circular</SelectItem>
          <SelectItem value="horizontal">Horizontal Tree</SelectItem>
          <SelectItem value="vertical">Vertical Tree</SelectItem>
        </SelectContent>
      </Select>

      {onSearch && (
        <Input
          type="text"
          placeholder="Search tables and columns..."
          onChange={handleSearchChange}
          className="w-[300px]"
        />
      )}
    </div>
  );
}
