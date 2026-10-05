import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BookOpen, ChartNoAxesCombined, Dumbbell, House, Moon, Salad, Sun, UserRound } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: House },
  { to: "/workout", label: "Log", icon: Dumbbell },
  { to: "/exercises", label: "Exercises", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { to: "/nutrition", label: "Nutrition", icon: Salad },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-24 size-[520px] rounded-full bg-violet/30 blur-[120px] drift" />
      <div className="pointer-events-none absolute top-32 right-[-140px] size-[560px] rounded-full bg-cyan/25 blur-[130px] drift" />
      <div className="pointer-events-none absolute bottom-[-160px] left-1/3 size-[480px] rounded-full bg-brand/25 blur-[130px] drift" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="size-9 rounded-xl gradient-brand grid place-items-center font-display font-bold text-ink text-lg">
              P
            </span>
            <span className="font-display font-bold text-lg tracking-tight">PULSEFORGE</span>
            <span className="hidden sm:inline label-eyebrow text-muted-foreground border border-border rounded-full px-2 py-1">
              Athletic OS
            </span>
          </Link>

          <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-semibold bg-softer" }}
              >
                <item.icon className="size-4" aria-hidden="true" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={toggle}
              aria-label="Toggle colour theme"
              className={cn(
                "ml-2 flex items-center gap-1 glass-tile rounded-full p-1",
                "text-xs font-semibold",
              )}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full",
                  theme === "dark" ? "gradient-brand text-ink" : "text-muted-foreground",
                )}
              >
                <Moon className="size-3.5" />
              </span>
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full",
                  theme === "light" ? "gradient-brand text-ink" : "text-muted-foreground",
                )}
              >
                <Sun className="size-3.5" />
              </span>
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
