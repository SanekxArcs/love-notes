export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(255,178,209,.72),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(139,124,255,.4),transparent_34%),linear-gradient(180deg,#fff7fb_0%,#fff_54%,#fff5fa_100%)] dark:bg-[radial-gradient(circle_at_18%_8%,rgba(198,51,119,.25),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(108,87,214,.22),transparent_34%),linear-gradient(180deg,#181116_0%,#09090b_58%,#160d13_100%)]"
    >
      <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-500/10" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
      <div className="ambient-float-a absolute left-[7%] top-[18%] h-14 w-14 rounded-full border border-white/70 bg-pink-200/35 shadow-[inset_0_1px_1px_rgba(255,255,255,.8),0_10px_30px_rgba(219,71,139,.15)] backdrop-blur-sm motion-reduce:animate-none dark:border-white/15 dark:bg-pink-400/10" />
      <div className="ambient-float-b absolute right-[9%] top-[24%] h-24 w-24 rounded-full border border-white/55 bg-violet-200/30 shadow-[inset_0_1px_1px_rgba(255,255,255,.7),0_14px_36px_rgba(119,86,210,.16)] backdrop-blur-sm motion-reduce:animate-none dark:border-white/12 dark:bg-violet-400/10" />
      <div className="ambient-float-b absolute bottom-[14%] left-[19%] h-9 w-9 rounded-full border border-white/70 bg-white/35 shadow-[0_8px_22px_rgba(219,71,139,.14)] backdrop-blur-sm [animation-delay:-4s] motion-reduce:animate-none dark:border-white/15 dark:bg-white/8" />
      <div className="ambient-float-a absolute right-[27%] bottom-[19%] h-16 w-16 rounded-full border border-white/60 bg-rose-200/30 shadow-[0_12px_30px_rgba(219,71,139,.13)] backdrop-blur-sm [animation-delay:-7s] motion-reduce:animate-none dark:border-white/12 dark:bg-rose-400/8" />
      <div className="ambient-float-a absolute left-[42%] top-[10%] h-7 w-7 rounded-full border border-white/70 bg-white/40 shadow-[0_6px_18px_rgba(119,86,210,.12)] [animation-delay:-10s] motion-reduce:animate-none dark:border-white/15 dark:bg-white/8" />
      <div className="ambient-float-b absolute right-[42%] bottom-[7%] h-11 w-11 rounded-full border border-white/60 bg-pink-100/35 shadow-[0_8px_24px_rgba(219,71,139,.12)] [animation-delay:-9s] motion-reduce:animate-none dark:border-white/12 dark:bg-pink-400/8" />
    </div>
  );
}
