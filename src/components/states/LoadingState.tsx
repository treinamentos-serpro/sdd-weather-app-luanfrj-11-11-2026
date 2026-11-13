export default function LoadingState() {
  return (
    <div role="status" className="flex items-center gap-3 text-white">
      <span
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-accent-400 motion-reduce:animate-none"
      />
      <span>Carregando…</span>
    </div>
  );
}
