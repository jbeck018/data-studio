import { SQLEditor } from './SQLEditor';
import type { TableSchema } from '../types';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute?: () => void;
  disabled?: boolean;
  schema?: TableSchema[];
  selectedTables?: Set<string>;
  databaseAliases?: { alias: string; connectionId: string }[];
}

export function QueryEditor({
  value,
  onChange,
  onExecute,
  disabled = false,
  schema,
  selectedTables,
  databaseAliases,
}: QueryEditorProps) {
  return (
    <div className="w-full border rounded-md overflow-hidden">
      <SQLEditor
        value={value}
        onChange={onChange}
        onExecute={onExecute}
        isExecuting={disabled}
        schema={schema}
        selectedTables={selectedTables}
        databaseAliases={databaseAliases}
        height="200px"
      />
    </div>
  );
}
