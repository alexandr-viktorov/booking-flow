import { NextRequest, NextResponse } from "next/server";
import type { BookingConfirmRequest } from "@/lib/types";

let bookingCounter = 1000;

export async function POST(req: NextRequest) {
  const body: BookingConfirmRequest = await req.json();

  // Basic presence check
  const required = ["postcode","addressId","skipSize","price"] as const;
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 422 }
      );
    }
  }

  bookingCounter++;
  const bookingId = `BK-${bookingCounter}`;

  // Simulate a realistic delay
  await new Promise((r) => setTimeout(r, 600));

  return NextResponse.json({ status: "success", bookingId });
}