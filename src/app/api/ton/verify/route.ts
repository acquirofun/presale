
import { NextResponse } from "next/server";
import { Address } from "@ton/core";
import { createClient } from "@supabase/supabase-js";
import { calculateCurrentRate } from "@/utils/rateCalculator";

const TON_USDT_MASTER =
  process.env.NEXT_PUBLIC_TON_USDT_MASTER ||
  "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs";

const TON_PAYMENT_WALLET =
  process.env.NEXT_PUBLIC_TON_PAYMENT_WALLET ||
  "UQBulg-JME0aSAoMNQMwNiM0bVHPrphH_df8g2iiNPEbT-6Y";

const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const TONCENTER_BASE = "https://toncenter.com/api/v3";

const MIN_USDT_BASE_UNITS = BigInt("5000000");

type TonTransfer = {
  transaction_hash?: string;
  transaction_aborted?: boolean;
  jetton_master?: string;
  destination?: string;
  source?: string;
  source_wallet?: string;
  amount?: string | number;
  query_id?: string | number;
};

type TonTransfersResponse = {
  jetton_transfers?: TonTransfer[];
};

type VerifyRequestBody = {
  walletAddress?: unknown;
  amountBaseUnits?: unknown;
  referralCode?: unknown;
  queryId?: unknown;
};

function rawAddress(value: string): string {
  return Address.parse(value).toRawString();
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

async function getJettonTransfers(): Promise<TonTransfersResponse> {
  const url = new URL(
    `${TONCENTER_BASE}/jetton/transfers`
  );

  url.searchParams.set(
    "owner_address",
    TON_PAYMENT_WALLET
  );

  url.searchParams.set(
    "jetton_master",
    TON_USDT_MASTER
  );

  url.searchParams.set(
    "direction",
    "in"
  );

  url.searchParams.set(
    "limit",
    "100"
  );

  url.searchParams.set(
    "sort",
    "desc"
  );

  /*
   * Only look back a few minutes.
   * The frontend calls verification immediately
   * after the wallet broadcasts the transaction.
   */
  const now = Math.floor(Date.now() / 1000);

  url.searchParams.set(
    "start_utime",
    String(now - 10 * 60)
  );

  const response = await fetch(
    url.toString(),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(TONCENTER_API_KEY
          ? {
              "X-API-Key": TONCENTER_API_KEY,
            }
          : {}),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `TON Center returned HTTP ${response.status}.`
    );
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null
  ) {
    throw new Error(
      "Invalid response received from TON Center."
    );
  }

  const responseData =
    data as TonTransfersResponse;

  return responseData;
}

