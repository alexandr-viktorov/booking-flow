"use client";
import { useState } from "react";
import Image from "next/image";
import { useBookingStore } from "@/hooks/useBookingStore";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PostcodeStep }  from "@/components/steps/PostcodeStep";
import { WasteTypeStep } from "@/components/steps/WasteTypeStep";
import { SkipStep }      from "@/components/steps/SkipStep";
import { ReviewStep }    from "@/components/steps/ReviewStep";
import type { BookingStep } from "@/hooks/useBookingStore";

export default function BookingPage() {
  const { state, update, setWasteType, goToStep, reset } = useBookingStore();
  const [maxReachedStep, setMaxReachedStep] = useState<BookingStep>(1);

  function advance() {
    const next = (state.currentStep + 1) as BookingStep;
    goToStep(next);
    if (next > maxReachedStep) setMaxReachedStep(next);
  }

  function back() {
    goToStep((state.currentStep - 1) as BookingStep);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <header className="bg-indigo-600 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Image src="/logo.svg" alt="SkipWaste logo" width={40} height={40} priority />
          {/* <div>
            <p className="text-lg font-bold text-white leading-tight">SkipWaste</p>
            <p className="text-xs text-indigo-200">Fast, transparent waste collection across the UK</p>
          </div> */}
        </div>
      </header>
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book a Waste Collection</h1>
          <p className="text-sm text-gray-500 mt-1">Fast, transparent waste collection hire across the UK</p>
        </div>

        {/* Progress */}
        <ProgressBar
          currentStep={state.currentStep}
          onStepClick={goToStep}
          maxReachedStep={maxReachedStep}
        />

        {/* Step card */}
        <div
          data-testid="step-card"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
        >
          {state.currentStep === 1 && (
            <PostcodeStep
              state={state}
              onUpdate={update}
              onNext={advance}
            />
          )}
          {state.currentStep === 2 && (
            <WasteTypeStep
              state={state}
              onSetWasteType={setWasteType}
              onUpdate={update}
              onNext={advance}
              onBack={back}
            />
          )}
          {state.currentStep === 3 && (
            <SkipStep
              state={state}
              onUpdate={update}
              onNext={advance}
              onBack={back}
            />
          )}
          {state.currentStep === 4 && (
            <ReviewStep
              state={state}
              onBack={back}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </main>
  );
}