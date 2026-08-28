/**
 * Utility: Format nomor telepon Indonesia ke format internasional WhatsApp
 *
 * Contoh konversi:
 *   "08123456789"   → "628123456789"
 *   "+628123456789"  → "628123456789"
 *   "628123456789"   → "628123456789"
 *   "8123456789"     → "628123456789"
 */

/**
 * Format nomor telepon ke format internasional Indonesia (62xxx)
 * yang dibutuhkan oleh WhatsApp API.
 *
 * @returns Nomor telepon yang sudah diformat, atau null jika nomor tidak valid/kosong
 */
export function formatPhoneNumber(phone: string | undefined | null): string | null {
  if (!phone) return null;

  // Hapus semua karakter non-digit (spasi, tanda hubung, kurung, dll.)
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.length < 8) return null; // Terlalu pendek untuk nomor yang valid

  // Konversi awalan 0 → 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  // Jika tidak dimulai dengan 62, tambahkan prefix 62
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}
