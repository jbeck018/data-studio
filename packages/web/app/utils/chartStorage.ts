import type { ChartData } from '~/components/DataVisualization';

export interface SavedChart extends ChartData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  queryId?: string;
}

export interface ChartStorage {
  charts: SavedChart[];
  version: number;
}

const STORAGE_KEY = 'data-studio-saved-charts';
const CURRENT_VERSION = 1;

/**
 * Load saved charts from local storage
 */
export function loadSavedCharts(): SavedChart[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored) as ChartStorage;
    if (data.version !== CURRENT_VERSION) {
      // Handle version migrations here if needed
      return [];
    }

    return data.charts;
  } catch (error) {
    console.error('Error loading saved charts:', error);
    return [];
  }
}

/**
 * Save a chart to local storage
 */
export function saveChart(chart: Omit<SavedChart, 'id' | 'createdAt' | 'updatedAt'>): SavedChart {
  const charts = loadSavedCharts();
  const now = new Date().toISOString();
  
  const newChart: SavedChart = {
    ...chart,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const updatedCharts = [...charts, newChart];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      charts: updatedCharts,
      version: CURRENT_VERSION,
    }));
  } catch (error) {
    console.error('Error saving chart:', error);
  }

  return newChart;
}

/**
 * Update an existing saved chart
 */
export function updateChart(chartId: string, updates: Partial<SavedChart>): SavedChart | null {
  const charts = loadSavedCharts();
  const chartIndex = charts.findIndex(c => c.id === chartId);
  
  if (chartIndex === -1) {
    return null;
  }

  const updatedChart: SavedChart = {
    ...charts[chartIndex],
    ...updates,
    id: chartId, // Ensure ID cannot be changed
    updatedAt: new Date().toISOString(),
  };

  charts[chartIndex] = updatedChart;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      charts: charts,
      version: CURRENT_VERSION,
    }));
  } catch (error) {
    console.error('Error updating chart:', error);
    return null;
  }

  return updatedChart;
}

/**
 * Delete a saved chart
 */
export function deleteChart(chartId: string): boolean {
  const charts = loadSavedCharts();
  const filteredCharts = charts.filter(c => c.id !== chartId);

  if (filteredCharts.length === charts.length) {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      charts: filteredCharts,
      version: CURRENT_VERSION,
    }));
    return true;
  } catch (error) {
    console.error('Error deleting chart:', error);
    return false;
  }
}
