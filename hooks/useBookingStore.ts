import { useState } from "react";
import type { Address, PlasterboardOption } from "@/lib/types";

export type WasteType = "general" | "heavy" | "plasterboard";
export type BookingStep = 1 | 2 | 3 | 4;

export interface BookingState {
  // Step 1
  postcode: string;
  selectedAddress: Address | null;
  manualAddress: string;

  // Step 2
  wasteType: WasteType | null;
  plasterboardOption: PlasterboardOption;

  // Step 3
  selectedSkipSize: string | null;
  selectedSkipPrice: number | null;

  // Navigation
  currentStep: BookingStep;
}

const INITIAL_STATE: BookingState = {
  postcode: "",
  selectedAddress: null,
  manualAddress: "",
  wasteType: null,
  plasterboardOption: null,
  selectedSkipSize: null,
  selectedSkipPrice: null,
  currentStep: 1,
};

export function useBookingStore() {
  const [state, setState] = useState<BookingState>(INITIAL_STATE);

  function update(partial: Partial<BookingState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  // CRITICAL: when waste type changes, always reset downstream state
  function setWasteType(wasteType: WasteType) {
    setState((prev) => ({
      ...prev,
      wasteType,
      plasterboardOption: null,  // reset plasterboard option
      selectedSkipSize: null,    // reset skip selection
      selectedSkipPrice: null,
    }));
  }

  function goToStep(step: BookingStep) {
    update({ currentStep: step });
  }

  function reset() {
    setState(INITIAL_STATE);
  }

  return { state, update, setWasteType, goToStep, reset };
}