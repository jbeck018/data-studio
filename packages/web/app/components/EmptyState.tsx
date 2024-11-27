import { FolderIcon, TableCellsIcon, CircleStackIcon } from "@heroicons/react/24/outline";

type EmptyStateType = "table" | "query" | "database";

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  table: TableCellsIcon,
  query: CircleStackIcon,
  database: FolderIcon,
};

export function EmptyState({ type, title, message, action }: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
        <Icon className="w-8 h-8 text-light-text-secondary dark:text-dark-text-secondary" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
        {title}
      </h3>
      <p className="mb-6 text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-sm">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
