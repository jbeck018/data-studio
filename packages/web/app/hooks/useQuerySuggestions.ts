import { useState, useCallback, useEffect } from 'react';
import type { TableNode, RelationshipEdge } from '~/types/schema';
import type { Pool } from 'pg';
import { createPgAI } from '~/utils/pgAI';
import { createQueryGenerator } from '~/utils/queryGenerator';

interface UseQuerySuggestionsOptions {
  pool: Pool;
  tables: TableNode[];
  relationships: RelationshipEdge[];
  recentQueries?: string[];
  onSuggestionSelect?: (sql: string) => void;
}

export function useQuerySuggestions({
  pool,
  tables,
  relationships,
  recentQueries = [],
  onSuggestionSelect,
}: UseQuerySuggestionsOptions) {
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ text: string; sql: string; confidence: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize pg_ai and query generator
  const [queryGenerator] = useState(() => {
    const pgAI = createPgAI(pool);
    return createQueryGenerator(pgAI);
  });

  // Initialize pg_ai extension and tables
  useEffect(() => {
    const initialize = async () => {
      try {
        const pgAI = createPgAI(pool);
        await pgAI.initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize pg_ai:', err);
        setError('Failed to initialize query suggestions system');
      }
    };

    initialize();
  }, [pool]);

  // Update schema context when tables or relationships change
  useEffect(() => {
    if (!isInitialized) return;

    queryGenerator.updateSchemaContext(tables, relationships)
      .catch(err => {
        console.error('Failed to update schema context:', err);
        setError('Failed to initialize query suggestions');
      });
  }, [isInitialized, tables, relationships, queryGenerator]);

  const getSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || !isInitialized) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSuggestions = await queryGenerator.generateQuerySuggestions({
        tables,
        relationships,
        recentQueries,
        userInput: input,
      });

      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Failed to generate query suggestions:', err);
      setError('Failed to generate suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, tables, relationships, recentQueries, queryGenerator]);

  const generateFullQuery = useCallback(async () => {
    if (!userInput.trim() || !isInitialized) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryGenerator.generateQuery({
        tables,
        relationships,
        recentQueries,
        userInput,
      });

      return result;
    } catch (err) {
      console.error('Failed to generate query:', err);
      setError('Failed to generate query');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, tables, relationships, recentQueries, userInput, queryGenerator]);

  const handleInputChange = useCallback((input: string) => {
    setUserInput(input);
    getSuggestions(input);
  }, [getSuggestions]);

  const handleSuggestionSelect = useCallback((sql: string) => {
    onSuggestionSelect?.(sql);
  }, [onSuggestionSelect]);

  return {
    userInput,
    suggestions,
    isLoading,
    error,
    isInitialized,
    handleInputChange,
    handleSuggestionSelect,
    generateFullQuery,
  };
}
