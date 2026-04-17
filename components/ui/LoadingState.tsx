export function LoadingState({ lines = 4 }: { lines?: number }) {
  return (
    <div
      data-testid="loading-state"
      className="space-y-3 animate-pulse"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 rounded-lg"
          style={{ width: `${85 - i * 8}%` }}
        />
      ))}
    </div>
  );
}