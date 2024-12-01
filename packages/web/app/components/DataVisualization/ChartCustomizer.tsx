import { type ChartType, type ChartData } from './ChartComponent';

interface ChartCustomizerProps {
  chartData: ChartData;
  onUpdate: (updatedData: ChartData) => void;
}

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
];

const COLOR_PRESETS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
];

export function ChartCustomizer({ chartData, onUpdate }: ChartCustomizerProps) {
  const { chartType, xField, yField, title, color } = chartData;

  const handleChartTypeChange = (newType: ChartType) => {
    onUpdate({ ...chartData, chartType: newType });
  };

  const handleColorChange = (newColor: string) => {
    onUpdate({ ...chartData, color: newColor });
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ ...chartData, title: newTitle });
  };

  return (
    <div className="space-y-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
      <div>
        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          Chart Type
        </label>
        <div className="flex flex-wrap gap-2">
          {CHART_TYPE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleChartTypeChange(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                chartType === option.value
                  ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
                  : 'bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          Chart Title
        </label>
        <input
          type="text"
          value={title || ''}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Enter chart title"
          className="w-full px-3 py-2 rounded-md bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map(presetColor => (
            <button
              key={presetColor}
              onClick={() => handleColorChange(presetColor)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === presetColor
                  ? 'border-primary-500 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: presetColor }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer"
          />
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
