interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  testId?: string;
}

export function ErrorState({ message, onRetry, testId = "error-state" }: ErrorStateProps) {
  return (
    <div
      data-testid={testId}
      className="rounded-xl border border-red-200 bg-red-50 p-5"
      role="alert"
    >
      <p className="text-sm font-medium text-red-800 mb-1">Something went wrong</p>
      <p className="text-sm text-red-600 mb-4">{message}</p>
      <button
        data-testid="retry-button"
        onClick={onRetry}
        className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
      >
        Try again
      </button>
    </div>
  );
}