import { Button } from '../ui/button';
import { type ChartData, type ChartType } from './ChartComponent';

interface ChartCustomizerProps {
  chartData: ChartData;
  onUpdate: (updatedData: ChartData) => void;
}

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'area', label: 'Area Chart' },
  { value: 'stacked-bar', label: 'Stacked Bar Chart' },
  { value: 'bubble', label: 'Bubble Chart' },
  { value: 'heatmap', label: 'Heat Map' },
];

export function ChartCustomizer({ chartData, onUpdate }: ChartCustomizerProps) {
  const { chartType, xField, yField, title, customColors = [] } = chartData;

  const handleChartTypeChange = (newType: ChartType) => {
    onUpdate({ ...chartData, chartType: newType });
  };

  const handleColorChange = (newColor: string, index: number) => {
    const newColors = [...(customColors || [])];
    newColors[index] = newColor;
    onUpdate({ ...chartData, customColors: newColors });
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ ...chartData, title: newTitle });
  };

  return (
    <div className="space-y-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
      <div>
        <p className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          Chart Type
        </p>
        <div className="flex flex-wrap gap-2">
          {CHART_TYPE_OPTIONS.map(option => (
            <Button
              key={option.value}
              onClick={() => handleChartTypeChange(option.value)}
              className={`px-3 py-1 rounded-md text-sm ${
                chartType === option.value
                  ? 'bg-current text-white'
                  : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title || ''}
          onChange={e => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter chart title"
        />
      </div>

      <div>
        <label htmlFor="colors" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, index) => (
            <input
              key={index}
              type="color"
              value={customColors[index] || '#000000'}
              onChange={e => handleColorChange(e.target.value, index)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
            X-Axis
          </label>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {xField}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
            Y-Axis
          </label>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {yField}
          </div>
        </div>
      </div>
    </div>
  );
}