function findMatchingTransfer(
  transfers: TonTransfer[],
  walletAddress: string,
  amountBaseUnits: bigint
): TonTransfer | undefined {
  const expectedSender =
    rawAddress(walletAddress);

  const expectedRecipient =
    rawAddress(TON_PAYMENT_WALLET);

  const expectedMaster =
    rawAddress(TON_USDT_MASTER);

  return transfers.find((transfer) => {
    if (
      transfer.transaction_aborted === true
    ) {
      return false;
    }

    if (
      !isString(
        transfer.transaction_hash
      ) ||
      !transfer.transaction_hash
    ) {
      return false;
    }

    if (
      !isString(
        transfer.jetton_master
      )
    ) {
      return false;
    }

    if (
      rawAddress(
        transfer.jetton_master
      ) !== expectedMaster
    ) {
      return false;
    }

    if (
      !isString(
        transfer.destination
      )
    ) {
      return false;
    }

    if (
      rawAddress(
        transfer.destination
      ) !== expectedRecipient
    ) {
      return false;
    }

    if (
      !isString(transfer.source)
    ) {
      return false;
    }

    if (
      rawAddress(
        transfer.source
      ) !== expectedSender
    ) {
      return false;
    }

    try {
      if (
        transfer.amount ===
        undefined ||
        transfer.amount === null
      ) {
        return false;
      }

      if (
        BigInt(
          String(transfer.amount)
        ) !== amountBaseUnits
      ) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  });
}

export async function POST(
  request: Request
) {
  try {
    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Supabase server configuration is missing.",
        },
        { status: 500 }
      );
    }

    if (!TONCENTER_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "TON Center API key is not configured.",
        },
        { status: 500 }
      );
    }

    const rawBody: unknown =
      await request.json();

    if (
      typeof rawBody !== "object" ||
      rawBody === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const body =
      rawBody as VerifyRequestBody;

    const walletAddress =
      isString(body.walletAddress)
        ? body.walletAddress.trim()
        : "";

    const amountBaseUnitsString =
      isString(body.amountBaseUnits)
        ? body.amountBaseUnits.trim()
        : "";

    const referralCode =
      isString(body.referralCode)
        ? body.referralCode
            .trim()
            .toUpperCase()
        : "";

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "TON wallet address is required.",
        },
        { status: 400 }
      );
    }

    if (!amountBaseUnitsString) {
      return NextResponse.json(
        {
          success: false,
          message:
            "USDT amount is required.",
        },
        { status: 400 }
      );
    }

    let amountBaseUnits: bigint;

    try {
      amountBaseUnits =
        BigInt(amountBaseUnitsString);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid USDT amount.",
        },
        { status: 400 }
      );
    }

    if (
      amountBaseUnits <
      MIN_USDT_BASE_UNITS
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Minimum purchase is 5 USDT.",
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the supplied wallet is a
     * valid TON address.
     */
    try {
      Address.parse(walletAddress);
      Address.parse(TON_PAYMENT_WALLET);
      Address.parse(TON_USDT_MASTER);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid TON address configuration.",
        },
        { status: 400 }
      );
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * Validate referral code server-side.
     *
     * Never trust the browser to tell us
     * whether a referral code is valid.
     */
    let referrerWalletAddress:
      string | null = null;

    if (referralCode) {
      const {
        data: referral,
        error: referralError,
      } = await supabase
        .from("referral_codes")
        .select(
          "code,referrer_wallet_address,is_active"
        )
        .eq("code", referralCode)
        .eq("is_active", true)
        .maybeSingle();

      if (referralError) {
        console.error(
          "Referral lookup error:",
          referralError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to validate referral code.",
          },
          { status: 500 }
        );
      }

      if (!referral) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid or inactive referral code.",
          },
          { status: 400 }
        );
      }

      if (
        isString(
          referral.referrer_wallet_address
        )
      ) {
        referrerWalletAddress =
          referral.referrer_wallet_address;
      }
    }

    /*
     * Look for a matching confirmed Jetton transfer.
     *
     * The frontend does NOT determine whether
     * payment succeeded.
     */
    let transfer:
      | TonTransfer
      | undefined;

    /*
     * TON Center's indexer can need a few seconds
     * after the wallet broadcasts the transaction.
     */
    for (
      let attempt = 0;
      attempt < 8;
      attempt++
    ) {
      const data =
        await getJettonTransfers();

      const transfers =
        Array.isArray(
          data.jetton_transfers
        )
          ? data.jetton_transfers
          : [];

      transfer =
        findMatchingTransfer(
          transfers,
          walletAddress,
          amountBaseUnits
        );

      if (transfer) {
        break;
      }

      await new Promise<void>(
        (resolve) =>
          setTimeout(
            resolve,
            1500
          )
      );
    }

    if (!transfer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "TON payment was sent, but blockchain verification is still pending. Please wait a few seconds and try Verify again.",
          pending: true,
        },
        { status: 202 }
      );
    }

    const txHash =
      transfer.transaction_hash;

    if (!txHash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verified transfer does not contain a transaction hash.",
        },
        { status: 500 }
      );
    }

    /*
     * Duplicate protection.
     */
    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("transactions")
      .select(
        "id,status,referral_bonus_points"
      )
      .eq("tx_hash", txHash)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Existing transaction lookup error:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to check transaction status.",
        },
        { status: 500 }
      );
    }

    if (existing) {
      if (
        existing.status ===
        "SUCCESS"
      ) {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          transactionId:
            existing.id,
          creditsAwarded:
            Number(
              existing.referral_bonus_points ||
                0
            ),
          message:
            "This TON transaction has already been processed.",
        });
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "This TON transaction is already being processed.",
        },
        { status: 409 }
      );
    }

    /*
     * Server-side credit calculation.
     */
    const usdtAmount =
      Number(amountBaseUnits) /
      1_000_000;

    const currentRate =
      calculateCurrentRate()
        .currentRate;

    const baseCredits = Math.floor(
      usdtAmount * currentRate
    );

    /*
     * Keep your current UI's +15% buyer
     * referral bonus behavior.
     */
    const referralBonusPoints =
      referrerWalletAddress
        ? Math.floor(
            baseCredits * 0.15
          )
        : 0;

    const totalCredits =
      baseCredits +
      referralBonusPoints;

    /*
     * Insert PENDING first so your existing
     * SUCCESS transition trigger can run.
     */
    const {
      data: inserted,
      error: insertError,
    } = await supabase
      .from("transactions")
      .insert({
        sender_address:
          walletAddress,
        recipient_address:
          TON_PAYMENT_WALLET,
        amount: usdtAmount,
        chain: "TON",
        tx_hash: txHash,
        status: "PENDING",
        referral_code_used:
          referrerWalletAddress
            ? referralCode
            : null,
        referral_bonus_points:
          referralBonusPoints,
        referrer_wallet_address:
          referrerWalletAddress,
      })
      .select("id")
      .single();

    if (insertError) {
      /*
       * A second simultaneous request may have
       * processed the same transaction.
       */
      if (
        insertError.code ===
        "23505"
      ) {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          message:
            "Transaction has already been processed.",
        });
      }

      console.error(
        "TON transaction insert error:",
        insertError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to record TON transaction.",
        },
        { status: 500 }
      );
    }

    /*
     * Credit buyer.
     */
    const {
      data: existingCredits,
      error: creditReadError,
    } = await supabase
      .from("user_credits")
      .select("credits")
      .eq(
        "wallet_address",
        walletAddress
      )
      .maybeSingle();

    if (creditReadError) {
      throw creditReadError;
    }

    const previousCredits =
      BigInt(
        String(
          existingCredits?.credits ||
            0
        )
      );

    const newCredits =
      previousCredits +
      BigInt(totalCredits);

    const {
      error: creditWriteError,
    } = await supabase
      .from("user_credits")
      .upsert(
        {
          wallet_address:
            walletAddress,
          credits:
            newCredits.toString(),
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "wallet_address",
        }
      );

    if (creditWriteError) {
      throw creditWriteError;
    }

    /*
     * Mark SUCCESS.
     *
     * Your existing trigger:
     * trigger_update_referral_stats
     *
     * runs here.
     */
    const {
      error: successError,
    } = await supabase
      .from("transactions")
      .update({
        status: "SUCCESS",
      })
      .eq("id", inserted.id);

    if (successError) {
      throw successError;
    }

    return NextResponse.json({
      success: true,
      transactionId: inserted.id,
      txHash,
      amount: usdtAmount,
      baseCredits,
      referralBonusPoints,
      creditsAwarded: totalCredits,
      message:
        "TON USDT payment verified and credits awarded.",
    });
  } catch (error) {
    console.error(
      "TON verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "TON payment verification failed.",
      },
      { status: 500 }
    );
  }
}

