import { NextRequest, NextResponse } from "next/server";
import { getSkips } from "@/lib/fixtures/skips";
import { normalizePostcode } from "@/lib/validators/postcode";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postcode  = searchParams.get("postcode") ?? "";
  const heavyWaste = searchParams.get("heavyWaste") === "true";

  // Postcode is required but we don't filter skips by it in this mock
  if (!postcode) {
    return NextResponse.json({ error: "postcode is required" }, { status: 400 });
  }

  return NextResponse.json({ skips: getSkips(heavyWaste) });
}