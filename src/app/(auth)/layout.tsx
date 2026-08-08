import { ViewTransition, type ReactNode } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import Aurora from '@/components/reactbits/Aurora';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Aurora
        colorStops={["#FFB2D1", "#F45B9A", "#8B7CFF"]}
        blend={0.65}
        amplitude={0.85}
        speed={0.35}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.7),transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(75,32,61,.35),transparent_48%)]" />
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
        <header className="fixed right-3 top-[max(.75rem,env(safe-area-inset-top))] z-20">
          <ModeToggle />
        </header>
        <ViewTransition>{children}</ViewTransition>
      </div>
    </>
  );
}
