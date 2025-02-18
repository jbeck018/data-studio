import { type ReactNode } from "react";

interface AuthBackgroundProps {
  children: ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="flex h-screen bg-background">
      <div className="min-h-screen">
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
