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
    body: `Halo ${payload.nama},\n\nKode verifikasi OTP login Bjeans.co Anda adalah: *${payload.otp}*.\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`,
  });

  console.log("[Notification Gateway WhatsApp OTP Response]:", JSON.stringify(result, null, 2));
  return result;
}

/**
 * Kirim OTP ke pengguna (langsung via WhatsApp)
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
    console.log(`[OTP Mock Mode] Kode OTP untuk ${email}: ${otp}`);
    return {
      success: true,
      message: `[MOCK MODE] Kode OTP Anda: ${otp}`,
      channel: "mock",
    };
  }

  const targetPhone = phone || "";
  const formattedPhone = formatPhoneNumber(targetPhone);

  if (!formattedPhone) {
    throw new Error(
      `Nomor WhatsApp untuk akun ini (${email}) belum terdaftar atau formatnya tidak valid (${phone || "kosong"}). Pastikan nomor HP terisi di database.`
    );
  }

  // Kirim langsung via WhatsApp
  try {
    await sendWhatsAppOTP({
      to: formattedPhone,
      nama: namaUser,
      otp,
    });

    return {
      success: true,
      message: `OTP telah dikirim ke WhatsApp (${formattedPhone})`,
      channel: "whatsapp",
    };
  } catch (waErr: any) {
    console.error(
      `[OTP Service] Pengiriman OTP WhatsApp gagal: ${waErr.message}. Fallback OTP untuk ${email}: ${otp}`
    );
    throw new Error(
      `Gagal mengirim OTP ke WhatsApp: ${waErr.message}.`
    );
  }
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
