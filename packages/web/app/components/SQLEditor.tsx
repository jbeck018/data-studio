import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '../hooks/useTheme';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { Extension, Compartment, StateEffect } from '@codemirror/state';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { basicSetup } from 'codemirror';
import { linter, lintGutter, Diagnostic } from '@codemirror/lint';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import type { TableSchema } from '../types';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  onError?: (error: string | null) => void;
  schema?: TableSchema[];
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

function getSQLCompletions(context: CompletionContext, schema?: TableSchema[]): CompletionResult | null {
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

  return {
    from: triggerChar.from,
    options,
    validFor: /^\w*$/
  };
}

function createSQLLinter() {
  return linter((view) => {
    const text = view.state.doc.toString();
    if (!text.trim()) return [];
    
    const diagnostics: Diagnostic[] = [];
    
    // Basic SQL validation
    if (!text.toLowerCase().match(/^(select|insert|update|delete|create|drop|alter|with)/)) {
      diagnostics.push({
        from: 0,
        to: text.length,
        severity: 'warning',
        message: 'Query should start with a valid SQL command'
      });
    }

    const singleQuotes = (text.match(/'/g) || []).length;
    const doubleQuotes = (text.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      diagnostics.push({
        from: 0,
        to: text.length,
        severity: 'error',
        message: 'Unmatched single quotes'
      });
    }
    if (doubleQuotes % 2 !== 0) {
      diagnostics.push({
        from: 0,
        to: text.length,
        severity: 'error',
        message: 'Unmatched double quotes'
      });
    }

    return diagnostics;
  }, {
    delay: 300  // Reduced delay for more responsive feedback
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
  value,
  onChange,
  placeholder = 'Enter your SQL query here...',
  className = '',
  height = '200px',
  onError,
  schema,
}: SQLEditorProps) {
  const { isDark } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const sqlLinter = useMemo(() => createSQLLinter(), []);
  const isInternalChange = useRef(false);
  
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
          onChange(newValue);
          // Reset the flag after the current call stack
          setTimeout(() => {
            isInternalChange.current = false;
          }, 0);
        }
      }),
      EditorView.theme({
        '&': {
          height,
        },
      }),
      themeCompartment.of(isDark ? oneDark : lightTheme),
      lintCompartment.of([lintGutter(), sqlLinter])
    ];

    // Add autocompletion in its own compartment if schema is provided
    if (schema) {
      baseExtensions.push(
        completionCompartment.of(
          autocompletion({
            override: [context => getSQLCompletions(context, schema)],
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
  }, [onChange, height, isDark, schema, sqlLinter]);

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

  return (
    <div 
      ref={editorRef} 
      className={`overflow-hidden rounded-lg border border-light-border dark:border-dark-border ${className}`}
      style={{ height }}
    />
  );
}
