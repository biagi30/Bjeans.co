// OTP Service — Terintegrasi dengan Notification Gateway SDK
import { getNotificationClient } from "@/backend/config/notificationClient";
import { formatPhoneNumber } from "@/backend/utils/phoneUtils";

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
  });

  console.log("[Notification Gateway WhatsApp OTP Response]:", JSON.stringify(result, null, 2));
  return result;
}

/**
 * Kirim OTP ke pengguna (otomatis WhatsApp jika ada phone, fallback ke Email)
 */
export async function kirimOTP(
  email: string,
  namaUser: string = "Pengguna",
  phone?: string
): Promise<{ success: boolean; message: string; channel?: string }> {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit

  otpStore.set(email, { otp, expiresAt });

  let sentViaWhatsApp = false;

  // Coba kirim via WhatsApp jika nomor HP tersedia
  if (phone) {
    try {
      await sendWhatsAppOTP({
        to: phone,
        nama: namaUser,
        otp,
      });
      sentViaWhatsApp = true;
    } catch (waErr: any) {
      console.warn(
        `[OTP Service] WhatsApp OTP gagal (${waErr.message}), beralih ke Email...`
      );
    }
  }

  // Jika belum terkirim via WhatsApp, kirim via Email
  if (!sentViaWhatsApp) {
    await sendEmail({
      to: email,
      templateCode: "otp_login",
      variables: {
        otp,
        nama: namaUser,
      },
    });
  }

  return {
    success: true,
    message: sentViaWhatsApp
      ? "OTP telah dikirim ke WhatsApp kamu"
      : "OTP telah dikirim ke email kamu",
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
