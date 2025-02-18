import { Link } from "react-router";
import { cn } from "../utils/cn";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full p-8 text-center", className)}>
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-muted">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">
        {title}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && (
        <Link
          to={action.href}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
