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
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name for the chart');
      return;
    }

    try {
      let savedChart: SavedChart;
      if (existingChart) {
        savedChart = updateChart(existingChart.id, {
          ...chart,
          name,
          description,
        })!;
      } else {
        savedChart = saveChart({
          ...chart,
          name,
          description,
        });
      }
      onSave(savedChart);
      onClose();
    } catch (err) {
      setError('Failed to save chart. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {existingChart ? 'Update Chart' : 'Save Chart'}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="chart-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Chart Name *
            </label>
            <input
              id="chart-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Enter chart name"
            />
          </div>

          <div>
            <label
              htmlFor="chart-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="chart-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Enter chart description"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              {existingChart ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
