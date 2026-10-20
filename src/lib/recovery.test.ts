import { describe, expect, it } from "vitest";
import { muscleRecovery } from "./recovery";
import type { WorkoutSession } from "./types";

const NOW = new Date("2026-10-20T12:00:00").getTime();
const sess = (hoursAgo: number, sets: number): WorkoutSession => ({
  id: String(hoursAgo),
  date: "2026-10-20",
  title: "t",
  focus: "f",
  durationMin: 30,
  completed: true,
  startedAt: NOW - hoursAgo * 3_600_000,
  exercises: [{ name: "Bench", muscle: "Chest", sets: Array.from({ length: sets }, () => ({ weight: 50, reps: 8, done: true })) as never }],
});

describe("muscle recovery", () => {
  it("6+ sets need 72 h: 36 h later is 50% recovering", () => {
    const [r] = muscleRecovery([sess(36, 6)], ["Chest"], NOW);
    expect(r.percent).toBe(50);
    expect(r.status).toBe("recovering");
  });
  it("under 6 sets need 48 h: fresh after 48 h", () => {
    expect(muscleRecovery([sess(48, 3)], ["Chest"], NOW)[0].status).toBe("fresh");
  });
  it("12 h after heavy work is fatigued", () => {
    expect(muscleRecovery([sess(12, 8)], ["Chest"], NOW)[0].status).toBe("fatigued");
  });
  it("never trained muscle is untrained", () => {
    expect(muscleRecovery([], ["Chest"], NOW)[0].status).toBe("untrained");
  });
});
