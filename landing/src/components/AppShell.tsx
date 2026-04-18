import type { ReactNode } from "react";
import { AppNavbar } from "./AppNavbar";

interface AppShellProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,white,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,white,transparent_40%)]" />
      </div>
      <AppNavbar />
      <main className="relative z-10 pt-28 md:pt-32 pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {(title || subtitle) && (
            <header className="mb-10 md:mb-14">
              {title && (
                <h1 className="text-4xl md:text-5xl font-medium tracking-[-1px]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-2xl">
                  {subtitle}
                </p>
              )}
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
