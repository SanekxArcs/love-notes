export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(255,178,209,.72),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(139,124,255,.4),transparent_34%),linear-gradient(180deg,#fff7fb_0%,#fff_54%,#fff5fa_100%)] dark:bg-[radial-gradient(circle_at_18%_8%,rgba(198,51,119,.25),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(108,87,214,.22),transparent_34%),linear-gradient(180deg,#181116_0%,#09090b_58%,#160d13_100%)]"
    >
      <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-500/10" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
    </div>
  );
}
