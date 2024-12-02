import { type ReactNode } from "react";

interface AuthBackgroundProps {
  children: ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="min-h-screen">
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
