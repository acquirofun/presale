import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables.");

      return NextResponse.json(
        {
          error: "Server configuration error.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const body = await request.json();

    const walletAddress = body?.walletAddress;

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required." },
        { status: 400 }
      );
    }

    const wallet = walletAddress.trim().toLowerCase();

    if (wallet.length < 10) {
      return NextResponse.json(
        { error: "Invalid wallet address." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc(
      "signup_wallet_bonus",
      {
        p_wallet_address: wallet,
      }
    );

    if (error) {
      console.error("Wallet signup error:", error);

      return NextResponse.json(
        { error: "Failed to create wallet account." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      walletAddress: wallet,
      credits: data ?? 5000,
    });
  } catch (error) {
    console.error("Wallet signup API error:", error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}