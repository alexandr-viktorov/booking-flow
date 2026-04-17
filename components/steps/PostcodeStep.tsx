"use client";
import { useState } from "react";
import { isValidUKPostcode } from "@/lib/validators/postcode";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Address } from "@/lib/types";
import type { BookingState } from "@/hooks/useBookingStore";
import { clsx } from "clsx";

type LookupStatus = "idle" | "loading" | "success" | "error";

interface Props {
  state: BookingState;
  onUpdate: (partial: Partial<BookingState>) => void;
  onNext: () => void;
}

export function PostcodeStep({ state, onUpdate, onNext }: Props) {
  const [postcodeInput, setPostcodeInput] = useState(state.postcode);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function handleLookup() {
    const trimmed = postcodeInput.trim();
    if (!isValidUKPostcode(trimmed)) {
      setValidationError("Please enter a valid UK postcode (e.g. SW1A 1AA)");
      return;
    }
    setValidationError("");
    setStatus("loading");
    setAddresses([]);
    onUpdate({ postcode: trimmed, selectedAddress: null });

    try {
      const res = await fetch("/api/postcode/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: trimmed }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setAddresses(data.addresses);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message ?? "Could not look up postcode");
    }
  }

  function handleSelectAddress(addr: Address) {
    onUpdate({ selectedAddress: addr, manualAddress: "" });
  }

  function handleManualChange(value: string) {
    onUpdate({ manualAddress: value, selectedAddress: null });
  }

  const canProceed =
    state.selectedAddress !== null ||
    (showManual && state.manualAddress.trim().length > 0);

  return (
    <div data-testid="step-postcode">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Where should we collect your waste?</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your UK postcode to find addresses</p>

      {/* Postcode input row */}
      <div className="flex gap-3 mb-2">
        <input
          data-testid="postcode-input"
          type="text"
          value={postcodeInput}
          onChange={(e) => {
            setPostcodeInput(e.target.value);
            setValidationError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="e.g. SW1A 1AA"
          maxLength={8}
          className={clsx(
            "flex-1 rounded-lg border px-4 py-3 text-sm font-medium uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400",
            validationError ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
          )}
          aria-describedby={validationError ? "postcode-error" : undefined}
          aria-invalid={!!validationError}
        />
        <button
          data-testid="postcode-lookup-button"
          onClick={handleLookup}
          disabled={status === "loading"}
          className="px-5 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? "Searching…" : "Find address"}
        </button>
      </div>

      {/* Inline validation error */}
      {validationError && (
        <p id="postcode-error" data-testid="postcode-validation-error" className="text-xs text-red-600 mb-4">
          {validationError}
        </p>
      )}

      {/* State renders */}
      <div className="mt-4">
        {status === "loading" && <LoadingState lines={4} />}

        {status === "error" && (
          <ErrorState
            message={errorMessage}
            onRetry={handleLookup}
            testId="postcode-error-state"
          />
        )}

        {status === "success" && addresses.length === 0 && !showManual && (
          <EmptyState
            postcode={postcodeInput.trim()}
            onManualEntry={() => setShowManual(true)}
          />
        )}

        {status === "success" && addresses.length > 0 && (
          <div data-testid="address-list" className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <p className="text-xs text-gray-400 mb-3">
              {addresses.length} address{addresses.length !== 1 ? "es" : ""} found
            </p>
            {addresses.map((addr) => (
              <button
                key={addr.id}
                data-testid={`address-option-${addr.id}`}
                onClick={() => handleSelectAddress(addr)}
                className={clsx(
                  "w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors",
                  state.selectedAddress?.id === addr.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-medium"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"
                )}
              >
                <span className="font-medium">{addr.line1}</span>
                <span className="text-gray-400 ml-2">{addr.city}</span>
              </button>
            ))}
          </div>
        )}

        {/* Manual entry */}
        {showManual && (
          <div data-testid="manual-address-form" className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your address
            </label>
            <textarea
              data-testid="manual-address-input"
              value={state.manualAddress}
              onChange={(e) => handleManualChange(e.target.value)}
              placeholder="Start typing your full address…"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between items-center">
        <button
          data-testid="manual-toggle-button"
          onClick={() => setShowManual((v) => !v)}
          className="text-sm text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
        >
          {showManual ? "Use address lookup instead" : "Enter address manually"}
        </button>
        <button
          data-testid="step1-next-button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}