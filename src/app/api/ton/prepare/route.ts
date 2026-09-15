import { NextResponse } from "next/server";
import { Address, beginCell } from "@ton/core";
import { TonClient } from "@ton/ton";

const TON_USDT_MASTER =
  process.env.NEXT_PUBLIC_TON_USDT_MASTER ||
  "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs";

const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY;

const TONCENTER_ENDPOINT =
  "https://toncenter.com/api/v2/jsonRPC";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const walletAddress =
      typeof body.walletAddress === "string"
        ? body.walletAddress.trim()
        : "";

    const amountBaseUnits =
      typeof body.amountBaseUnits === "string"
        ? body.amountBaseUnits.trim()
        : "";

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "TON wallet address is required.",
        },
        { status: 400 }
      );
    }

    if (!amountBaseUnits || !/^\d+$/.test(amountBaseUnits)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid USDT amount.",
        },
        { status: 400 }
      );
    }

    const owner = Address.parse(walletAddress);
    const master = Address.parse(TON_USDT_MASTER);

    const client = new TonClient({
      endpoint: TONCENTER_ENDPOINT,
      ...(TONCENTER_API_KEY
        ? { apiKey: TONCENTER_API_KEY }
        : {}),
    });

    /*
     * Resolve the user's USDT Jetton Wallet.
     *
     * This is NOT the user's normal TON wallet.
     */
    const result = await client.runMethod(
      master,
      "get_wallet_address",
      [
        {
          type: "slice",
          cell: beginCell()
            .storeAddress(owner)
            .endCell(),
        },
      ]
    );

    const userJettonWallet =
      result.stack.readAddress();

    return NextResponse.json({
      success: true,
      jettonWallet:
        userJettonWallet.toString({
          urlSafe: true,
          bounceable: true,
        }),
      jettonMaster: TON_USDT_MASTER,
    });
  } catch (error) {
    console.error(
      "TON prepare error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to prepare TON USDT transaction.",
      },
      { status: 500 }
    );
  }
}