import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button, Panel } from "@/components/ui-kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — PulseForge" },
      { name: "description", content: "Choose a new password for your PulseForge account." },
      { property: "og:title", content: "Set a new password — PulseForge" },
      { property: "og:description", content: "Choose a new password for your PulseForge account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <Panel className="p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input type="password" required minLength={6} placeholder="New password" autoComplete="new-password"
            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full" disabled={busy}>Update password</Button>
        </form>
      </Panel>
    </div>
  );
}
