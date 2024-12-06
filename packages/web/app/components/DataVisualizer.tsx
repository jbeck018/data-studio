import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../utils/cn';

interface DataPoint {
  [key: string]: any;
}

interface DataVisualizerProps {
  data: DataPoint[];
  className?: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis?: string;
  metric?: string;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe',
  '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
];

export function DataVisualizer({ data, className }: DataVisualizerProps) {
  const chartConfigs = useMemo(() => {
    if (!data.length) return [];

    const configs: ChartConfig[] = [];
    const columns = Object.keys(data[0]);
    
    // Analyze data types
    const columnTypes = columns.reduce((acc, col) => {
      const value = data[0][col];
      acc[col] = typeof value;
      return acc;
    }, {} as Record<string, string>);

    // Find numeric columns
    const numericColumns = columns.filter(col => 
      columnTypes[col] === 'number' || 
      (columnTypes[col] === 'string' && !isNaN(Number(data[0][col])))
    );

    // Find categorical columns
    const categoricalColumns = columns.filter(col => 
      columnTypes[col] === 'string' && 
      isNaN(Number(data[0][col])) &&
      new Set(data.map(d => d[col])).size <= 20 // Limit to reasonable number of categories
    );

    // Bar charts for categorical vs numeric
    categoricalColumns.forEach(catCol => {
      numericColumns.forEach(numCol => {
        configs.push({
          type: 'bar',
          xAxis: catCol,
          yAxis: numCol
        });
      });
    });

    // Line charts for time-series like data
    const possibleTimeColumns = columns.filter(col => 
      columnTypes[col] === 'string' && 
      !isNaN(Date.parse(data[0][col]))
    );

    possibleTimeColumns.forEach(timeCol => {
      numericColumns.forEach(numCol => {
        configs.push({
          type: 'line',
          xAxis: timeCol,
          yAxis: numCol
        });
      });
    });

    // Pie charts for categorical distributions
    categoricalColumns.forEach(catCol => {
      configs.push({
        type: 'pie',
        xAxis: catCol,
        metric: 'count'
      });
    });

    // Scatter plots for numeric vs numeric
    if (numericColumns.length >= 2) {
      for (let i = 0; i < numericColumns.length - 1; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          configs.push({
            type: 'scatter',
            xAxis: numericColumns[i],
            yAxis: numericColumns[j]
          });
        }
      }
    }

    return configs;
  }, [data]);

  const prepareChartData = (config: ChartConfig) => {
    if (config.type === 'pie') {
      // Aggregate data for pie chart
      const counts = data.reduce((acc, item) => {
        const key = item[config.xAxis];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    if (config.type === 'bar' && config.yAxis) {
      // Aggregate data for bar chart
      const aggregated = data.reduce((acc, item) => {
        const key = item[config.xAxis];
        if (!acc[key]) {
          acc[key] = { [config.xAxis]: key, [config.yAxis as string]: 0 };
        }
        acc[key][config.yAxis as string] += Number(item[config.yAxis as string]);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(aggregated);
    }

    return data;
  };

  if (!data.length || !chartConfigs.length) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Badge variant="secondary">No visualizable data available</Badge>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("p-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {chartConfigs.map((config, index) => (
          <div key={index} className="bg-card rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium mb-4">
              {config.yAxis 
                ? `${config.yAxis} by ${config.xAxis}`
                : `Distribution of ${config.xAxis}`}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <React.Fragment>
                  {config.type === 'bar' && config.yAxis && (
                    <BarChart data={prepareChartData(config)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={config.xAxis} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={config.yAxis} fill="#8884d8" />
                    </BarChart>
                  )}
                  {config.type === 'line' && config.yAxis && (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={config.xAxis} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={config.yAxis} stroke="#8884d8" />
                    </LineChart>
                  )}
                  {config.type === 'pie' && (
                    <PieChart>
                      <Pie
                        data={prepareChartData(config)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {prepareChartData(config).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  )}
                  {config.type === 'scatter' && config.yAxis && (
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={config.xAxis} />
                      <YAxis dataKey={config.yAxis} />
                      <Tooltip />
                      <Legend />
                      <Scatter
                        name={`${config.xAxis} vs ${config.yAxis}`}
                        data={data}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  )}
                </React.Fragment>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
