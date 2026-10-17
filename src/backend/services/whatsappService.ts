// WhatsApp Service — menggunakan fetch langsung ke Notification Gateway
// (menghindari ESM compatibility issue dengan Next.js Turbopack)

import { formatPhoneNumber } from "@/backend/utils/phoneUtils";

const NGW_API_KEY = process.env.NGW_API_KEY || "";
const NGW_BASE_URL = process.env.NGW_BASE_URL || "http://localhost:3001";
const NGW_TIMEOUT = Number(process.env.NGW_TIMEOUT) || 10000;

/**
 * Kirim pesan WhatsApp via Notification Gateway REST API
 *
 * Mendukung 2 mode (pola yang sama dengan otpService.ts):
 * 1. Template mode — kirim { templateCode, variables } (seperti template "otp_login" di OTP login)
 * 2. Raw body mode — kirim { body } langsung (fallback jika template belum dibuat di dashboard NGW)
 */
async function sendWhatsApp(payload: {
  to: string;
  body?: string;
  templateCode?: string;
  variables?: Record<string, string>;
}): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NGW_TIMEOUT);

  const requestBody: Record<string, any> = {
    channel: "WHATSAPP",
    recipient: payload.to,
  };
  if (payload.templateCode) {
    requestBody.templateCode = payload.templateCode;
    requestBody.variables = payload.variables ?? {};
  } else {
    requestBody.body = payload.body;
  }

  try {
    const res = await fetch(`${NGW_BASE_URL}/v1/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NGW_API_KEY,
      },
      body: JSON.stringify(requestBody),
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

// ─── Helper: Bangun variabel untuk template NGW ───
// Placeholder harus sama persis dengan yang dipakai di template dashboard NGW.
// NGW akan me-render {{nama}}, {{nomor_pesanan}}, {{detail_pesanan}}, {{total}}, {{alamat}}
// dengan nilai dari objek di bawah ini (mekanisme sama persis seperti template "otp_login").
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
 * (mekanisme sama persis seperti "otp_login" di otpService.ts,
 * hanya beda channel: WHATSAPP vs EMAIL).
 */
async function sendWhatsAppWithTemplate(
  phone: string,
  templateCode: string,
  variables: Record<string, string>
): Promise<void> {
  await sendWhatsApp({ to: phone, templateCode, variables });
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
