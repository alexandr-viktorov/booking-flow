// --- Postcode lookup ---
export interface PostcodeLookupRequest {
  postcode: string;
}
export interface Address {
  id: string;
  line1: string;
  city: string;
  postcode?: string;
}
export interface PostcodeLookupResponse {
  postcode: string;
  addresses: Address[];
}

// --- Waste types ---
export type PlasterboardOption = "segregated" | "mixed" | "removal_only" | null;
export interface WasteTypesRequest {
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: PlasterboardOption;
}
export interface WasteTypesResponse {
  ok: boolean;
}

// --- Skips ---
export interface Skip {
  size: string;
  price: number;
  disabled: boolean;
  disabledReason?: string;       // extra: explains WHY it's disabled
}
export interface SkipsResponse {
  skips: Skip[];
}

// --- Booking confirm ---
export interface BookingConfirmRequest {
  postcode: string;
  addressId: string;
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: PlasterboardOption;
  skipSize: string;
  price: number;
}
export interface BookingConfirmResponse {
  status: "success" | "error";
  bookingId?: string;
  message?: string;
}   