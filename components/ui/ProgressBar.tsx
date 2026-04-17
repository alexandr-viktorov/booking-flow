import { clsx } from "clsx";
import type { BookingStep } from "@/hooks/useBookingStore";

const STEPS = [
  { n: 1, label: "Postcode" },
  { n: 2, label: "Waste type" },
  { n: 3, label: "Skip size" },
  { n: 4, label: "Review" },
] as const;

interface ProgressBarProps {
  currentStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
  maxReachedStep: BookingStep;
}

export function ProgressBar({ currentStep, onStepClick, maxReachedStep }: ProgressBarProps) {
  return (
    <nav data-testid="progress-bar" aria-label="Booking steps" className="mb-10">
      <ol className="flex items-center gap-0">
        {STEPS.map(({ n, label }, i) => {
          const isComplete  = n < currentStep;
          const isCurrent   = n === currentStep;
          const isClickable = n <= maxReachedStep && n !== currentStep;

          return (
            <li key={n} className="flex items-center flex-1 last:flex-none">
              <button
                data-testid={`step-${n}-indicator`}
                onClick={() => isClickable && onStepClick(n as BookingStep)}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={clsx(
                  "flex flex-col items-center gap-1 group",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isComplete  && "bg-indigo-600 text-white",
                    isCurrent   && "bg-indigo-600 text-white ring-4 ring-indigo-100",
                    !isComplete && !isCurrent && "bg-gray-100 text-gray-400"
                  )}
                >
                  {isComplete ? "✓" : n}
                </span>
                <span
                  className={clsx(
                    "text-xs font-medium hidden sm:block",
                    isCurrent  ? "text-indigo-600" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </button>

              {i < STEPS.length - 1 && (
                <div
                  className={clsx(
                    "flex-1 h-px mx-2 transition-colors",
                    n < currentStep ? "bg-indigo-600" : "bg-gray-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}