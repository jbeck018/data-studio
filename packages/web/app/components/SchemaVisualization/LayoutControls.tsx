import { Button } from '../ui/button';

interface LayoutControlsProps {
  selectedLayout: string;
  onLayoutChange: (type: string) => void;
  onReset: () => void;
}

export function LayoutControls({
  selectedLayout,
  onLayoutChange,
  onReset,
}: LayoutControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-light-bg-current dark:bg-dark-bg-current rounded-lg shadow-lg p-2">
      <select
        value={selectedLayout}
        onChange={(e) => onLayoutChange(e.target.value)}
        className="px-3 py-1.5 text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="auto">Auto Layout</option>
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
        <option value="custom">Custom</option>
      </select>

      <Button
        variant="secondary"
        size="sm"
        onClick={onReset}
      >
        Reset Layout
      </Button>
    </div>
  );
}
