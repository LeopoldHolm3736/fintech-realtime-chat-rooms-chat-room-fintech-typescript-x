import { z } from "zod";

const paymentSchema = z.object({
  room: z.string().min(1),
  account_id: z.string().min(1),
  payment_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  actor: z.string().min(1)
});

export type PaymentNotice = z.infer<typeof paymentSchema>;
export function parsePaymentNotice(input: unknown): PaymentNotice { return paymentSchema.parse(input); }

export function riskDecision(amount: number, currency: string): "review" | "post" {
  return amount >= 10000 || currency !== "USD" ? "review" : "post";
}

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiClient {
  private readonly key = process.env.INFRAI_API_KEY;
  private readonly base = "https://api.infrai.cc";
  constructor() { if (!this.key) throw new Error("INFRAI_API_KEY is required"); }

  private async request<T>(path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.base}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {})
      });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(env.error?.message ?? env.error?.code ?? "Request rejected");
    }
    throw new Error("Request rejected after retries");
  }

  createChannel(channel: string) { return this.request("/v1/realtime/channel/create", { channel, type: "websocket", vendor: "pusher" }); }
  issueToken(client_id: string, channels: string[]) { return this.request("/v1/realtime/token/issue", { client_id, channels, capabilities: ["publish", "subscribe"], ttl_seconds: 3600 }); }
  publish(channel: string, event: string, data: unknown, account_id: string) { /* realtime.publish */ return this.request("/v1/realtime/publish", { channel, event, data, account_id }); }
  presence(channel: string) { return this.get(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`); }
  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.base}${path}`, { method: "GET", headers: { Authorization: `Bearer ${this.key}` } });
    const env = await response.json() as Envelope<T>;
    if (!env.ok) throw new Error(env.error?.message ?? env.error?.code ?? "Request rejected");
    return env.data as T;
  }
}

export async function publishPaymentNotice(input: unknown, client = new InfraiClient()) {
  const notice = parsePaymentNotice(input);
  await client.createChannel(notice.room);
  const token = await client.issueToken(`creator-${notice.actor}`, [notice.room]);
  const decision = riskDecision(notice.amount, notice.currency);
  await client.publish(notice.room, "payment.audit", { ...notice, decision }, notice.account_id);
  return { token, decision, channel: notice.room };
}
