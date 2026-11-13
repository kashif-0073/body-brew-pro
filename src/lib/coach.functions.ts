import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createGeminiRequest, type GeminiAuthMode } from "./gemini-request";

const Input = z.object({
  apiKey: z.string().max(200).optional(),
  context: z.string().max(2000),
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
});

const SYSTEM = `You are Smart Coach, an expert strength coach, sports nutritionist and recovery specialist inside the PulseForge fitness app.
Give practical, safe, evidence-based answers tailored to the user's profile below. Be concise: short paragraphs, bullet lists, and gram/rep/set numbers where useful.
For pain or medical issues, give general guidance and recommend seeing a professional. Only answer fitness, nutrition, recovery, sleep and health-habit questions.`;

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = data.apiKey?.trim() || process.env['GEMINI_API_KEY']?.trim();
    if (!key) return { ok: false as const, error: "Add your free Gemini key to start chatting." };

    const payload = {
      systemInstruction: { parts: [{ text: `${SYSTEM}\n\nUser profile:\n${data.context}` }] },
      contents: data.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    };
    const isAuthorizationKey = key.startsWith("AQ.");
    const authModes: GeminiAuthMode[] = isAuthorizationKey ? ["header", "query"] : ["header"];
    let res: Response | undefined;

    for (const authMode of authModes) {
      const request = createGeminiRequest(key, payload, authMode);
      res = await fetch(request.url, request.init);
      if (res.ok || !isAuthorizationKey || res.status !== 401 && res.status !== 403) break;
    }

    if (!res) return { ok: false as const, error: "Smart Coach is unavailable right now. Try again shortly." };
    if (!res.ok) {
      if (res.status === 429)
        return { ok: false as const, error: "Free daily limit reached. Wait a moment and try again." };
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        const details = (await res.json().catch(() => null)) as {
          error?: { message?: unknown };
        } | null;
        const message = typeof details?.error?.message === "string"
          ? details.error.message.split(key).join("[hidden]").slice(0, 240)
          : "Google rejected the key or its access to this model.";
        return { ok: false as const, error: `Gemini connection failed (${res.status}): ${message}` };
      }
      if (res.status === 404)
        return { ok: false as const, error: "The Gemini model is unavailable for this key or project." };
      return { ok: false as const, error: "Smart Coach is unavailable right now. Try again shortly." };
    }
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) return { ok: false as const, error: "Smart Coach couldn't answer that one. Try another question." };
    return { ok: true as const, text };
  });
