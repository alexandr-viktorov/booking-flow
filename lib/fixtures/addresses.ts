import type { Address } from "@/lib/types";

export const FIXTURE_ADDRESSES: Record<string, Address[] | null> = {
  "SW1A1AA": [
    { id: "addr_1",  line1: "10 Downing Street",          city: "London" },
    { id: "addr_2",  line1: "11 Downing Street",          city: "London" },
    { id: "addr_3",  line1: "12 Downing Street",          city: "London" },
    { id: "addr_4",  line1: "70 Whitehall",               city: "London" },
    { id: "addr_5",  line1: "Horse Guards Parade",        city: "London" },
    { id: "addr_6",  line1: "1 Parliament Street",        city: "London" },
    { id: "addr_7",  line1: "2 Parliament Street",        city: "London" },
    { id: "addr_8",  line1: "King Charles Street",        city: "London" },
    { id: "addr_9",  line1: "Clive Steps, King Charles St", city: "London" },
    { id: "addr_10", line1: "1 Treasury Buildings",       city: "London" },
    { id: "addr_11", line1: "Northumberland Avenue",      city: "London" },
    { id: "addr_12", line1: "Richmond Terrace",           city: "London" },
  ],
  "EC1A1BB": [],    // empty state
  "M11AE":   null,  // null signals: apply latency, then return normal data
  "BS14DJ":  null,  // null signals: check retry counter
};

// Fallback for any unrecognised postcode
export const DEFAULT_ADDRESSES: Address[] = [
  { id: "addr_default_1", line1: "1 High Street",  city: "Bristol" },
  { id: "addr_default_2", line1: "2 High Street",  city: "Bristol" },
  { id: "addr_default_3", line1: "3 Market Place", city: "Bristol" },
];