"use client";
import { useState } from "react";
import { clsx } from "clsx";
import type { BookingState } from "@/hooks/useBookingStore";
import { ErrorState } from "@/components/ui/ErrorState";

interface Props {
  state: BookingState;
  onBack: () => void;
  onReset: () => void;
}

const PLASTERBOARD_SURCHARGE = 40;
const HEAVY_WASTE_SURCHARGE  = 20;

function computePriceBreakdown(state: BookingState) {
  const base = state.selectedSkipPrice ?? 0;
  const items: { label: string; amount: number; testId: string }[] = [
    { label: "Skip hire", amount: base, testId: "price-skip-hire" },
  ];

  if (state.wasteType === "heavy") {
    items.push({
      label: "Heavy waste surcharge",
      amount: HEAVY_WASTE_SURCHARGE,
      testId: "price-heavy-surcharge",
    });
  }

  if (state.wasteType === "plasterboard") {
    items.push({
      label: "Plasterboard handling",
      amount: PLASTERBOARD_SURCHARGE,
      testId: "price-plasterboard-surcharge",
    });
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  return { items, total };
}

export function ReviewStep({ state, onBack, onReset }: Props) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [bookingId, setBookingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const address = state.selectedAddress
    ? `${state.selectedAddress.line1}, ${state.selectedAddress.city}`
    : state.manualAddress;

  const { items: priceItems, total } = computePriceBreakdown(state);

  async function handleConfirm() {
    if (submitStatus === "submitting") return; // double-submit guard
    setSubmitStatus("submitting");

    try {
      const res = await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode:          state.postcode,
          addressId:         state.selectedAddress?.id ?? "manual",
          heavyWaste:        state.wasteType === "heavy",
          plasterboard:      state.wasteType === "plasterboard",
          plasterboardOption: state.plasterboardOption,
          skipSize:          state.selectedSkipSize,
          price:             total,
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setBookingId(data.bookingId);
      setSubmitStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message ?? "Booking failed. Please try again.");
      setSubmitStatus("error");
    }
  }

  // — Success screen —
  if (submitStatus === "success") {
    return (
      <div data-testid="booking-success" className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking confirmed</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your booking reference is:
        </p>
        <p
          data-testid="booking-id"
          className="text-2xl font-bold text-indigo-700 font-mono mb-6"
        >
          {bookingId}
        </p>
        <button
          data-testid="new-booking-button"
          onClick={onReset}
          className="px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Make another booking
        </button>
      </div>
    );
  }

  // — Review screen —
  return (
    <div data-testid="step-review">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Review your booking</h2>
      <p className="text-sm text-gray-500 mb-6">Check the details below before confirming</p>

      {/* Summary table */}
      <div
        data-testid="booking-summary"
        className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6"
      >
        <SummaryRow label="Postcode"   value={state.postcode}          testId="summary-postcode" />
        <SummaryRow label="Address"    value={address}                 testId="summary-address" />
        <SummaryRow
          label="Waste type"
          value={
            state.wasteType === "plasterboard" && state.plasterboardOption
              ? `Plasterboard — ${state.plasterboardOption.replace("_", " ")}`
              : (state.wasteType ?? "—")
          }
          testId="summary-waste-type"
        />
        <SummaryRow label="Skip size"  value={state.selectedSkipSize ?? "—"} testId="summary-skip-size" />
      </div>

      {/* Price breakdown */}
      <div
        data-testid="price-breakdown"
        className="rounded-xl border border-gray-200 overflow-hidden mb-8"
      >
        <div className="bg-gray-50 px-5 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Price breakdown
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {priceItems.map(({ label, amount, testId }) => (
            <div key={testId} className="flex justify-between px-5 py-3 text-sm">
              <span data-testid={testId} className="text-gray-600">{label}</span>
              <span className="font-medium text-gray-900">£{amount}</span>
            </div>
          ))}
          <div className="flex justify-between px-5 py-4 bg-gray-50">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span data-testid="price-total" className="text-lg font-bold text-indigo-700">
              £{total}
            </span>
          </div>
        </div>
      </div>

      {/* Booking error */}
      {submitStatus === "error" && (
        <div className="mb-6">
          <ErrorState
            message={errorMessage}
            onRetry={() => setSubmitStatus("idle")}
            testId="booking-error-state"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center">
        <button
          data-testid="step4-back-button"
          onClick={onBack}
          disabled={submitStatus === "submitting"}
          className="px-5 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Back
        </button>
        <button
          data-testid="confirm-button"
          onClick={handleConfirm}
          disabled={submitStatus === "submitting"}
          aria-busy={submitStatus === "submitting"}
          className={clsx(
            "px-7 py-3 text-sm font-semibold rounded-lg transition-colors",
            submitStatus === "submitting"
              ? "bg-indigo-300 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          )}
        >
          {submitStatus === "submitting" ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon />
              Confirming…
            </span>
          ) : (
            "Confirm booking"
          )}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="flex justify-between items-start px-5 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span data-testid={testId} className="text-sm font-medium text-gray-900 text-right max-w-xs">
        {value}
      </span>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}