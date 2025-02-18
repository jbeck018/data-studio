import { useState } from 'react';
import type { SavedChart } from '../../utils/chartStorage';
import { saveChart, updateChart } from '../../utils/chartStorage';
import { Button } from '../ui/button';
import type { ChartData } from './ChartComponent';

interface ChartSaveModalProps {
  chart: ChartData;
  existingChart?: SavedChart;
  onSave: (savedChart: SavedChart) => void;
  onClose: () => void;
}

export function ChartSaveModal({
  chart,
  existingChart,
  onSave,
  onClose,
}: ChartSaveModalProps) {
  const [name, setName] = useState(existingChart?.name || '');
  const [description, setDescription] = useState(existingChart?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Chart name is required');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      query: chart.query,
      visualization: chart.visualization,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          {existingChart ? 'Update Chart' : 'Save Chart'}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="chart-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Chart Name *
            </label>
            <input
              id="chart-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter chart name"
            />
          </div>

          <div>
            <label
              htmlFor="chart-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              id="chart-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter chart description"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-md bg-background text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {existingChart ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
