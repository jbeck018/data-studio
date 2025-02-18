import { useMemo } from 'react';
import type { QueryResult } from './VisualizationManager';
import { ChartComponent, type ChartData, type ChartType } from './ChartComponent';

interface SmartVisualizationProps {
  queryResult: QueryResult;
  onInsightFound?: (insight: DataInsight) => void;
}

export interface DataInsight {
  type: 'anomaly' | 'correlation' | 'trend' | 'distribution';
  description: string;
  confidence: number;
  visualization?: ChartData;
}

interface ColumnProfile {
  name: string;
  type: string;
  uniqueCount: number;
  nullCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  mode?: any;
  distribution?: Record<string, number>;
  outliers?: number[];
}

function profileData(queryResult: QueryResult): ColumnProfile[] {
  const { columns, rows } = queryResult;
  
  return columns.map(column => {
    const values = rows.map(row => row[column.name]).filter((val): val is number | string => val != null);
    const profile: ColumnProfile = {
      name: column.name,
      type: column.type,
      uniqueCount: new Set(values).size,
      nullCount: rows.length - values.length,
    };

    if (isNumeric(column.type)) {
      const numericValues = values.map(val => typeof val === 'number' ? val : Number(val));
      profile.min = Math.min(...numericValues);
      profile.max = Math.max(...numericValues);
      profile.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      
      // Calculate outliers using IQR method
      const sorted = [...numericValues].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      profile.outliers = numericValues.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
    } else if (isDateType(column.type)) {
      const dateValues = values.map(v => new Date(v));
      profile.min = dateValues.reduce((min, curr) => curr < new Date(min) ? curr.toISOString() : min.toString(), dateValues[0].toISOString());
      profile.max = dateValues.reduce((max, curr) => curr > new Date(max) ? curr.toISOString() : max.toString(), dateValues[0].toISOString());
    } else {
      // Categorical data
      profile.distribution = values.reduce((acc, val) => {
        acc[val.toString()] = (acc[val.toString()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Find mode
      profile.mode = Object.entries(profile.distribution)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    return profile;
  });
}

function findInsights(profiles: ColumnProfile[], queryResult: QueryResult): DataInsight[] {
  const insights: DataInsight[] = [];
  const { rows } = queryResult;

  // Find anomalies in numeric columns
  profiles.forEach(profile => {
    if (profile.outliers && profile.outliers.length > 0) {
      insights.push({
        type: 'anomaly',
        description: `Found ${profile.outliers.length} outliers in ${profile.name}`,
        confidence: 0.8,
        visualization: {
          chartType: 'scatter',
          xField: profile.name,
          yField: 'count',
          values: profile.outliers.map(value => ({ [profile.name]: value, count: 1 })),
          title: `Outliers in ${profile.name}`
        }
      });
    }
  });

  // Find correlations between numeric columns
  const numericProfiles = profiles.filter(p => isNumeric(p.type));
  for (let i = 0; i < numericProfiles.length; i++) {
    for (let j = i + 1; j < numericProfiles.length; j++) {
      const col1 = numericProfiles[i];
      const col2 = numericProfiles[j];
      const correlation = calculateCorrelation(
        rows.map(r => Number(r[col1.name])),
        rows.map(r => Number(r[col2.name]))
      );
      
      if (Math.abs(correlation) > 0.7) {
        insights.push({
          type: 'correlation',
          description: `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.toFixed(2)}) between ${col1.name} and ${col2.name}`,
          confidence: Math.abs(correlation),
          visualization: {
            chartType: 'scatter',
            xField: col1.name,
            yField: col2.name,
            values: rows,
            title: `Correlation between ${col1.name} and ${col2.name}`
          }
        });
      }
    }
  }

  // Find trends in time series data
  const dateProfiles = profiles.filter(p => isDateType(p.type));
  const numericColumns = profiles.filter(p => isNumeric(p.type));
  
  dateProfiles.forEach(dateProfile => {
    numericColumns.forEach(numericProfile => {
      const values = rows
        .map(row => ({
          date: new Date(row[dateProfile.name]),
          value: Number(row[numericProfile.name])
        }))
        .filter(v => !isNaN(v.value) && !isNaN(v.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (values.length < 2) return;

      // Simple trend detection using linear regression
      const xValues = values.map((_, i) => i);
      const yValues = values.map(v => v.value);
      const correlation = calculateCorrelation(xValues, yValues);
      
      if (Math.abs(correlation) > 0.5) {
        insights.push({
          type: 'trend',
          description: `${correlation > 0 ? 'Upward' : 'Downward'} trend detected in ${numericProfile.name} over time`,
          confidence: Math.abs(correlation),
          visualization: {
            chartType: 'line',
            xField: dateProfile.name,
            yField: numericProfile.name,
            values: rows,
            title: `Trend in ${numericProfile.name} over time`
          }
        });
      }
    });
  });

  // Find interesting distributions
  profiles.forEach(profile => {
    if (profile.distribution) {
      const values = Object.entries(profile.distribution);
      if (values.length > 1 && values.length <= 10) {
        insights.push({
          type: 'distribution',
          description: `Distribution analysis of ${profile.name}`,
          confidence: 0.9,
          visualization: {
            chartType: 'pie',
            xField: profile.name,
            yField: 'count',
            values: values.map(([key, count]) => ({ [profile.name]: key, count })),
            title: `Distribution of ${profile.name}`
          }
        });
      }
    }
  });

  return insights;
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function isNumeric(type: string): boolean {
  return ['integer', 'decimal', 'float', 'double', 'numeric', 'real'].includes(type.toLowerCase());
}

function isDateType(type: string): boolean {
  return ['date', 'timestamp', 'timestamptz'].includes(type.toLowerCase());
}

export function SmartVisualization({ queryResult, onInsightFound }: SmartVisualizationProps) {
  const profiles = useMemo(() => profileData(queryResult), [queryResult]);
  const insights = useMemo(() => findInsights(profiles, queryResult), [profiles, queryResult]);

  // Notify parent component of insights
  useMemo(() => {
    insights.forEach(insight => onInsightFound?.(insight));
  }, [insights, onInsightFound]);

  return (
    <div className="space-y-8">
      {insights.map((insight, index) => (
        <div key={index} className="bg-current dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Insight
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {insight.description}
            </p>
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Confidence: {(insight.confidence * 100).toFixed(1)}%
            </div>
          </div>
          {insight.visualization && (
            <div className="h-80">
              <ChartComponent data={insight.visualization} height={320} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
