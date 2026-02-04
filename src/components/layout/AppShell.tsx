import { AppHeader } from "@/components/layout/AppHeader";
import { Container } from "@/components/layout/Container";

import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--mild-white)] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--crimson-50)_0%,transparent_50%)] opacity-40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--crimson-50)_0%,transparent_50%)] opacity-30 pointer-events-none"></div>
      <AppHeader />
      <main className="py-10 relative z-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
