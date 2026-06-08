import { connectDatabase } from "@/backend/config/db";
import { Order } from "@/backend/models";
import { isValidObjectId } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await connectDatabase();

    const body = await request.json().catch(() => ({}));
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return errorResponse("Missing required notification parameters", 400);
    }

    // Verify signature key
    const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
    const payloadToHash = String(order_id) + String(status_code) + String(gross_amount) + serverKey;
    const calculatedSignature = crypto
      .createHash("sha512")
      .update(payloadToHash)
      .digest("hex");

    if (calculatedSignature !== signature_key) {
      console.error("Signature verification failed", {
        received: signature_key,
        calculated: calculatedSignature,
      });
      return errorResponse("Invalid signature key", 401);
    }

    console.log(`Payment notification received for order_id: ${order_id}, status: ${transaction_status}`);

    // Parse order IDs — extract valid 24-char hex MongoDB ObjectIds from the order_id string
    // The order_id format is: "<objectId1>-<objectId2>-<timestamp>" 
    const allParts = String(order_id).split("-");
    const orderIds = allParts.filter((part: string) => /^[0-9a-fA-F]{24}$/.test(part));

    // Process payment status transitions
    let paymentStatus: "unpaid" | "paid" | "refunded" = "unpaid";
    let orderStatus: "waiting_payment" | "processing" | "done" | "shipped" | null = null;

    if (
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")
    ) {
      paymentStatus = "paid";
      orderStatus = "processing";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      paymentStatus = "unpaid";
      orderStatus = "waiting_payment";
    } else if (transaction_status === "pending") {
      paymentStatus = "unpaid";
      orderStatus = "waiting_payment";
    } else if (transaction_status === "refund" || transaction_status === "chargeback") {
      paymentStatus = "refunded";
    }

    // Update database records
    if (orderStatus !== null || paymentStatus) {
      for (const id of orderIds) {
        if (isValidObjectId(id)) {
          const updateData: any = { paymentStatus };
          if (orderStatus) {
            updateData.status = orderStatus;
          }

          const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
          );

          if (updatedOrder) {
            console.log(`Order ${id} successfully updated to paymentStatus: ${paymentStatus}, status: ${orderStatus}`);
          } else {
            console.warn(`Order ${id} not found in database for update.`);
          }
        }
      }
    }

    return successResponse({ message: "Notification handled successfully" });
  } catch (error: any) {
    console.error("Notification route error:", error);
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";
