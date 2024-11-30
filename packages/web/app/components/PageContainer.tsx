import { type ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-950">
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
