import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const key = data.apiKey?.trim() || process.env['GEMINI_API_KEY'];
    if (!key) return { ok: false as const, error: "Add your free Gemini key to start chatting." };

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM}\n\nUser profile:\n${data.context}` }] },
          contents: data.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        }),
      },
    );
    if (!res.ok) {
      if (res.status === 400 || res.status === 403)
        return { ok: false as const, error: "Your Gemini key was rejected. Check it and try again." };
      if (res.status === 429)
        return { ok: false as const, error: "Free daily limit reached. Wait a moment and try again." };
      return { ok: false as const, error: "Smart Coach is unavailable right now. Try again shortly." };
    }
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) return { ok: false as const, error: "Smart Coach couldn't answer that one. Try another question." };
    return { ok: true as const, text };
  });
