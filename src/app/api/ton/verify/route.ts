import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "TON payment verification is not implemented yet.",
    },
    { status: 501 }
  );
}