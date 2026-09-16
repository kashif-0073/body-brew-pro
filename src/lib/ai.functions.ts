import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

interface JsonSchemaSpec {
  name: string;
  schema: Record<string, unknown>;
}

async function callGateway(input: string, instructions: string, format: JsonSchemaSpec) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      stream: true,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: format.name, strict: true, schema: format.schema } },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("The AI coach is busy right now. Try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are used up. Add credits in Lovable to keep using AI features.");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 180)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && evt.response?.output_text) {
          if (!text) text = evt.response.output_text;
        }
      } catch {
        /* ignore keepalive fragments */
      }
    }
  }

  if (!text.trim()) throw new Error("The AI coach returned an empty response. Try again.");
  return JSON.parse(text) as unknown;
}

/* ---------------------------------- Meals --------------------------------- */

const MealInput = z.object({ description: z.string().min(2).max(500) });

const mealSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "kcal", "protein", "carbs", "fat"],
  properties: {
    name: { type: "string" },
    kcal: { type: "number" },
    protein: { type: "number" },
    carbs: { type: "number" },
    fat: { type: "number" },
  },
} as const;

export const estimateMeal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MealInput.parse(input))
  .handler(async ({ data }) => {
    const out = (await callGateway(
      data.description,
      "You are a sports nutritionist. Estimate the nutrition of the described meal using metric units. " +
        "Return a short tidy meal name and realistic totals in kcal and grams for the whole described portion. " +
        "Round all numbers to whole numbers.",
      { name: "meal_estimate", schema: mealSchema as unknown as Record<string, unknown> },
    )) as { name: string; kcal: number; protein: number; carbs: number; fat: number };

    return {
      name: String(out.name).slice(0, 80),
      kcal: Math.max(0, Math.round(out.kcal)),
      protein: Math.max(0, Math.round(out.protein)),
      carbs: Math.max(0, Math.round(out.carbs)),
      fat: Math.max(0, Math.round(out.fat)),
    };
  });

/* ---------------------------------- Plans --------------------------------- */

const PlanInput = z.object({
  level: z.string(),
  goal: z.string(),
  daysPerWeek: z.number().min(1).max(7),
  equipment: z.array(z.string()),
  weightKg: z.number(),
  age: z.number(),
  request: z.string().max(400),
});

const planSchema = {
  type: "object",
  additionalProperties: false,
  required: ["days"],
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "focus", "durationMin", "exercises"],
        properties: {
          title: { type: "string" },
          focus: { type: "string" },
          durationMin: { type: "number" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "muscle", "sets", "reps", "weightKg", "restSec", "note"],
              properties: {
                name: { type: "string" },
                muscle: { type: "string" },
                sets: { type: "number" },
                reps: { type: "number" },
                weightKg: { type: "number" },
                restSec: { type: "number" },
                note: { type: ["string", "null"] },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const generateAiPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const out = (await callGateway(
      `Athlete: ${data.level} level, goal ${data.goal}, ${data.daysPerWeek} training days per week, ` +
        `bodyweight ${data.weightKg} kg, age ${data.age}, available equipment: ${data.equipment.join(", ")}. ` +
        `Extra request from the athlete: ${data.request || "none"}`,
      "You are an elite strength and conditioning coach. Design a weekly training plan with exactly one entry per training day. " +
        "Use metric loads in kg appropriate for the athlete's level and bodyweight (use 0 kg for bodyweight or cardio work). " +
        "Sets, reps, rest seconds and exercise selection must match the stated goal and evidence-based volume guidelines. " +
        "Keep notes under 60 characters, or null.",
      { name: "training_plan", schema: planSchema as unknown as Record<string, unknown> },
    )) as {
      days: {
        title: string;
        focus: string;
        durationMin: number;
        exercises: {
          name: string;
          muscle: string;
          sets: number;
          reps: number;
          weightKg: number;
          restSec: number;
          note: string | null;
        }[];
      }[];
    };

    return out.days.slice(0, 7).map((d, i) => ({
      id: `ai-${i + 1}`,
      title: String(d.title).slice(0, 40),
      focus: String(d.focus).slice(0, 60),
      durationMin: Math.max(15, Math.round(d.durationMin)),
      source: "ai" as const,
      exercises: d.exercises.slice(0, 10).map((e) => ({
        name: String(e.name).slice(0, 60),
        muscle: String(e.muscle).slice(0, 30),
        sets: Math.min(8, Math.max(1, Math.round(e.sets))),
        reps: Math.min(60, Math.max(1, Math.round(e.reps))),
        weightKg: Math.max(0, Math.round(e.weightKg * 2) / 2),
        restSec: Math.min(300, Math.max(20, Math.round(e.restSec))),
        ...(e.note ? { note: e.note.slice(0, 80) } : {}),
      })),
    }));
  });
