import crypto from "crypto";

export const NGW_DEFAULT_BASE_URL = "https://gateway-service-production-b6bc64ad.up.railway.app";

export interface NotificationClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
}

export interface SendWhatsAppParams {
  to: string;
  body?: string;
  templateCode?: string;
  variables?: Record<string, string>;
}

export interface SendEmailParams {
  to: string;
  subject?: string;
  body?: string;
  templateCode?: string;
  variables?: Record<string, string>;
}

export class NotificationClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(configuration: NotificationClientConfig) {
    this.apiKey = configuration.apiKey;
    this.baseUrl = (configuration.baseUrl || NGW_DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = configuration.timeout || 10000;
    this.headers = configuration.headers || {};
  }

  private async request(endpoint: string, body: any): Promise<any> {
    if (process.env.NOTIFICATION_MOCK_MODE === "true") {
      console.log(`[Notification Gateway MOCK] POST ${endpoint}:`, JSON.stringify(body));
      return { success: true, message: "Mock notification sent", mock: true };
    }

    if (!this.apiKey) {
      throw new Error(
        "NGW_API_KEY belum diisi di Environment Variables (Vercel / .env.local). Silakan tambahkan NGW_API_KEY atau aktifkan NOTIFICATION_MOCK_MODE=true."
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          ...this.headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error?.message || `Notification Gateway error: ${res.status}`
        );
      }

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout setelah ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  whatsapp = {
    send: async (params: SendWhatsAppParams): Promise<any> => {
      const requestBody: Record<string, any> = {
        channel: "WHATSAPP",
        recipient: params.to,
      };
      if (params.templateCode) {
        requestBody.templateCode = params.templateCode;
        requestBody.variables = params.variables ?? {};
      }
      if (params.body) {
        requestBody.body = params.body;
      }
      return this.request("/v1/notifications/send", requestBody);
    },
  };

  email = {
    send: async (params: SendEmailParams): Promise<any> => {
      const requestBody: Record<string, any> = {
        channel: "EMAIL",
        recipient: params.to,
      };
      if (params.subject) requestBody.subject = params.subject;
      if (params.body) requestBody.body = params.body;
      if (params.templateCode) {
        requestBody.templateCode = params.templateCode;
        requestBody.variables = params.variables ?? {};
      }
      return this.request("/v1/notifications/send", requestBody);
    },
  };

  broadcast = {
    send: async (params: any): Promise<any> => {
      return this.request("/v1/notifications/broadcast", params);
    },
  };

  webhooks = {
    verify: (params: {
      payload: string | Buffer;
      headers: any;
      secret: string;
      toleranceSeconds?: number;
    }): boolean => {
      try {
        if (!params.secret) {
          console.warn("[Webhook Verification] Webhook secret kosong.");
          return false;
        }

        const getHeader = (name: string): string => {
          const target = name.toLowerCase();
          if (params.headers && typeof params.headers.get === "function") {
            return params.headers.get(target) || params.headers.get(name) || "";
          }
          if (params.headers && typeof params.headers === "object") {
            for (const key of Object.keys(params.headers)) {
              if (key.toLowerCase() === target) {
                const value = params.headers[key];
                return Array.isArray(value) ? value[0] || "" : String(value || "");
              }
            }
          }
          return "";
        };

        const rawPayload =
          typeof params.payload === "string"
            ? params.payload
            : params.payload.toString("utf8");

        const safeEqual = (a: string, b: string): boolean => {
          const bufA = Buffer.from(a, "utf8");
          const bufB = Buffer.from(b, "utf8");
          return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
        };

        const getSecretBytes = (secret: string): Buffer =>
          secret.startsWith("whsec_")
            ? Buffer.from(secret.slice("whsec_".length), "base64")
            : Buffer.from(secret, "utf8");

        // 1. Format standar Svix/Resend dari Notification Gateway
        const webhookId = getHeader("webhook-id");
        const webhookTimestamp = getHeader("webhook-timestamp");
        const webhookSignature = getHeader("webhook-signature");

        if (webhookId && webhookTimestamp && webhookSignature) {
          const tolerance = params.toleranceSeconds ?? 300;
          const nowSeconds = Math.floor(Date.now() / 1000);
          const tsSeconds = parseInt(webhookTimestamp, 10);

          if (Number.isNaN(tsSeconds)) {
            console.warn("[Webhook Verification] Timestamp webhook tidak valid.");
            return false;
          }
          if (Math.abs(nowSeconds - tsSeconds) > tolerance) {
            console.warn("[Webhook Verification] Timestamp webhook di luar batas toleransi.");
            return false;
          }

          const key = getSecretBytes(params.secret);
          const expected = `v1,${crypto
            .createHmac("sha256", key)
            .update(`${webhookId}.${webhookTimestamp}.${rawPayload}`)
            .digest("base64")}`;

          const signatures = webhookSignature.trim().split(/\s+/);
          return signatures.some((sig) => safeEqual(sig, expected));
        }

        // 2. Fallback legacy hex HMAC (X-Gateway-Signature / x-webhook-signature)
        const legacySignature =
          getHeader("x-gateway-signature") ||
          getHeader("x-webhook-signature") ||
          getHeader("x-signature") ||
          getHeader("signature");

        if (!legacySignature) {
          console.warn("[Webhook Verification] Header signature tidak ditemukan.");
          return false;
        }

        const cleanSignature = legacySignature.replace(/^sha256=/, "");
        const expectedHexRaw = crypto
          .createHmac("sha256", params.secret)
          .update(rawPayload)
          .digest("hex");
        const expectedHexDecoded = crypto
          .createHmac("sha256", getSecretBytes(params.secret))
          .update(rawPayload)
          .digest("hex");

        return (
          safeEqual(cleanSignature, expectedHexRaw) ||
          safeEqual(cleanSignature, expectedHexDecoded)
        );
      } catch (err: any) {
        console.error("[Webhook Verification Error]:", err.message || err);
        return false;
      }
    },
  };

  async ping(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/v1/notifications/ping`, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
        ...this.headers,
      },
    });
    return res.json();
  }

  async testConnection(): Promise<any> {
    return this.ping();
  }
}

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

    const timeout = Number(process.env.NGW_TIMEOUT) || 20000;

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

