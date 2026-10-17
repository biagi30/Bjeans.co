export const NGW_DEFAULT_BASE_URL = "https://gateway-service-production-9201.up.railway.app";

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
    verify: (params: { payload: string | Buffer; headers: any; secret: string }): any => {
      return true;
    },
  };

  async ping(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/health`);
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

