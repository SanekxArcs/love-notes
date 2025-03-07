import { ReactNode } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import Particles from '@/components/reactbits/Particles';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <div className="absolute inset-0 -z-10 w-full h-svh">
        <Particles
          particleColors={["#fa00e5", "#fa00e5"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={true}
          disableRotation={true}
        />
      </div>
      <div className="relative flex min-h-svh items-center justify-center p-4">
        <header className="absolute top-0 right-0 p-4">
          <ModeToggle />
        </header>
        {children}
      </div>
    </>
  );
}
