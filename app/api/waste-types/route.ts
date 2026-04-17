import { NextRequest, NextResponse } from "next/server";
import type { WasteTypesRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body: WasteTypesRequest = await req.json();

  // Validate plasterboard logic
  if (body.plasterboard && !body.plasterboardOption) {
    return NextResponse.json(
      { error: "plasterboardOption required when plasterboard is true" },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true });
}