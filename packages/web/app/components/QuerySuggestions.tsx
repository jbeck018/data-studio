import { useEffect, useRef } from 'react';
import type { TableNode, RelationshipEdge } from '../types/schema';
import type { Pool } from 'pg';
import { useQuerySuggestions } from '../hooks/useQuerySuggestions';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

interface QuerySuggestionsProps {
  pool: Pool;
  tables: TableNode[];
  relationships: RelationshipEdge[];
  recentQueries?: string[];
  onSuggestionSelect: (sql: string) => void;
  className?: string;
}

export function QuerySuggestions({
  pool,
  tables,
  relationships,
  recentQueries,
  onSuggestionSelect,
  className,
}: QuerySuggestionsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    userInput,
    suggestions,
    isLoading,
    error,
    isInitialized,
    handleInputChange,
    handleSuggestionSelect,
    generateFullQuery,
  } = useQuerySuggestions({
    pool,
    tables,
    relationships,
    recentQueries,
    onSuggestionSelect,
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Input field with loading state */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            isInitialized
              ? 'Describe the query you want to run...'
              : 'Initializing query suggestions...'
          }
          disabled={!isInitialized}
          className={cn(
            'w-full px-4 py-2 text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary',
            'text-light-text-primary dark:text-dark-text-primary',
            'border border-light-border dark:border-dark-border rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Suggestions
          </h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-md',
                  'bg-light-bg-secondary dark:bg-dark-bg-secondary',
                  'border border-light-border dark:border-dark-border',
                  'hover:border-primary-500 dark:hover:border-primary-500',
                  'cursor-pointer transition-colors'
                )}
                onClick={() => handleSuggestionSelect(suggestion.sql)}
              >
                <div className="text-sm text-light-text-primary dark:text-dark-text-primary">
                  {suggestion.text}
                </div>
                <div className="mt-1 text-xs font-mono text-light-text-secondary dark:text-dark-text-secondary">
                  {suggestion.sql}
                </div>
                <div className="mt-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate full query button */}
      {userInput.trim() && !isLoading && (
        <Button
          variant="primary"
          size="sm"
          onClick={async () => {
            const query = await generateFullQuery();
            if (query) {
              onSuggestionSelect(query.sql);
            }
          }}
          disabled={!isInitialized}
          className="w-full"
        >
          Generate Full Query
        </Button>
      )}
    </div>
  );
}
