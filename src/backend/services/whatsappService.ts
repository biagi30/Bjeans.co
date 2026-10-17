// WhatsApp Service — Terintegrasi dengan Notification Gateway SDK
import { getNotificationClient } from "@/backend/config/notificationClient";
import { formatPhoneNumber } from "@/backend/utils/phoneUtils";
import { connectDatabase } from "@/backend/config/db";
import { NotificationLog } from "@/backend/models";

/**
 * Kirim pesan WhatsApp via Notification Gateway SDK
 *
 * Mendukung 2 mode:
 * 1. Template mode — kirim { templateCode, variables } (mis. "otp_login", "order_processing")
 * 2. Raw body mode — kirim { body } langsung (fallback jika template belum dibuat di dashboard NGW)
 */
async function sendWhatsApp(payload: {
  to: string;
  body?: string;
  templateCode?: string;
  variables?: Record<string, string>;
}): Promise<void> {
  const client = getNotificationClient();

  try {
    const res = await client.whatsapp.send({
      to: payload.to,
      body: payload.body,
      templateCode: payload.templateCode,
      variables: payload.variables,
    });

    console.log("[Notification Gateway WhatsApp Response]:", JSON.stringify(res, null, 2));

    const messageId = res?.data?.messageId || res?.messageId;
    if (messageId) {
      await connectDatabase();
      await NotificationLog.create({
        messageId,
        channel: "WHATSAPP",
        recipient: payload.to,
        templateCode: payload.templateCode,
        variables: payload.variables,
        status: res?.data?.status || "QUEUED",
        metadata: { type: "order_notification" },
      }).catch((err) =>
        console.warn("[NotificationLog] Gagal simpan log:", err.message)
      );
    }
  } catch (error: any) {
    console.error("[Notification Gateway WhatsApp Error]:", error.message || error);
    throw error;
  }
}

// ─── Helper: Format mata uang Rupiah ───
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Helper: Format ringkasan item pesanan ───
function formatItemsSummary(items: any[]): string {
  return items
    .map((item: any, i: number) => `  ${i + 1}. ${item.name} (x${item.quantity}) — ${formatRupiah(item.totalPrice)}`)
    .join("\n");
}

// ─── Helper: Bangun variabel untuk template NGW ───
// Placeholder harus sama persis dengan yang dipakai di template dashboard NGW.
function buildTemplateVariables(order: OrderNotificationData): Record<string, string> {
  return {
    nama: order.customerName,
    nomor_pesanan: order.orderNumber,
    detail_pesanan: formatItemsSummary(order.items),
    total: formatRupiah(order.totalAmount),
    alamat: order.shippingAddress ?? "-",
  };
}

/**
 * Kirim notifikasi WhatsApp memakai template Notification Gateway
 */
async function sendWhatsAppWithTemplate(
  phone: string,
  templateCode: string,
  variables: Record<string, string>
): Promise<void> {
  await sendWhatsApp({ to: phone, templateCode, variables });
}

// ─── Interfaces ───
export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  shippingAddress?: string;
}

/**
 * Kirim notifikasi WhatsApp: Pesanan sedang diproses (processing)
 * Isi pesan diambil dari template "order_processing" di dashboard NGW.
 */
export async function kirimNotifikasiPesananDiproses(
  phone: string,
  order: OrderNotificationData
): Promise<void> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[WhatsApp] Nomor telepon tidak valid, skip notifikasi: "${phone}"`);
    return;
  }

  await sendWhatsAppWithTemplate(
    formattedPhone,
    "order_processing",
    buildTemplateVariables(order)
  );
}

/**
 * Kirim notifikasi WhatsApp: Pesanan sudah dikirim (shipped)
 * Isi pesan diambil dari template "order_shipped" di dashboard NGW.
 */
export async function kirimNotifikasiPesananDikirim(
  phone: string,
  order: OrderNotificationData
): Promise<void> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[WhatsApp] Nomor telepon tidak valid, skip notifikasi: "${phone}"`);
    return;
  }

  await sendWhatsAppWithTemplate(
    formattedPhone,
    "order_shipped",
    buildTemplateVariables(order)
  );
}

/**
 * Kirim notifikasi WhatsApp: Pesanan selesai (done)
 * Isi pesan diambil dari template "order_done" di dashboard NGW.
 */
export async function kirimNotifikasiPesananSelesai(
  phone: string,
  order: OrderNotificationData
): Promise<void> {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.warn(`[WhatsApp] Nomor telepon tidak valid, skip notifikasi: "${phone}"`);
    return;
  }

  await sendWhatsAppWithTemplate(
    formattedPhone,
    "order_done",
    buildTemplateVariables(order)
  );
}
