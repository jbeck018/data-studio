import { useEffect, useRef } from 'react';
import type { TableNode, RelationshipEdge } from '../types/schema';
import pg from 'pg';
import { useQuerySuggestions } from '../hooks/useQuerySuggestions';
import { Button } from '../components/ui/button';
import { cn } from '../utils/cn';
import { EmptyState } from '../components/EmptyState';
import { SearchIcon } from 'lucide-react';

interface QuerySuggestionsProps {
  pool: pg.Pool;
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
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search for a query suggestion..."
          className={cn(
            'w-full px-4 py-2 text-sm',
            'bg-background text-foreground',
            'border border-border rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
            'placeholder:text-muted-foreground'
          )}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Suggested Queries
          </h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(suggestion.sql)}
                className={cn(
                  'w-full p-4 text-left rounded-lg',
                  'bg-card hover:bg-muted',
                  'border border-border',
                  'transition-colors duration-200'
                )}
              >
                <div className="text-sm text-foreground">
                  {suggestion.text}
                </div>
                <div className="mt-1 text-xs font-mono text-muted-foreground">
                  {suggestion.sql}
                </div>
                <div className="mt-1 text-xs text-muted-foreground/60">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && suggestions.length === 0 && userInput && (
        <EmptyState
          icon={SearchIcon}
          title="No suggestions found"
          description="Try a different search term"
          className="w-full"
        />
      )}

      {/* Generate full query button */}
      {userInput.trim() && !isLoading && (
        <Button
          variant="default"
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
