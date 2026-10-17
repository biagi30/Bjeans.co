import { NextRequest } from "next/server";
import { connectDatabase } from "@/backend/config/db";
import { NotificationLog, ProcessedWebhook } from "@/backend/models";
import { getNotificationClient } from "@/backend/config/notificationClient";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

/**
 * POST /api/webhook/notification
 * Menerima pembaruan status pengiriman pesan dari Notification Gateway microservice.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Baca raw body untuk verifikasi signature HMAC
    const rawBody = await request.text();

    if (!rawBody) {
      return errorResponse("Body request kosong", 400);
    }

    // 2. Verifikasi Signature menggunakan SDK jika NGW_WEBHOOK_SECRET disetel
    const webhookSecret = process.env.NGW_WEBHOOK_SECRET;
    const client = getNotificationClient();

    if (webhookSecret) {
      const isValid = client.webhooks.verify({
        payload: rawBody,
        headers: request.headers,
        secret: webhookSecret,
      });

      if (!isValid) {
        console.warn("[Webhook Notification] Signature tidak valid!");
        return errorResponse("Invalid webhook signature", 401);
      }
    } else {
      console.warn(
        "[Webhook Notification] NGW_WEBHOOK_SECRET belum disetel di environment. Memproses webhook tanpa validasi signature."
      );
    }

    // 3. Parse JSON payload
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return errorResponse("Format JSON tidak valid", 400);
    }

    console.log("[Webhook Notification Payload]:", JSON.stringify(payload, null, 2));

    // 4. Ekstrak data (mendukung format nested `data` maupun flat)
    const webhookId =
      payload.webhookId ||
      payload.webhook_id ||
      payload.id ||
      request.headers.get("x-webhook-id") ||
      request.headers.get("webhook-id");

    const messageId =
      payload.messageId ||
      payload.message_id ||
      payload.data?.messageId ||
      payload.data?.message_id;

    const status = (
      payload.status ||
      payload.data?.status ||
      payload.event ||
      "UNKNOWN"
    ).toUpperCase();

    const errorMessage =
      payload.errorMessage ||
      payload.error_message ||
      payload.error ||
      payload.data?.error ||
      payload.data?.errorMessage ||
      null;

    const recipient =
      payload.recipient ||
      payload.data?.recipient ||
      null;

    const channel =
      payload.channel ||
      payload.data?.channel ||
      null;

    await connectDatabase();

    // 5. Cek Idempotency: jika webhookId sudah diproses sebelumnya, hindari duplikasi
    if (webhookId) {
      const alreadyProcessed = await ProcessedWebhook.findOne({ webhookId });
      if (alreadyProcessed) {
        console.log(`[Webhook Notification] Webhook ID ${webhookId} sudah diproses, lewati.`);
        return successResponse(
          {
            received: true,
            idempotent: true,
            message: "Webhook already processed",
          },
          200
        );
      }
    }

    // 6. Update status notifikasi di database
    let updatedLog = null;
    if (messageId) {
      const updateData: Record<string, any> = {
        status,
        errorMessage,
        updatedAt: new Date(),
      };

      if (webhookId) updateData.webhookId = webhookId;
      if (recipient) updateData.recipient = recipient;
      if (channel) updateData.channel = channel;

      const setOnInsertData: Record<string, any> = {
        createdAt: new Date(),
      };
      if (!recipient) setOnInsertData.recipient = "UNKNOWN";
      if (!channel) setOnInsertData.channel = "UNKNOWN";

      updatedLog = await NotificationLog.findOneAndUpdate(
        { messageId },
        {
          $set: updateData,
          $setOnInsert: setOnInsertData,
        },
        { new: true, upsert: true }
      );
    }

    // 7. Simpan webhookId ke ProcessedWebhook untuk idempotency
    if (webhookId) {
      await ProcessedWebhook.create({
        webhookId,
        messageId,
        status,
        processedAt: new Date(),
      }).catch((err) => {
        // Abaikan error duplicate key
        console.warn("[Webhook Notification] Duplicate webhook record ignored:", err.message);
      });
    }

    // 8. Berikan respons HTTP 200 ke Gateway
    return successResponse(
      {
        received: true,
        message: "Webhook processed successfully",
        data: {
          messageId,
          status,
          updatedLog,
        },
      },
      200
    );
  } catch (error: any) {
    console.error("[Webhook Notification Error]:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * GET /api/webhook/notification
 * Opsional: Memeriksa daftar riwayat status notifikasi dan webhook terbaru (untuk debug/admin).
 */
export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const messageId = searchParams.get("messageId");

    const query: Record<string, any> = {};
    if (messageId) {
      query.messageId = messageId;
    }

    const logs = await NotificationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse(
      {
        total: logs.length,
        logs,
      },
      200
    );
  } catch (error: any) {
    return errorResponse(error.message || "Gagal mengambil log notifikasi", 500);
  }
}

export const dynamic = "force-dynamic";
