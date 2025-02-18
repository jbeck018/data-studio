import { type ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="h-screen bg-background">
      <div className="h-full bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
