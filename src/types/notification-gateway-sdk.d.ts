declare module "notification-gateway-sdk" {
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
    constructor(configuration: NotificationClientConfig);
    whatsapp: {
      send(params: SendWhatsAppParams): Promise<any>;
    };
    email: {
      send(params: SendEmailParams): Promise<any>;
    };
    broadcast: {
      send(params: any): Promise<any>;
    };
    webhooks: {
      verify(params: { payload: string | Buffer; headers: any; secret: string }): any;
    };
    ping(): Promise<any>;
    testConnection(): Promise<any>;
  }
}

declare module "@notification-gateway/sdk" {
  export * from "notification-gateway-sdk";
}
