interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada.',
  hint = 'Confira a grafia e tente novamente.',
}: EmptyStateProps) {
  return (
    <div role="status" className="space-y-1 text-white">
      <h2 className="text-lg font-semibold">{title}</h2>{' '}
      <p className="text-sm text-white/70">{hint}</p>
    </div>
  );
}
