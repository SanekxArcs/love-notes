import Link from "next/link";
import { Info } from "lucide-react";

export function AboutAppButton() {
  return (
    <Link
      href="/help"
      aria-label="Про застосунок"
      title="Про застосунок"
      className="fixed right-2 top-[max(1.40rem,env(safe-area-inset-top))] z-50 flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/65 bg-white/55 text-pink-700 shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_8px_24px_rgba(71,40,62,.14)] backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-200 hover:bg-white/70 active:scale-90 md:hidden dark:border-white/15 dark:bg-zinc-950/55 dark:text-pink-200 dark:hover:bg-zinc-900/70"
    >
      <Info className="h-[1.15rem] w-[1.15rem] stroke-[1.9]" />
    </Link>
  );
}
