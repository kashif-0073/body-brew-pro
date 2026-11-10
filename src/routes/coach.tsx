import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Copy, KeyRound, Send, Trash2 } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Eyebrow, Panel } from "@/components/ui-kit";
import { askCoach } from "@/lib/coach.functions";
import { macroTargets } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import { GOAL_LABEL, LEVEL_LABEL } from "@/lib/types";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Smart Coach — PulseForge" },
      { name: "description", content: "Ask your personal coach about workouts, diet, recovery and form, tailored to your profile." },
      { property: "og:title", content: "Smart Coach — PulseForge" },
      { property: "og:description", content: "Personal training, nutrition and recovery answers tailored to your goals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachPage,
});

type Msg = { role: "user" | "model"; text: string };
const KEY_STORE = "pulseforge-gemini-key";
const CHAT_STORE = "pulseforge-coach-chat";

const CHIPS = [
  { label: "Diet & macros", prompt: "Build me a one-day high-protein meal plan that fits my calorie and protein targets." },
  { label: "Workout tips", prompt: "How do I break through a plateau on my main lifts?" },
  { label: "Quick session", prompt: "I only have 30 minutes and dumbbells today. Give me a full session with sets and reps." },
  { label: "Recovery", prompt: "How can I recover faster from sore legs after a heavy leg day?" },
  { label: "Form & pain", prompt: "My shoulder feels tight on bench press. What warm-ups or alternatives should I use?" },
];

function CoachPage() {
  const { state, hydrated } = useStore();
  const ask = useServerFn(askCoach);
  const [apiKey, setApiKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem(KEY_STORE) ?? "");
    try {
      setMsgs(JSON.parse(localStorage.getItem(CHAT_STORE) ?? "[]") as Msg[]);
    } catch {
      /* ignore bad saved chat */
    }
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(CHAT_STORE, JSON.stringify(msgs.slice(-30)));
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy, hydrated]);

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;
  const profile = state.profile;

  const context = profile
    ? (() => {
        const t = macroTargets(profile);
        return `Name: ${profile.name}; ${profile.sex}, ${profile.age} y, ${profile.heightCm} cm, ${profile.weightKg} kg, ${profile.bodyFatPct}% body fat. Level: ${LEVEL_LABEL[profile.level]}. Goal: ${GOAL_LABEL[profile.goal]}. Trains ${profile.daysPerWeek} days/week with ${profile.equipment.join(", ")}. Daily target: ${t.kcal} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. Sessions logged: ${state.sessions.length}.`;
      })()
    : "No profile set yet.";

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await ask({ data: { apiKey: apiKey || undefined, context, messages: next.slice(-20) } });
      if (r.ok) setMsgs([...next, { role: "model", text: r.text }]);
      else toast.error(r.error);
    } catch {
      toast.error("Couldn't reach Smart Coach. Check your connection.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    localStorage.setItem(KEY_STORE, k);
    setApiKey(k);
    setKeyDraft("");
    toast.success("Key saved on this device");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="size-11 rounded-2xl gradient-brand grid place-items-center text-ink">
              <Bot className="size-6" aria-hidden="true" />
            </span>
            <div>
              <Eyebrow>Your personal advisor</Eyebrow>
              <h1 className="font-display font-bold text-2xl">Smart Coach</h1>
            </div>
          </div>
          {msgs.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setMsgs([])}>
              <Trash2 className="size-3.5" /> Clear chat
            </Button>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {profile ? (
            <>Answers are tailored to you: {profile.weightKg} kg · {GOAL_LABEL[profile.goal]} · {LEVEL_LABEL[profile.level]}</>
          ) : (
            <>
              <Link to="/profile" className="text-foreground underline">Set up your profile</Link> for advice tailored to you.
            </>
          )}
        </p>
      </Panel>

      {!apiKey && (
        <Panel>
          <div className="flex items-center gap-2 font-semibold"><KeyRound className="size-4" /> Connect your free key</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Smart Coach uses Google Gemini's free tier. Get a key in one minute at{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-foreground underline">
              Google AI Studio
            </a>{" "}
            and paste it below. It stays on this device only.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="Paste your Gemini key"
              className="flex-1 min-w-0 rounded-xl glass-tile px-3 py-2 text-sm bg-transparent"
            />
            <Button variant="primary" onClick={saveKey}>Save</Button>
          </div>
        </Panel>
      )}

      <Panel className="space-y-4">
        {msgs.length === 0 && (
          <div className="text-center py-6">
            <p className="font-semibold">Ask anything about training, diet or recovery</p>
            <p className="text-sm text-muted-foreground">Pick a topic to get started</p>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm gradient-brand text-ink px-4 py-2.5 text-sm whitespace-pre-wrap">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-2.5">
              <span className="size-8 shrink-0 rounded-xl glass-tile grid place-items-center"><Bot className="size-4" /></span>
              <div className="min-w-0 flex-1 text-sm leading-relaxed space-y-2">
                <RichText text={m.text} />
                <button
                  onClick={() => { void navigator.clipboard.writeText(m.text); toast.success("Copied"); }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Copy className="size-3" /> Copy
                </button>
              </div>
            </div>
          ),
        )}
        {busy && (
          <div className="flex gap-2.5 items-center text-sm text-muted-foreground">
            <span className="size-8 rounded-xl glass-tile grid place-items-center"><Bot className="size-4 animate-pulse" /></span>
            Coach is thinking…
          </div>
        )}
        <div ref={endRef} />

        <div className="flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <Button key={c.label} size="sm" disabled={busy} onClick={() => void send(c.prompt)}>{c.label}</Button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); void send(input); }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            autoFocus
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
            }}
            placeholder="Ask your coach anything…"
            className="flex-1 min-w-0 resize-none rounded-xl glass-tile px-3 py-2 text-sm bg-transparent"
          />
          <Button type="submit" variant="primary" disabled={busy || !input.trim()} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
        {apiKey && (
          <button
            onClick={() => { localStorage.removeItem(KEY_STORE); setApiKey(""); }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change key
          </button>
        )}
      </Panel>
    </div>
  );
}

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p.replace(/\*/g, "")}</Fragment>,
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const h = t.match(/^#{1,4}\s+(.*)/);
        if (h) return <p key={i} className="font-display font-semibold pt-1">{inline(h[1]!)}</p>;
        const b = t.match(/^(?:[-*•]|\d+[.)])\s+(.*)/);
        if (b) return <p key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">{inline(b[1]!)}</p>;
        return <p key={i}>{inline(t)}</p>;
      })}
    </>
  );
}
