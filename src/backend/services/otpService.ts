// OTP Service — menggunakan fetch langsung ke Notification Gateway
// (menghindari ESM compatibility issue dengan Next.js Turbopack)

const NGW_API_KEY = process.env.NGW_API_KEY || "";
const NGW_BASE_URL = process.env.NGW_BASE_URL || "http://localhost:3001";
const NGW_TIMEOUT = Number(process.env.NGW_TIMEOUT) || 10000;

// In-memory OTP store (pakai Redis/DB untuk production)
interface OtpEntry {
  otp: string;
  expiresAt: number;
}
const otpStore = new Map<string, OtpEntry>();

// Generate OTP 6 digit
function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Kirim email via Notification Gateway REST API
 */
async function sendEmail(payload: {
  to: string;
  templateCode: string;
  variables: Record<string, string>;
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
        channel: "EMAIL",
        recipient: payload.to,
        templateCode: payload.templateCode,
        variables: payload.variables,
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    console.log("[Notification Gateway Response]:", JSON.stringify(data, null, 2));

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

/**
 * Kirim OTP ke email pengguna
 */
export async function kirimOTP(
  email: string,
  namaUser: string = "Pengguna"
): Promise<{ success: boolean; message: string }> {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit

  otpStore.set(email, { otp, expiresAt });

  await sendEmail({
    to: email,
    templateCode: "otp_login",
    variables: {
      otp,
      nama: namaUser,
    },
  });

  return { success: true, message: "OTP telah dikirim ke email kamu" };
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
