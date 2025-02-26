import { type CompletionContext, type CompletionResult, autocompletion } from '@codemirror/autocomplete';
import { sql } from '@codemirror/lang-sql';
import { type Diagnostic, lintGutter, linter } from '@codemirror/lint';
import { Compartment, type Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, type ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TableSchema } from '../types';
import { Button } from './ui/button';
import { Theme, useTheme } from 'remix-themes';
import { cn } from '../lib/utils';
import { PlayIcon } from 'lucide-react';

interface SQLEditorProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  onExecute?: (query: string) => void;
  schema?: TableSchema[];
  selectedTables?: Set<string>;
  databaseAliases?: { alias: string; connectionId: string }[];
  isExecuting?: boolean;
  value?: string;
  height?: string | number;
  placeholder?: string;
  onError?: (error: string | null) => void;
  className?: string;
}

// SQL Keywords for auto-completion
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
  'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE',
  'INDEX', 'VIEW', 'FUNCTION', 'TRIGGER', 'CONSTRAINT',
  'PRIMARY KEY', 'FOREIGN KEY', 'NOT NULL', 'UNIQUE', 'DEFAULT',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT',
  'AND', 'OR', 'IN', 'NOT IN', 'LIKE', 'BETWEEN',
  'ASC', 'DESC', 'LIMIT', 'OFFSET', 'AS'
];

function getSQLCompletions(context: CompletionContext, schema?: TableSchema[], databaseAliases?: { alias: string; connectionId: string }[], selectedTables?: Set<string>): CompletionResult | null {
  // Only trigger after space or when explicitly requested
  const triggerChar = context.matchBefore(/\w*$/);
  const previousChar = context.state.doc.sliceString(Math.max(0, context.pos - 1), context.pos);
  
  // Don't show completions while actively typing unless explicitly requested
  if (!context.explicit && previousChar !== ' ' && previousChar !== '.') {
    return null;
  }

  if (!triggerChar) return null;

  const textBefore = context.state.doc.sliceString(0, context.pos);
  const lastWord = textBefore.split(/\s+/).pop()?.toUpperCase() || '';

  let options = [];

  // Always include keywords but with lower boost
  options.push(...SQL_KEYWORDS.map(keyword => ({
    label: keyword,
    type: 'keyword',
    boost: 0.5
  })));

  if (schema) {
    // Add table names with higher boost after FROM or JOIN
    if (['FROM', 'JOIN', 'UPDATE', 'INTO'].includes(lastWord)) {
      options.push(...schema.map(table => ({
        label: table.name,
        type: 'type',
        boost: 2,
        info: `${table.columns.length} columns`
      })));
    }

    // Add column names with highest boost after SELECT, WHERE, ORDER BY, or after a table name
    const isAfterTable = schema.some(table => lastWord === table.name.toUpperCase());
    if (['SELECT', 'WHERE', 'BY', 'ON'].includes(lastWord) || isAfterTable || previousChar === '.') {
      schema.forEach(table => {
        table.columns.forEach(column => {
          options.push({
            label: column.name,
            type: 'property',
            boost: 3,
            info: `${table.name}.${column.name} (${column.type})`
          });
        });
      });
    }
  }

  if (databaseAliases) {
    // Add database aliases
    databaseAliases.forEach(({ alias }) => {
      options.push({
        label: alias + ".",
        type: 'keyword',
        boost: 2
      });
    });
  }

  if (selectedTables) {
    // Add selected tables with their database aliases
    selectedTables.forEach((tableKey) => {
      const [dbId, tableName] = tableKey.split(".");
      const dbAlias = databaseAliases?.find((da) => da.connectionId === dbId)?.alias;
      if (dbAlias) {
        options.push({
          label: `${dbAlias}.${tableName}`,
          type: 'property',
          boost: 3
        });
      }
    });
  }

  return {
    from: triggerChar.from,
    options,
    validFor: /^\w*$/
  };
}

