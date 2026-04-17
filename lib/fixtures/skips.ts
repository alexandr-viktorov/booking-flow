import type { Skip } from "@/lib/types";

// Base skip catalogue — always shown
const ALL_SKIPS: Skip[] = [
  { size: "2-yard",  price: 80,  disabled: false },
  { size: "4-yard",  price: 120, disabled: false },
  { size: "6-yard",  price: 160, disabled: false },
  { size: "8-yard",  price: 200, disabled: false },
  { size: "10-yard", price: 240, disabled: false },
  { size: "12-yard", price: 280, disabled: false },
  { size: "14-yard", price: 340, disabled: false },
  { size: "16-yard", price: 400, disabled: false },
];

// Sizes that cannot handle heavy waste
const HEAVY_WASTE_DISABLED = new Set(["2-yard", "4-yard"]);


/// Returns the skip catalogue, with certain sizes disabled if heavy waste is selected
// The key design decision: getSkips is a pure function driven by parameters, not a lookup table. 
// This makes it trivial to test in isolation and easy to extend.
export function getSkips(heavyWaste: boolean): Skip[] {
  return ALL_SKIPS.map((skip) => {
    if (heavyWaste && HEAVY_WASTE_DISABLED.has(skip.size)) {
      return {
        ...skip,
        disabled: true,
        disabledReason: "Too small for heavy waste loads",
      };
    }
    return skip;
  });
}