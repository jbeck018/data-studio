import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message?: string;
  className?: string;
}

const alertStyles = {
  error: {
    container: 'bg-red-50 dark:bg-red-900/50',
    icon: 'text-red-400 dark:text-red-300',
    title: 'text-red-800 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
    Icon: XCircleIcon,
  },
  success: {
    container: 'bg-green-50 dark:bg-green-900/50',
    icon: 'text-green-400 dark:text-green-300',
    title: 'text-green-800 dark:text-green-200',
    message: 'text-green-700 dark:text-green-300',
    Icon: CheckCircleIcon,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/50',
    icon: 'text-yellow-400 dark:text-yellow-300',
    title: 'text-yellow-800 dark:text-yellow-200',
    message: 'text-yellow-700 dark:text-yellow-300',
    Icon: ExclamationTriangleIcon,
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/50',
    icon: 'text-blue-400 dark:text-blue-300',
    title: 'text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
    Icon: InformationCircleIcon,
  },
};

export function Alert({ type, title, message, className = '' }: AlertProps) {
  const styles = alertStyles[type];
  const Icon = styles.Icon;

  return (
    <div className={`rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          {message && (
            <div className={`mt-2 text-sm ${styles.message}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
