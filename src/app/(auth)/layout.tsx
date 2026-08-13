import { ViewTransition, type ReactNode } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import { AmbientBackground } from "@/components/ambient-background";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <AmbientBackground />
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
        <header className="fixed right-3 top-[max(.75rem,env(safe-area-inset-top))] z-20">
          <ModeToggle />
        </header>
        <ViewTransition>{children}</ViewTransition>
      </div>
    </>
  );
}
