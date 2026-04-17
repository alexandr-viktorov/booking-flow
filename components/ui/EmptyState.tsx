interface EmptyStateProps {
  postcode: string;
  onManualEntry: () => void;
}

export function EmptyState({ postcode, onManualEntry }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center"
    >
      <p className="text-sm font-medium text-gray-700 mb-1">
        No addresses found for {postcode}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        We couldn't find any addresses for this postcode.
      </p>
      <button
        data-testid="manual-entry-button"
        onClick={onManualEntry}
        className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
      >
        Enter address manually
      </button>
    </div>
  );
}