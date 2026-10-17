import { NotificationClient } from "notification-gateway-sdk";

export const NGW_DEFAULT_BASE_URL = "https://gateway-service-production-9201.up.railway.app";

let clientInstance: NotificationClient | null = null;

/**
 * Mendapatkan instance singleton NotificationClient.
 * Menggunakan URL backend Railway sebagai default baseUrl.
 */
export function getNotificationClient(): NotificationClient {
  if (!clientInstance) {
    const apiKey =
      process.env.NGW_API_KEY ||
      process.env.NOTIFICATION_API_KEY ||
      "";

    const baseUrl =
      process.env.NGW_BASE_URL ||
      process.env.NOTIFICATION_BASE_URL ||
      NGW_DEFAULT_BASE_URL;

    const timeout = Number(process.env.NGW_TIMEOUT) || 10000;

    if (!apiKey) {
      console.warn(
        "[NotificationClient] Warning: NGW_API_KEY belum diisi di .env. Notifikasi mungkin gagal."
      );
    }

    clientInstance = new NotificationClient({
      apiKey,
      baseUrl,
      timeout,
    });
  }

  return clientInstance;
}

export { NotificationClient };
