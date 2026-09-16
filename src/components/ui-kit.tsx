import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  float,
}: {
  children: ReactNode;
  className?: string;
  float?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]",
        float && "floaty",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("label-eyebrow text-cyan mb-1", className)}>{children}</p>;
}

export function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass-tile rounded-2xl p-4", className)}>{children}</div>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "outline", size = "md", className, ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2.5",
        variant === "primary" && "gradient-brand text-ink shadow-[0_8px_24px_-12px_var(--violet)] hover:opacity-90",
        variant === "outline" && "glass-tile text-foreground hover:bg-softer",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        variant === "danger" && "text-rose glass-tile hover:bg-softer",
        className,
      )}
    />
  );
}

export function Field({
  label,
  suffix,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="label-eyebrow text-muted-foreground">{label}</span>
      <span className="mt-1.5 flex items-center gap-2 glass-tile rounded-xl px-3 py-2.5 focus-within:border-cyan/50">
        <input
          {...props}
          className={cn(
            "w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60",
            className,
          )}
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </span>
    </label>
  );
}

export function ChoiceRow<T extends string>({
  label,
  value,
  options,
  onChange,
  multi,
}: {
  label: string;
  value: T | T[];
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  multi?: boolean;
}) {
  const isOn = (v: T) => (multi ? (value as T[]).includes(v) : value === v);
  return (
    <div>
      <span className="label-eyebrow text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-semibold transition-all",
              isOn(o.value)
                ? "gradient-brand text-ink"
                : "glass-tile text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  unit,
  delta,
  tone = "lime",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  tone?: "lime" | "rose" | "cyan" | "muted";
}) {
  return (
    <Tile className="p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-display font-bold text-xl leading-tight">
        {value}
        {unit ? <span className="text-xs text-muted-foreground"> {unit}</span> : null}
      </p>
      {delta ? (
        <p
          className={cn(
            "text-[11px]",
            tone === "lime" && "text-lime",
            tone === "rose" && "text-rose",
            tone === "cyan" && "text-cyan",
            tone === "muted" && "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      ) : null}
    </Tile>
  );
}

export function BarChart({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  const last = values.length - 1;
  return (
    <div className={cn("flex items-end gap-2 h-24", className)}>
      {values.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-t-md transition-all",
            i >= last - 1 ? "gradient-brand" : "bg-softer",
          )}
          style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function Ring({
  value,
  max,
  label,
  color = "var(--cyan)",
  size = 80,
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const deg = (pct / 100) * 360;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="size-full rounded-full bg-softer" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, transparent ${deg}deg)`,
          mask: "radial-gradient(farthest-side, transparent 62%, #000 63%)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center text-center">
        <span className="font-display font-bold text-sm leading-none">{label}</span>
      </div>
    </div>
  );
}
