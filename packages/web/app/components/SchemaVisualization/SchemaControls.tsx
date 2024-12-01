import { useCallback, useState } from 'react';
import { Panel } from '@reactflow/core';
import { Button } from '~/components/Button';
import type { LayoutType } from '~/utils/schemaLayout';
import type { NodeStatistics } from '~/utils/schemaLayout';
import { cn } from '~/utils/cn';

interface SchemaControlsProps {
  selectedLayout: LayoutType;
  onLayoutChange: (type: LayoutType) => void;
  onReset: () => void;
  onSearch: (query: string) => void;
  onExport: () => void;
  statistics?: NodeStatistics;
  className?: string;
}

export function SchemaControls({
  selectedLayout,
  onLayoutChange,
  onReset,
  onSearch,
  onExport,
  statistics,
  className,
}: SchemaControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);

  const handleSearch = useCallback(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="mt-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
        <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
          Table Statistics
        </h3>
        
        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <h4 className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Columns: {statistics.basic.totalColumns}</div>
              <div>Primary Keys: {statistics.basic.primaryKeyCount}</div>
              <div>Foreign Keys: {statistics.basic.foreignKeyCount}</div>
              <div>Nullable: {statistics.basic.nullableColumns}</div>
              <div>Unique: {statistics.basic.uniqueConstraints}</div>
              <div>Indexes: {statistics.basic.indexCount}</div>
            </div>
          </div>

          {/* Relationships */}
          <div>
            <h4 className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Relationships
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Incoming: {statistics.relationships.incomingCount}</div>
              <div>Outgoing: {statistics.relationships.outgoingCount}</div>
              <div>Total Related: {statistics.relationships.totalRelated}</div>
              <div>One-to-One: {statistics.relationships.relationshipTypes.oneToOne}</div>
              <div>One-to-Many: {statistics.relationships.relationshipTypes.oneToMany}</div>
              <div>Many-to-Many: {statistics.relationships.relationshipTypes.manyToMany}</div>
            </div>
          </div>

          {/* Complexity Scores */}
          <div>
            <h4 className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Complexity Metrics
            </h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs flex-1">Relationship Complexity</span>
                <div className="w-24 h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${statistics.complexity.relationshipComplexity * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs flex-1">Schema Complexity</span>
                <div className="w-24 h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${statistics.complexity.schemaComplexity * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs flex-1">Centrality Score</span>
                <div className="w-24 h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${statistics.complexity.centralityScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Panel position="top-right" className={cn('p-4 max-w-md', className)}>
      <div className="space-y-4">
        {/* Layout Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedLayout}
            onChange={(e) => onLayoutChange(e.target.value as LayoutType)}
            className="flex-1 px-3 py-1.5 text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="auto">Auto Layout</option>
            <option value="horizontal">Horizontal Tree</option>
            <option value="vertical">Vertical Tree</option>
            <option value="circular">Circular</option>
            <option value="force">Force-Directed</option>
            <option value="custom">Custom</option>
          </select>

          <Button variant="secondary" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables and columns..."
            className="flex-1 px-3 py-1.5 text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="flex-1"
          >
            {showStats ? 'Hide Statistics' : 'Show Statistics'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            className="flex-1"
          >
            Export Schema
          </Button>
        </div>

        {/* Statistics Panel */}
        {showStats && renderStatistics()}
      </div>
    </Panel>
  );
}
