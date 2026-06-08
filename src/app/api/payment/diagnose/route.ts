import { connectDatabase } from "@/backend/config/db";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
    },
    database: {
      status: "unknown",
      error: null,
    },
    config: {
      MONGODB_URI_set: !!process.env.MONGODB_URI,
      MIDTRANS_SERVER_KEY_set: !!process.env.MIDTRANS_SERVER_KEY,
      MIDTRANS_SERVER_KEY_prefix: process.env.MIDTRANS_SERVER_KEY
        ? process.env.MIDTRANS_SERVER_KEY.substring(0, 11) + "..."
        : "not_set",
      NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_set: !!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
      NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_prefix: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY.substring(0, 11) + "..."
        : "not_set",
      MIDTRANS_MERCHANT_ID_set: !!process.env.MIDTRANS_MERCHANT_ID,
    },
    midtrans_test: {
      success: false,
      mode: "unknown",
      url: "",
      status_code: null,
      response: null,
    },
  };

  // 1. Check Database connection
  try {
    await connectDatabase();
    diagnostics.database.status = "connected";
  } catch (err: any) {
    diagnostics.database.status = "failed";
    diagnostics.database.error = err.message || String(err);
  }

  // 2. Test Midtrans Snap API
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

  if (!serverKey) {
    diagnostics.midtrans_test.response = "Cannot test: MIDTRANS_SERVER_KEY is missing";
  } else {
    const isProduction = process.env.NODE_ENV === "production" && !clientKey.startsWith("SB-");
    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    diagnostics.midtrans_test.mode = isProduction ? "production" : "sandbox";
    diagnostics.midtrans_test.url = midtransUrl;

    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;
    const dummyOrderId = `diagnose-${Date.now().toString(36).toUpperCase()}`;

    const payload = {
      transaction_details: {
        order_id: dummyOrderId,
        gross_amount: 10000,
      },
      item_details: [
        {
          id: "dummy-item",
          price: 10000,
          quantity: 1,
          name: "Diagnostics Dummy Item",
        },
      ],
      customer_details: {
        first_name: "Diag",
        last_name: "Test",
        email: "diagnose@bjeans.co",
        phone: "081234567890",
      },
    };

    try {
      const response = await fetch(midtransUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify(payload),
      });

      diagnostics.midtrans_test.status_code = response.status;
      const resData = await response.json().catch(() => ({}));
      diagnostics.midtrans_test.response = resData;

      if (response.ok) {
        diagnostics.midtrans_test.success = true;
      }
    } catch (err: any) {
      diagnostics.midtrans_test.response = `Fetch failed: ${err.message || String(err)}`;
    }
  }

  return successResponse(diagnostics);
}

export const dynamic = "force-dynamic";
