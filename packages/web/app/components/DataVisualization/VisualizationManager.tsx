import { useMemo, useState } from 'react';
import type { SavedChart } from '../../utils/chartStorage';
import { deleteChart, loadSavedCharts } from '../../utils/chartStorage';
import { Button } from '../ui/button';
import type { ChartData, ChartType } from './ChartComponent';
import { ChartComponent } from './ChartComponent';
import { ChartCustomizer } from './ChartCustomizer';
import { ChartSaveModal } from './ChartSaveModal';
import { type DataInsight, SmartVisualization } from './SmartVisualization';

export interface Column {
  name: string;
  type: string;
}

export interface QueryResult {
  columns: Column[];
  rows: Record<string, any>[];
}

interface VisualizationManagerProps {
  queryResult: QueryResult;
  queryId?: string;
}

function isNumeric(type: string): boolean {
  return ['integer', 'decimal', 'float', 'double', 'numeric', 'real'].includes(type.toLowerCase());
}

function isDateType(type: string): boolean {
  return ['date', 'timestamp', 'timestamptz'].includes(type.toLowerCase());
}

function isCategorical(values: any[], threshold = 20): boolean {
  const uniqueValues = new Set(values);
  return uniqueValues.size <= threshold;
}

function analyzeData(queryResult: QueryResult): ChartData[] {
  const { columns, rows } = queryResult;
  const suggestions: ChartData[] = [];

  // Find columns by type
  const numericColumns = columns.filter(col => isNumeric(col.type));
  const dateColumns = columns.filter(col => isDateType(col.type));
  const categoricalColumns = columns.filter(col => 
    !isNumeric(col.type) && !isDateType(col.type) &&
    isCategorical(rows.map(row => row[col.name]))
  );

  // Time series charts (line and area)
  dateColumns.forEach(dateCol => {
    numericColumns.forEach(numCol => {
      // Line chart
      suggestions.push({
        values: rows,
        xField: dateCol.name,
        yField: numCol.name,
        chartType: 'line',
        title: `${numCol.name} over time`,
      });

      // Area chart
      suggestions.push({
        values: rows,
        xField: dateCol.name,
        yField: numCol.name,
        chartType: 'area',
        title: `${numCol.name} area over time`,
      });
    });
  });

  // Bar and stacked bar charts for categorical data
  categoricalColumns.forEach(catCol => {
    numericColumns.forEach(numCol => {
      // Regular bar chart
      const aggregatedData = rows.reduce((acc, row) => {
        const category = row[catCol.name];
        if (!acc[category]) {
          acc[category] = { count: 0, sum: 0 };
        }
        acc[category].count++;
        acc[category].sum += Number(row[numCol.name]) || 0;
        return acc;
      }, {} as Record<string, { count: number; sum: number }>);

      const chartData = Object.entries(aggregatedData).map(([category, data]) => ({
        [catCol.name]: category,
        [numCol.name]: data.sum / data.count, // average
      }));

      suggestions.push({
        values: chartData,
        xField: catCol.name,
        yField: numCol.name,
        chartType: 'bar',
        title: `Average ${numCol.name} by ${catCol.name}`,
      });

      // Stacked bar chart when multiple numeric columns exist
      if (numericColumns.length > 1) {
        suggestions.push({
          values: rows,
          xField: catCol.name,
          yField: numCol.name,
          chartType: 'stacked-bar',
          stackedFields: numericColumns.slice(0, 3).map(col => col.name), // Limit to 3 fields for readability
          title: `Stacked ${numCol.name} by ${catCol.name}`,
        });
      }
    });
  });

  // Pie charts for categorical columns
  categoricalColumns.forEach(catCol => {
    const aggregatedData = rows.reduce((acc, row) => {
      const category = row[catCol.name];
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(aggregatedData).map(([category, count]) => ({
      [catCol.name]: category,
      count,
    }));

    if (Object.keys(aggregatedData).length <= 10) {
      suggestions.push({
        values: chartData,
        xField: catCol.name,
        yField: 'count',
        chartType: 'pie',
        title: `Distribution of ${catCol.name}`,
      });
    }
  });

  // Scatter and bubble charts for numeric pairs
  if (numericColumns.length >= 2) {
    for (let i = 0; i < numericColumns.length - 1; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        // Scatter plot
        suggestions.push({
          values: rows,
          xField: numericColumns[i].name,
          yField: numericColumns[j].name,
          chartType: 'scatter',
          title: `${numericColumns[i].name} vs ${numericColumns[j].name}`,
        });

        // Bubble chart with a third numeric dimension
        if (numericColumns.length > 2) {
          const zField = numericColumns.find((_, idx) => idx !== i && idx !== j)?.name;
          if (zField) {
            suggestions.push({
              values: rows,
              xField: numericColumns[i].name,
              yField: numericColumns[j].name,
              zField,
              chartType: 'bubble',
              title: `${numericColumns[i].name} vs ${numericColumns[j].name} (size: ${zField})`,
            });
          }
        }
      }
    }
  }

  // Heatmap for correlation matrix (when multiple numeric columns exist)
  if (numericColumns.length > 2) {
    suggestions.push({
      values: rows,
      xField: 'field1',
      yField: 'field2',
      chartType: 'heatmap',
      title: 'Correlation Matrix',
    });
  }

  return suggestions;
}

export function VisualizationManager({ queryResult, queryId }: VisualizationManagerProps) {
  const suggestions = useMemo(() => analyzeData(queryResult), [queryResult]);
  const [selectedChart, setSelectedChart] = useState<ChartData | SavedChart | null>(
    suggestions.length > 0 ? suggestions[0] : null
  );
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(() => loadSavedCharts());
  const [selectedSavedChart, setSelectedSavedChart] = useState<SavedChart | null>(null);

  const handleSaveChart = (savedChart: SavedChart) => {
    setSavedCharts(loadSavedCharts());
    setSelectedSavedChart(savedChart);
  };

  const handleDeleteChart = (chartId: string) => {
    if (deleteChart(chartId)) {
      setSavedCharts(loadSavedCharts());
      if (selectedSavedChart?.id === chartId) {
        setSelectedSavedChart(null);
      }
    }
  };

  const handleChartSelect = (chart: ChartData | SavedChart) => {
    setSelectedChart(chart);
    if ('id' in chart) {
      setSelectedSavedChart(chart);
    } else {
      setSelectedSavedChart(null);
    }
  };

  if (!suggestions.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        No visualizations available for this query result
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Smart Insights */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Smart Insights
        </h2>
        <SmartVisualization 
          queryResult={queryResult}
          onInsightFound={(insight: DataInsight) => {
            // Optionally handle insights, e.g., save them or show notifications
            console.log('Found insight:', insight);
          }}
        />
      </div>

      {/* Manual Visualization */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Custom Visualizations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((chartData, index) => (
            <Button
              key={`${chartData.chartType}-${index}`}
              onClick={() => handleChartSelect(chartData)}
              className={`p-4 rounded-lg border transition-colors ${
                selectedChart === chartData
                  ? 'border-primary-500 bg-current-50 dark:bg-current-900/20'
                  : 'border-light-border dark:border-dark-border hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary'
              }`}
            >
              <ChartComponent data={chartData} height={200} />
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {suggestions.length} suggested visualizations
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary rounded-md transition-colors"
          >
            {showCustomizer ? 'Hide Customizer' : 'Customize Chart'}
          </Button>
          {selectedChart && (
            <Button
              onClick={() => setShowSaveModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-current-600 hover:bg-current-700 rounded-md transition-colors"
            >
              Save Chart
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={showCustomizer ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {selectedChart && (
            <ChartComponent
              key={`${selectedChart.chartType}-${selectedChart.xField}-${selectedChart.yField}`}
              data={selectedChart}
              height={400}
            />
          )}
        </div>
        
        {showCustomizer && selectedChart && (
          <div className="lg:col-span-1">
            <ChartCustomizer
              chartData={selectedChart}
              onUpdate={setSelectedChart}
            />
          </div>
        )}
      </div>

      {savedCharts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Saved Charts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCharts.map((chart) => (
              <div
                key={chart.id}
                className="relative group rounded-lg border border-light-border dark:border-dark-border p-4"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChart(chart.id);
                    }}
                    className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400"
                  >
                    <span className="sr-only">Delete chart</span>
                    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                <Button
                  onClick={() => handleChartSelect(chart)}
                  className="w-full text-left"
                >
                  <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                    {chart.name}
                  </h4>
                  {chart.description && (
                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {chart.description}
                    </p>
                  )}
                  <div className="mt-2">
                    <ChartComponent data={chart} height={150} />
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSaveModal && selectedChart && (
        <ChartSaveModal
          chart={{ ...selectedChart, queryId }}
          existingChart={selectedSavedChart || undefined}
          onSave={handleSaveChart}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
