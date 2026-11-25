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

    // 2. Verifikasi Signature menggunakan SDK/Client jika NGW_WEBHOOK_SECRET disetel
    const webhookSecret =
      process.env.NGW_WEBHOOK_SECRET || process.env.NOTIFICATION_WEBHOOK_SECRET;
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

    // 4. Ekstrak data (mendukung single event, batch array `data`, maupun flat payload)
    const webhookId =
      payload.webhookId ||
      payload.webhook_id ||
      payload.id ||
      request.headers.get("webhook-id") ||
      request.headers.get("x-webhook-id");

    const rawItems: Array<Record<string, any>> = Array.isArray(payload.data)
      ? payload.data
      : [payload.data && typeof payload.data === "object" ? payload.data : payload];

    const normalizedItems = rawItems.map((item) => ({
      messageId: item.messageId || item.message_id || payload.messageId || payload.message_id,
      status: String(
        item.status || payload.status || payload.event || payload.type || "UNKNOWN"
      ).toUpperCase(),
      errorMessage:
        item.errorMessage ||
        item.error_message ||
        item.error ||
        payload.errorMessage ||
        payload.error_message ||
        payload.error ||
        null,
      recipient: item.recipient || payload.recipient || null,
      channel: item.channel || payload.channel || null,
    }));

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

    // 6. Update status notifikasi di database (mendukung single & batch update)
    const updatedLogs: any[] = [];
    for (const item of normalizedItems) {
      if (!item.messageId) continue;

      const updateData: Record<string, any> = {
        status: item.status,
        errorMessage: item.errorMessage,
        updatedAt: new Date(),
      };

      if (webhookId) updateData.webhookId = webhookId;
      if (item.recipient) updateData.recipient = item.recipient;
      if (item.channel) updateData.channel = item.channel;

      const setOnInsertData: Record<string, any> = {
        createdAt: new Date(),
      };
      if (!item.recipient) setOnInsertData.recipient = "UNKNOWN";
      if (!item.channel) setOnInsertData.channel = "UNKNOWN";

      const log = await NotificationLog.findOneAndUpdate(
        { messageId: item.messageId },
        {
          $set: updateData,
          $setOnInsert: setOnInsertData,
        },
        { new: true, upsert: true }
      );
      updatedLogs.push(log);
    }

    const primaryItem = normalizedItems[0] || { messageId: undefined, status: "UNKNOWN" };

    // 7. Simpan webhookId ke ProcessedWebhook untuk idempotency
    if (webhookId) {
      await ProcessedWebhook.create({
        webhookId,
        messageId: primaryItem.messageId,
        status: primaryItem.status,
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
          type: payload.type || null,
          processedCount: updatedLogs.length,
          messageId: primaryItem.messageId ?? null,
          status: primaryItem.status,
          updatedLog: updatedLogs[0] ?? null,
          updatedLogs,
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
