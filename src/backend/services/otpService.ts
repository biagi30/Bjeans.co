// OTP Service — Terintegrasi dengan Notification Gateway SDK
import { getNotificationClient } from "@/backend/config/notificationClient";
import { formatPhoneNumber } from "@/backend/utils/phoneUtils";
import { connectDatabase } from "@/backend/config/db";
import { NotificationLog } from "@/backend/models";

// In-memory OTP store (pakai Redis/DB untuk production)
interface OtpEntry {
  otp: string;
  expiresAt: number;
}
const otpStore = new Map<string, OtpEntry>();

// Generate OTP 6 digit
export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Kirim email via Notification Gateway SDK
 */
async function sendEmail(payload: {
  to: string;
  templateCode: string;
  variables: Record<string, string>;
}): Promise<any> {
  const client = getNotificationClient();
  const res = await client.email.send({
    to: payload.to,
    templateCode: payload.templateCode,
    variables: payload.variables,
  });
  console.log("[Notification Gateway Email Response]:", JSON.stringify(res, null, 2));

  const messageId = res?.data?.messageId || res?.messageId;
  if (messageId) {
    await connectDatabase();
    await NotificationLog.create({
      messageId,
      channel: "EMAIL",
      recipient: payload.to,
      templateCode: payload.templateCode,
      variables: payload.variables,
      status: res?.data?.status || "QUEUED",
      metadata: { type: "otp_email" },
    }).catch((err) =>
      console.warn("[NotificationLog] Gagal simpan log email OTP:", err.message)
    );
  }

  return res;
}

/**
 * Kirim WhatsApp OTP via Notification Gateway SDK
 * Sesuai contoh integrasi:
 * client.whatsapp.send({
 *   to: "6281234567890",
 *   templateCode: "otp_login",
 *   variables: { nama: "Budi", otp: "123456" }
 * })
 */
export async function sendWhatsAppOTP(payload: {
  to: string;
  nama: string;
  otp: string;
}): Promise<any> {
  const client = getNotificationClient();
  const formattedPhone = formatPhoneNumber(payload.to) || payload.to;

  const result = await client.whatsapp.send({
    to: formattedPhone,
    templateCode: "otp_login",
    variables: {
      nama: payload.nama,
      otp: payload.otp,
    },
    body: `Halo ${payload.nama},\n\nKode verifikasi OTP login Bjeans.co Anda adalah: *${payload.otp}*.\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`,
  });

  console.log("[Notification Gateway WhatsApp OTP Response]:", JSON.stringify(result, null, 2));

  const messageId = result?.data?.messageId || result?.messageId;
  if (messageId) {
    await connectDatabase();
    await NotificationLog.create({
      messageId,
      channel: "WHATSAPP",
      recipient: formattedPhone,
      templateCode: "otp_login",
      variables: { nama: payload.nama, otp: payload.otp },
      status: result?.data?.status || "QUEUED",
      metadata: { type: "otp_whatsapp" },
    }).catch((err) =>
      console.warn("[NotificationLog] Gagal simpan log WA OTP:", err.message)
    );
  }

  return result;
}

/**
 * Kirim OTP ke pengguna (prioritas WhatsApp jika nomor valid, fallback ke Email)
 */
export async function kirimOTP(
  email: string,
  namaUser: string = "Pengguna",
  phone?: string
): Promise<{ success: boolean; message: string; channel?: string }> {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit

  otpStore.set(email, { otp, expiresAt });

  // Support Mock Mode untuk testing lokal / staging
  if (process.env.NOTIFICATION_MOCK_MODE === "true") {
    const mockChannel = phone ? "whatsapp" : "email";
    console.log(
      `[OTP Mock Mode] Kode OTP untuk ${email}${phone ? ` (${phone})` : ""}: ${otp} (channel: ${mockChannel})`
    );
    return {
      success: true,
      message: `[MOCK MODE] Kode OTP Anda: ${otp}`,
      channel: "mock",
    };
  }

  const formattedPhone = phone ? formatPhoneNumber(phone) : null;
  let sentViaWhatsApp = false;

  // Coba kirim via WhatsApp jika nomor HP valid tersedia
  if (formattedPhone) {
    try {
      await sendWhatsAppOTP({
        to: formattedPhone,
        nama: namaUser,
        otp,
      });
      sentViaWhatsApp = true;
    } catch (waErr: any) {
      console.warn(
        `[OTP Service] WhatsApp OTP gagal (${waErr?.message || waErr}), beralih ke Email...`
      );
    }
  } else if (phone) {
    console.warn(
      `[OTP Service] Format nomor WhatsApp tidak valid (${phone}), beralih ke Email...`
    );
  }

  // Fallback ke Email jika WhatsApp tidak tersedia atau gagal
  if (!sentViaWhatsApp) {
    try {
      await sendEmail({
        to: email,
        templateCode: "otp_login",
        variables: {
          otp,
          nama: namaUser,
        },
      });
    } catch (emailErr: any) {
      console.error(
        `[OTP Service] Email OTP juga gagal (${emailErr?.message || emailErr}).`
      );
      throw new Error(
        `Gagal mengirim OTP via WhatsApp maupun Email: ${emailErr?.message || "Gateway error"}`
      );
    }
  }

  return {
    success: true,
    message: sentViaWhatsApp
      ? `OTP telah dikirim ke WhatsApp (${formattedPhone})`
      : `OTP telah dikirim ke Email (${email})`,
    channel: sentViaWhatsApp ? "whatsapp" : "email",
  };
}

/**
 * Verifikasi OTP yang diinput pengguna
 */
export function verifikasiOTP(
  email: string,
  inputOTP: string
): { valid: boolean; message: string } {
  const data = otpStore.get(email);

  if (!data) {
    return { valid: false, message: "OTP tidak ditemukan, minta kode baru" };
  }

  if (Date.now() > data.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: "OTP sudah kadaluarsa, minta kode baru" };
  }

  if (data.otp !== inputOTP) {
    return { valid: false, message: "Kode OTP salah" };
  }

  otpStore.delete(email); // Hapus setelah dipakai
  return { valid: true, message: "OTP valid!" };
}
