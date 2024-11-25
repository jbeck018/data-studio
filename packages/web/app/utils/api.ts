import type { QueryRequest, TableDataResponse, TableSchema } from '~/types';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

export async function fetchSchema(): Promise<TableSchema[]> {
  const response = await fetch(`${API_BASE}/schema`);
  if (!response.ok) {
    throw new Error('Failed to fetch schema');
  }
  return response.json();
}

export async function fetchTableData(
  tableName: string,
  page: number = 1,
  pageSize: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<TableDataResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  const response = await fetch(`${API_BASE}/tables/${tableName}/data?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch table data');
  }
  return response.json();
}

export async function executeQuery(query: QueryRequest): Promise<any> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });
  
  if (!response.ok) {
    throw new Error('Failed to execute query');
  }
  return response.json();
}

export async function insertRow(tableName: string, data: any): Promise<void> {
  const response = await fetch(`${API_BASE}/tables/${tableName}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to insert row');
  }
}

export async function updateRow(tableName: string, id: string | number, data: any): Promise<void> {
  const response = await fetch(`${API_BASE}/tables/${tableName}/data/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update row');
  }
}

export async function deleteRow(tableName: string, id: string | number): Promise<void> {
  const response = await fetch(`${API_BASE}/tables/${tableName}/data/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete row');
  }
}
