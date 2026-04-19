"use client";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Skip } from "@/lib/types";
import type { BookingState } from "@/hooks/useBookingStore";
import { normalizePostcode } from "@/lib/validators/postcode";

interface Props {
  state: BookingState;
  onUpdate: (partial: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

type FetchStatus = "loading" | "success" | "error";

export function SkipStep({ state, onUpdate, onNext, onBack }: Props) {
  const [skips, setSkips] = useState<Skip[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const heavyWaste = state.wasteType === "heavy";

  async function fetchSkips() {
    setStatus("loading");
    setSkips([]);
    try {
      const pc = normalizePostcode(state.postcode);
      const res = await fetch(
        `/api/skips?postcode=${pc}&heavyWaste=${heavyWaste}`
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setSkips(data.skips);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message ?? "Could not load skip options");
    }
  }

  useEffect(() => { fetchSkips(); }, []);

  function handleSelect(skip: Skip) {
    if (skip.disabled) return;
    onUpdate({ selectedSkipSize: skip.size, selectedSkipPrice: skip.price });
  }

  return (
    <div data-testid="step-skip">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose your skip size</h2>
      <p className="text-sm text-gray-500 mb-6">
        Prices include delivery, collection, and disposal
        {heavyWaste && (
          <span
            data-testid="heavy-waste-notice"
            className="ml-2 inline-block bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium"
          >
            Heavy waste — some sizes unavailable
          </span>
        )}
      </p>

      {status === "loading" && <LoadingState lines={6} />}

      {status === "error" && (
        <div className="mb-8">
          <ErrorState
            message={errorMessage}
            onRetry={fetchSkips}
            testId="skip-error-state"
          />
        </div>
      )}

      {status === "success" && (
        <div
          data-testid="skip-options"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
        >
          {skips.map((skip) => (
            <button
              key={skip.size}
              data-testid={`skip-option-${skip.size.replace(" ", "-")}`}
              onClick={() => handleSelect(skip)}
              disabled={skip.disabled}
              aria-disabled={skip.disabled}
              title={skip.disabled ? skip.disabledReason : undefined}
              className={clsx(
                "relative text-left rounded-xl border-2 px-5 py-4 transition-colors",
                skip.disabled && "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200",
                !skip.disabled && state.selectedSkipSize === skip.size &&
                  "border-indigo-500 bg-indigo-50",
                !skip.disabled && state.selectedSkipSize !== skip.size &&
                  "border-gray-200 bg-white hover:border-indigo-300"
              )}
            >
              {skip.disabled && (
                <span
                  data-testid={`skip-disabled-badge-${skip.size.replace(" ", "-")}`}
                  className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full"
                >
                  Not available
                </span>
              )}
              <p className="text-base font-semibold text-gray-800 mb-0.5">{skip.size}</p>
              {!skip.disabled ? (
                <p className="text-xl font-bold text-indigo-700">
                  £{skip.price}
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  {skip.disabledReason ?? "Not available for this waste type"}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button
          data-testid="step3-back-button"
          onClick={onBack}
          className="px-5 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          data-testid="step3-next-button"
          onClick={onNext}
          disabled={!state.selectedSkipSize}
          className="px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Review booking
        </button>
      </div>
    </div>
  );
}