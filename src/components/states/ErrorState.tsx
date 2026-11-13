interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}

export default function ErrorState({ message, onRetry, disabled = false }: ErrorStateProps) {
  return (
    <div className="space-y-4 text-white">
      <p role="alert" className="text-red-300">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={disabled}
        className="rounded-md bg-accent-500 px-5 py-2 font-medium text-night-900 enabled:hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tentar novamente
      </button>
    </div>
  );
}
