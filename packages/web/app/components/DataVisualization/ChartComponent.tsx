import { useMemo } from 'react';
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
  AreaChart,
  Area,
  Cell,
  ComposedChart,
} from 'recharts';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'stacked-bar' | 'bubble' | 'heatmap';

export interface ChartData {
  queryId?: string;
  values: Record<string, any>[];
  xField: string;
  yField: string;
  chartType: ChartType;
  title?: string;
  zField?: string; // For bubble charts
  stackedFields?: string[]; // For stacked bar charts
  customColors?: string[];
}

interface ChartComponentProps {
  data: ChartData;
  height?: number;
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

export function ChartComponent({ data, height = 400 }: ChartComponentProps) {
  const { values, xField, yField, chartType, title, zField, stackedFields, customColors } = data;
  const colors = customColors || DEFAULT_COLORS;

  const chartData = useMemo(() => {
    if (!values || values.length === 0) return [];
    
    if (chartType === 'heatmap') {
      // Create correlation matrix for numeric fields
      const numericFields = Object.keys(values[0]).filter(field => 
        !isNaN(Number(values[0][field]))
      );
      
      return numericFields.flatMap((field1, i) => 
        numericFields.slice(i + 1).map(field2 => {
          const correlation = calculateCorrelation(
            values.map(v => Number(v[field1])),
            values.map(v => Number(v[field2]))
          );
          return {
            field1,
            field2,
            correlation
          };
        })
      );
    }

    return values;
  }, [values, xField, yField, chartType]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        No data available
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yField} fill={colors[0]} />
          </BarChart>
        );

      case 'stacked-bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Legend />
            {stackedFields?.map((field, index) => (
              <Bar
                key={field}
                dataKey={field}
                stackId="stack"
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yField} stroke={colors[0]} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yField} fill={colors[0]} stroke={colors[0]} />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={yField}
              nameKey={xField}
              cx="50%"
              cy="50%"
              outerRadius={height ? height * 0.4 : 160}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} type="number" />
            <YAxis dataKey={yField} type="number" />
            <Tooltip />
            <Legend />
            <Scatter name={`${xField} vs ${yField}`} data={chartData} fill={colors[0]} />
          </ScatterChart>
        );

      case 'bubble':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} type="number" />
            <YAxis dataKey={yField} type="number" />
            <Tooltip />
            <Legend />
            <Scatter
              name={`${xField} vs ${yField}`}
              data={chartData}
              fill={colors[0]}
              shape="circle"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colors[index % colors.length]}
                  r={zField ? Math.sqrt(entry[zField as keyof typeof entry] as number) * 2 : 5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        );

      case 'heatmap':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 grid"
                 style={{
                   gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(chartData.length))}, 1fr)`,
                   gap: '1px'
                 }}>
              {chartData.map((cell, index) => {
                const intensity = (cell.correlation + 1) / 2; // normalize from [-1,1] to [0,1]
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center p-2 text-xs"
                    style={{
                      backgroundColor: `rgba(66, 146, 198, ${intensity})`,
                      color: intensity > 0.6 ? 'white' : 'black'
                    }}
                    title={`${cell.field1} vs ${cell.field2}: ${cell.correlation.toFixed(2)}`}
                  >
                    {cell.correlation.toFixed(2)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-center text-lg font-medium mb-4 text-light-text-primary dark:text-dark-text-primary">
          {title}
        </h3>
      )}
      <div style={{ width: '100%', height: height || 400 }}>
        <ResponsiveContainer>
          {renderChart() || <p>Error rendering chart</p>}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b) / n;
  const meanY = y.reduce((a, b) => a + b) / n;
  
  const numerator = x.reduce((sum, xi, i) => 
    sum + (xi - meanX) * (y[i] - meanY), 0
  );
  
  const denomX = Math.sqrt(x.reduce((sum, xi) => 
    sum + Math.pow(xi - meanX, 2), 0
  ));
  
  const denomY = Math.sqrt(y.reduce((sum, yi) => 
    sum + Math.pow(yi - meanY, 2), 0
  ));
  
  return numerator / (denomX * denomY);
}
