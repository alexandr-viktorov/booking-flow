import { NextRequest, NextResponse } from "next/server";
import { normalizePostcode, isValidUKPostcode } from "@/lib/validators/postcode";
import { FIXTURE_ADDRESSES, DEFAULT_ADDRESSES } from "@/lib/fixtures/addresses";
import type { PostcodeLookupRequest } from "@/lib/types";

// Per-process retry counter — resets only on server restart
const retryCounts: Record<string, number> = {};

export async function POST(req: NextRequest) {
  const body: PostcodeLookupRequest = await req.json();
  const raw = body.postcode ?? "";

  if (!isValidUKPostcode(raw)) {
    return NextResponse.json(
      { error: "Invalid UK postcode format" },
      { status: 400 }
    );
  }

  const key = normalizePostcode(raw);

  // M1 1AE — simulated latency
  if (key === "M11AE") {
    await new Promise((r) => setTimeout(r, 2500));
  }

  // BS1 4DJ — 500 on first attempt, 200 on retry
  if (key === "BS14DJ") {
    retryCounts[key] = (retryCounts[key] ?? 0) + 1;
    if (retryCounts[key] === 1) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    // Reset for next test run
    retryCounts[key] = 0;
  }

  const addresses = FIXTURE_ADDRESSES[key];

  // EC1A 1BB — explicit empty array
  if (Array.isArray(addresses)) {
    return NextResponse.json({ postcode: raw, addresses });
  }

  // All other postcodes — default addresses
  return NextResponse.json({ postcode: raw, addresses: DEFAULT_ADDRESSES });
}

// Test utility endpoint — Playwright resets the counter between runs
export async function DELETE() {
  Object.keys(retryCounts).forEach((k) => delete retryCounts[k]);
  return NextResponse.json({ ok: true });
}