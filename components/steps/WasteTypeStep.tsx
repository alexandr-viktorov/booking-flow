"use client";
import { clsx } from "clsx";
import type { WasteType, BookingState } from "@/hooks/useBookingStore";
import type { PlasterboardOption } from "@/lib/types";

const WASTE_OPTIONS: { id: WasteType; label: string; description: string }[] = [
  {
    id: "general",
    label: "General waste",
    description: "Household rubbish, furniture, mixed non-hazardous materials",
  },
  {
    id: "heavy",
    label: "Heavy waste",
    description: "Soil, concrete, bricks, rubble, aggregates",
  },
  {
    id: "plasterboard",
    label: "Plasterboard",
    description: "Includes any plasterboard — requires special handling",
  },
];

const PLASTERBOARD_OPTIONS: {
  id: PlasterboardOption;
  label: string;
  description: string;
}[] = [
  {
    id: "segregated",
    label: "Segregated load",
    description: "Plasterboard only — no other materials mixed in",
  },
  {
    id: "mixed",
    label: "Mixed load",
    description: "Plasterboard mixed with other general waste",
  },
  {
    id: "removal_only",
    label: "Removal only",
    description: "Site strip-out, large volume plasterboard removal",
  },
];

interface Props {
  state: BookingState;
  onSetWasteType: (wt: WasteType) => void;
  onUpdate: (partial: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WasteTypeStep({ state, onSetWasteType, onUpdate, onNext, onBack }: Props) {
  const needsPlasterboardOption = state.wasteType === "plasterboard";
  const canProceed =
    state.wasteType !== null &&
    (!needsPlasterboardOption || state.plasterboardOption !== null);

  return (
    <div data-testid="step-waste-type">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">What type of waste?</h2>
      <p className="text-sm text-gray-500 mb-6">
        This affects which skips are available and the price
      </p>

      {/* Waste type cards */}
      <div data-testid="waste-type-options" className="space-y-3 mb-6">
        {WASTE_OPTIONS.map(({ id, label, description }) => (
          <button
            key={id}
            data-testid={`waste-type-${id}`}
            onClick={() => onSetWasteType(id)}
            className={clsx(
              "w-full text-left rounded-xl border-2 px-5 py-4 transition-colors",
              state.wasteType === id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-indigo-300"
            )}
          >
            <p className={clsx(
              "text-sm font-semibold mb-0.5",
              state.wasteType === id ? "text-indigo-800" : "text-gray-800"
            )}>
              {label}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
          </button>
        ))}
      </div>

      {/* Plasterboard sub-step — only shown when relevant */}
      {needsPlasterboardOption && (
        <div
          data-testid="plasterboard-options"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6"
        >
          <p className="text-sm font-semibold text-amber-900 mb-1">
            Plasterboard handling method
          </p>
          <p className="text-xs text-amber-700 mb-4">
            Plasterboard must be handled separately due to sulphate regulations
          </p>
          <div className="space-y-2">
            {PLASTERBOARD_OPTIONS.map(({ id, label, description }) => (
              <button
                key={id}
                data-testid={`plasterboard-option-${id}`}
                onClick={() => onUpdate({ plasterboardOption: id })}
                className={clsx(
                  "w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors",
                  state.plasterboardOption === id
                    ? "border-amber-500 bg-amber-100 font-medium text-amber-900"
                    : "border-amber-200 bg-white text-gray-700 hover:border-amber-400"
                )}
              >
                <span className="font-medium">{label}</span>
                <span className="text-gray-400 ml-2 font-normal text-xs">
                  — {description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between mt-8">
        <button
          data-testid="step2-back-button"
          onClick={onBack}
          className="px-5 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          data-testid="step2-next-button"
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