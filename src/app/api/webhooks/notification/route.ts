import { getNotificationClient } from "@/backend/config/notificationClient";

interface NotificationStatusItem {
  messageId?: string;
  status?: string;
  error?: string | null;
}

interface NotificationWebhookEvent {
  type: string;
  created_at?: string;
  data?: NotificationStatusItem | NotificationStatusItem[];
}

/**
 * Menerima callback status pengiriman (SENT / FAILED) dari Notification Gateway.
 * Endpoint: POST /api/webhooks/notification
 */
export async function POST(request: Request) {
  const secret =
    process.env.NGW_WEBHOOK_SECRET || process.env.NOTIFICATION_WEBHOOK_SECRET || "";

  if (!secret) {
    console.error("[NGW Webhook] NGW_WEBHOOK_SECRET belum dikonfigurasi di .env");
    return Response.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const id = request.headers.get("webhook-id") || "";
  const timestamp = request.headers.get("webhook-timestamp") || "";
  const signature = request.headers.get("webhook-signature") || "";

  let event: NotificationWebhookEvent;
  try {
    const client = getNotificationClient();
    event = client.webhooks.verify({
      payload: rawBody,
      headers: { id, timestamp, signature },
      secret,
    }) as NotificationWebhookEvent;
  } catch (err: any) {
    console.warn(`[NGW Webhook] Verifikasi signature gagal: ${err?.message || err}`);
    return Response.json(
      { error: err?.message || "Invalid signature" },
      { status: 401 }
    );
  }

  const items = Array.isArray(event.data)
    ? event.data
    : event.data
      ? [event.data]
      : [];

  if (
    event.type === "notification.status_update" ||
    event.type === "notification.batch_update"
  ) {
    for (const item of items) {
      if (item.status === "FAILED") {
        console.error(
          `[NGW Webhook] Notifikasi GAGAL (${item.messageId ?? "unknown"}): ${item.error ?? "Unknown error"}`
        );
      } else {
        console.log(
          `[NGW Webhook] Status update (${event.type}): messageId=${item.messageId ?? "unknown"} status=${item.status ?? "unknown"}`
        );
      }
    }
  } else {
    console.log(`[NGW Webhook] Event diterima: ${event.type}`, event.data ?? {});
  }

  return Response.json({ received: true }, { status: 200 });
}

export const dynamic = "force-dynamic";