function createSQLLinter(onError: (error: string | null) => void) {
  return linter((view) => {
    const text = view.state.doc.toString();
    if (!text.trim()) {
      onError(null);
      return [];
    }
    
    const diagnostics: Diagnostic[] = [];
    let errorMessage: string | null = null;
    
    // Basic SQL validation
    if (!text.toLowerCase().match(/^(select|insert|update|delete|create|drop|alter|with)/)) {
      errorMessage = 'Query should start with a valid SQL command';
      diagnostics.push({
        from: 0,
        to: text.length,
        severity: 'warning',
        message: errorMessage
      });
    }

    const singleQuotes = (text.match(/'/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      errorMessage = 'Unmatched single quotes';
      diagnostics.push({
        from: 0,
        to: text.length,
        severity: 'error',
        message: errorMessage
      });
    }

    onError(errorMessage);
    return diagnostics;
  }, {
    delay: 300
  });
}

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
  },
  '.cm-content': {
    caretColor: '#000',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#000',
  },
  '.cm-placeholder': {
    color: '#999',
  },
});

export function SQLEditor({
  defaultValue = "",
  onChange,
  onExecute,
  schema,
  selectedTables,
  databaseAliases,
  isExecuting = false,
  value: _value,
  onError,
  height = '200px',
  placeholder,
  className,
}: SQLEditorProps) {
  const [theme] = useTheme();
  const isDark = theme === Theme.DARK;
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const sqlLinter = useMemo(() => createSQLLinter((error: string | null) => {
    onError?.(error);
  }), [onError]);
  const isInternalChange = useRef(false);
  const [value, setValue] = useState(_value || defaultValue);

  // Create compartments for dynamic configuration
  const themeCompartment = useMemo(() => new Compartment(), []);
  const lintCompartment = useMemo(() => new Compartment(), []);
  const completionCompartment = useMemo(() => new Compartment(), []);

  const createEditor = useCallback(() => {
    if (!editorRef.current) return;

    const baseExtensions: Extension[] = [
      basicSetup,
      sql(),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          isInternalChange.current = true;
          const newValue = update.state.doc.toString();
          setValue(newValue);
          onChange?.(newValue);
          // Reset the flag after the current call stack
          setTimeout(() => {
            isInternalChange.current = false;
          }, 0);
        }
      }),
      EditorView.theme({
        '&': {
          height: height,
        },
      }),
      themeCompartment.of(isDark ? oneDark : lightTheme),
      lintCompartment.of([lintGutter(), sqlLinter])
    ];

    // Add autocompletion in its own compartment if schema is provided
    if (schema || databaseAliases || selectedTables) {
      baseExtensions.push(
        completionCompartment.of(
          autocompletion({
            override: [context => getSQLCompletions(context, schema, databaseAliases, selectedTables)],
            closeOnBlur: true,
            defaultKeymap: true,
            maxRenderedOptions: 10,
            activateOnTyping: false,
            icons: false
          })
        )
      );
    }

    const view = new EditorView({
      doc: value,
      extensions: baseExtensions,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [onChange, isDark, schema, sqlLinter, databaseAliases, selectedTables, value]);

  // Handle theme changes
  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({
        effects: themeCompartment.reconfigure(isDark ? oneDark : lightTheme)
      });
    }
  }, [isDark]);

  // Handle external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!isInternalChange.current && view && view.state.doc.toString() !== value) {
      const transaction = view.state.update({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        },
        selection: view.state.selection
      });
      view.dispatch(transaction);
    }
  }, [value]);

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      return createEditor();
    }
  }, [createEditor]);

  const handleExecute = useCallback(() => {
    onExecute?.(value);
  }, [onExecute, value]);

  return (
    <div className="flex h-full space-x-4">
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + Enter to
            execute
          </div>
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !value.trim()}
            className="flex items-center gap-2"
          >
            {isExecuting ? "Executing..." : "Execute"}
          </Button>
        </div>
        <div 
          ref={editorRef} 
          className={`overflow-hidden rounded-lg border border-light-border dark:border-dark-border`}
          style={{ height: '200px' }}
        />
      </div>
    </div>
  );
}
