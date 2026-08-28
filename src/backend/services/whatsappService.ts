// WhatsApp Service — menggunakan fetch langsung ke Notification Gateway
// (menghindari ESM compatibility issue dengan Next.js Turbopack)

import { formatPhoneNumber } from "@/backend/utils/phoneUtils";

const NGW_API_KEY = process.env.NGW_API_KEY || "";
const NGW_BASE_URL = process.env.NGW_BASE_URL || "http://localhost:3001";
const NGW_TIMEOUT = Number(process.env.NGW_TIMEOUT) || 10000;

/**
 * Kirim pesan WhatsApp via Notification Gateway REST API
 */
async function sendWhatsApp(payload: {
  to: string;
  body: string;
}): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NGW_TIMEOUT);

  try {
    const res = await fetch(`${NGW_BASE_URL}/v1/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NGW_API_KEY,
      },
      body: JSON.stringify({
        channel: "WHATSAPP",
        recipient: payload.to,
        body: payload.body,
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    console.log("[WhatsApp Notification Response]:", JSON.stringify(data, null, 2));

    if (!res.ok) {
      throw new Error(
        (data as any).message || (data as any)?.error?.message || `Notification Gateway error: ${res.status}`
      );
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(`Request timeout setelah ${NGW_TIMEOUT}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
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

// ─── Interfaces ───
interface OrderNotificationData {
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
 * Kirim notifikasi WhatsApp: Pesanan sudah dikirim (shipped)
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

  const message = [
    `📦 *Pesanan Anda Sedang Dikirim!*`,
    ``,
    `Halo ${order.customerName},`,
    ``,
    `Pesanan Anda dengan nomor *${order.orderNumber}* telah dikirim dan sedang dalam perjalanan menuju alamat Anda.`,
    ``,
    `🧾 *Detail Pesanan:*`,
    formatItemsSummary(order.items),
    ``,
    `💰 *Total:* ${formatRupiah(order.totalAmount)}`,
    order.shippingAddress ? `📍 *Alamat:* ${order.shippingAddress}` : "",
    ``,
    `Terima kasih telah berbelanja di *Bjeans.co*! 🙏`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendWhatsApp({ to: formattedPhone, body: message });
}

/**
 * Kirim notifikasi WhatsApp: Pesanan selesai (done)
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

  const message = [
    `✅ *Pesanan Anda Telah Selesai!*`,
    ``,
    `Halo ${order.customerName},`,
    ``,
    `Pesanan Anda dengan nomor *${order.orderNumber}* telah selesai diproses.`,
    ``,
    `🧾 *Detail Pesanan:*`,
    formatItemsSummary(order.items),
    ``,
    `💰 *Total:* ${formatRupiah(order.totalAmount)}`,
    ``,
    `Kami harap Anda puas dengan produk dari *Bjeans.co*! ⭐`,
    `Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami.`,
  ].join("\n");

  await sendWhatsApp({ to: formattedPhone, body: message });
}
