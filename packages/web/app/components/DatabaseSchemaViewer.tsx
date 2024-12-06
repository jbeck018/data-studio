import React from 'react';
import type { TableSchema } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { cn } from '../utils/cn';

interface DatabaseSchemaViewerProps {
  schemas: Record<string, TableSchema[]>;
  selectedTables: Set<string>;
  onTableSelect: (databaseId: string, tableName: string) => void;
  onTableDoubleClick?: (databaseId: string, tableName: string) => void;
}

export function DatabaseSchemaViewer({
  schemas,
  selectedTables,
  onTableSelect,
  onTableDoubleClick,
}: DatabaseSchemaViewerProps) {
  const [expandedDatabases, setExpandedDatabases] = React.useState<string[]>([]);

  const toggleDatabase = (databaseId: string) => {
    setExpandedDatabases((prev) =>
      prev.includes(databaseId)
        ? prev.filter((id) => id !== databaseId)
        : [...prev, databaseId]
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
      <Accordion type="multiple" value={expandedDatabases}>
        {Object.entries(schemas).map(([databaseId, tables]) => (
          <AccordionItem key={databaseId} value={databaseId}>
            <AccordionTrigger
              onClick={() => toggleDatabase(databaseId)}
              className="hover:no-underline"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{databaseId}</span>
                <span className="text-xs text-muted-foreground">
                  ({tables.length} tables)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2 px-2">
                {tables.map((table) => {
                  const isSelected = selectedTables.has(`${databaseId}.${table.name}`);
                  return (
                    <div
                      key={`${databaseId}.${table.name}`}
                      onClick={() => onTableSelect(databaseId, table.name)}
                      onDoubleClick={() => onTableDoubleClick?.(databaseId, table.name)}
                      className={cn(
                        'flex items-center gap-2 py-1 px-2 text-sm rounded cursor-pointer',
                        'hover:bg-accent',
                        isSelected && 'bg-accent'
                      )}
                    >
                      <span className="flex-1">{table.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({table.columns.length})
                      </span>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
}
