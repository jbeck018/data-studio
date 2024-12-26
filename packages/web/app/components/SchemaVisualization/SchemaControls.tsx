import { useCallback } from 'react';
import { LayoutType } from '../../types/schema';

interface SchemaControlsProps {
  selectedLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onSearch?: (term: string) => void;
}

const SchemaControls = ({ selectedLayout, onLayoutChange, onSearch }: SchemaControlsProps) => {
  const handleLayoutChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onLayoutChange(e.target.value as LayoutType);
    },
    [onLayoutChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch?.(e.target.value);
    },
    [onSearch]
  );

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-4">
      <select
        value={selectedLayout}
        onChange={handleLayoutChange}
        className="bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded px-2 py-1"
      >
        <option value="auto">Auto Layout</option>
        <option value="force">Force Layout</option>
        <option value="circular">Circular Layout</option>
        <option value="horizontal">Horizontal Layout</option>
        <option value="vertical">Vertical Layout</option>
      </select>
      {onSearch && (
        <input
          type="text"
          placeholder="Search tables..."
          onChange={handleSearchChange}
          className="bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded px-2 py-1"
        />
      )}
    </div>
  );
};

export default SchemaControls;
