import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BookOpen, ChartNoAxesCombined, Dumbbell, House, Moon, Salad, Sun, UserRound } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ActiveWorkoutPill } from "@/components/ActiveWorkoutPill";

const NAV = [
  { to: "/", label: "Dashboard", icon: House },
  { to: "/workout", label: "Log", icon: Dumbbell },
  { to: "/exercises", label: "Exercises", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { to: "/nutrition", label: "Nutrition", icon: Salad },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/exercises", label: "Exercises", icon: BookOpen },
  { to: "/nutrition", label: "Nutrition", icon: Salad },
  { to: "/progress", label: "Progress", icon: ChartNoAxesCombined },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 ambient-bg" />

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
                className={cn(
                  item.to === "/profile" ? "inline-flex" : "hidden md:inline-flex",
                  "shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                )}
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

        <div className="pb-40 md:pb-0">{children}</div>
      </div>

      <ActiveWorkoutPill />

      <nav
        aria-label="Main"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-background/90 backdrop-blur-xl shadow-lg border-t border-border px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              <span className="grid h-7 w-12 place-items-center rounded-full transition-colors group-data-[status=active]:gradient-brand group-data-[status=active]:text-ink">
                <item.icon className="size-[18px]" aria-hidden="true" />
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
