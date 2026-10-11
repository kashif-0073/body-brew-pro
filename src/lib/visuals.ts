import chest from "@/assets/muscles/chest.jpg";
import back from "@/assets/muscles/back.jpg";
import shoulders from "@/assets/muscles/shoulders.jpg";
import reardelts from "@/assets/muscles/reardelts.jpg";
import biceps from "@/assets/muscles/biceps.jpg";
import triceps from "@/assets/muscles/triceps.jpg";
import quads from "@/assets/muscles/quads.jpg";
import hamstrings from "@/assets/muscles/hamstrings.jpg";
import glutes from "@/assets/muscles/glutes.jpg";
import calves from "@/assets/muscles/calves.jpg";
import posterior from "@/assets/muscles/posterior.jpg";
import core from "@/assets/muscles/core.jpg";
import cardio from "@/assets/muscles/cardio.jpg";
import squatA from "@/assets/moves/squat-a.jpg";
import squatB from "@/assets/moves/squat-b.jpg";
import pressA from "@/assets/moves/press-a.jpg";
import pressB from "@/assets/moves/press-b.jpg";
import hingeA from "@/assets/moves/hinge-a.jpg";
import hingeB from "@/assets/moves/hinge-b.jpg";
import overheadA from "@/assets/moves/overhead-a.jpg";
import overheadB from "@/assets/moves/overhead-b.jpg";
import rowA from "@/assets/moves/row-a.jpg";
import rowB from "@/assets/moves/row-b.jpg";
import pullA from "@/assets/moves/pull-a.jpg";
import pullB from "@/assets/moves/pull-b.jpg";
import curlA from "@/assets/moves/curl-a.jpg";
import curlB from "@/assets/moves/curl-b.jpg";
import inclineA from "@/assets/moves/incline-a.jpg";
import inclineB from "@/assets/moves/incline-b.jpg";
import machineA from "@/assets/moves/machine-a.jpg";
import machineB from "@/assets/moves/machine-b.jpg";
import dbPressA from "@/assets/moves/dbpress-a.jpg";
import dbPressB from "@/assets/moves/dbpress-b.jpg";
import lateralA from "@/assets/moves/lateral-a.jpg";
import lateralB from "@/assets/moves/lateral-b.jpg";
import legPressA from "@/assets/moves/legpress-a.jpg";
import legPressB from "@/assets/moves/legpress-b.jpg";
import pushdownA from "@/assets/moves/pushdown-a.jpg";
import pushdownB from "@/assets/moves/pushdown-b.jpg";
import ergA from "@/assets/moves/erg-a.jpg";
import ergB from "@/assets/moves/erg-b.jpg";

/** Anatomical highlight image per catalog muscle. */
export const MUSCLE_IMAGE: Record<string, string> = {
  Chest: chest,
  Back: back,
  Shoulders: shoulders,
  "Rear delts": reardelts,
  Biceps: biceps,
  Triceps: triceps,
  Quads: quads,
  Hamstrings: hamstrings,
  Glutes: glutes,
  Calves: calves,
  "Posterior chain": posterior,
  Core: core,
  Cardio: cardio,
};

export const muscleImage = (muscle: string) => MUSCLE_IMAGE[muscle] ?? core;

export interface MovementDemo {
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
}

const SQUAT: MovementDemo = { start: squatA, end: squatB, startLabel: "Stand tall", endLabel: "Sit to depth" };
const PRESS: MovementDemo = { start: pressA, end: pressB, startLabel: "Lockout", endLabel: "Touch chest" };
const HINGE: MovementDemo = { start: hingeA, end: hingeB, startLabel: "Stand tall", endLabel: "Hinge, flat back" };
const OVERHEAD: MovementDemo = { start: overheadA, end: overheadB, startLabel: "Front rack", endLabel: "Press overhead" };
const ROW: MovementDemo = { start: rowA, end: rowB, startLabel: "Arms long", endLabel: "Pull to ribs" };
const PULL: MovementDemo = { start: pullA, end: pullB, startLabel: "Dead hang", endLabel: "Chin over bar" };
const CURL: MovementDemo = { start: curlA, end: curlB, startLabel: "Arms straight", endLabel: "Curl & squeeze" };
const INCLINE: MovementDemo = { start: inclineA, end: inclineB, startLabel: "Stretch at chest", endLabel: "Press up & in" };
const MACHINE_PRESS: MovementDemo = { start: machineA, end: machineB, startLabel: "Handles at chest", endLabel: "Press forward" };
const DB_PRESS: MovementDemo = { start: dbPressA, end: dbPressB, startLabel: "Ear height", endLabel: "Press overhead" };
const LATERAL: MovementDemo = { start: lateralA, end: lateralB, startLabel: "Arms at sides", endLabel: "Raise to shoulder" };
const LEG_PRESS: MovementDemo = { start: legPressA, end: legPressB, startLabel: "Knees to chest", endLabel: "Push to soft lock" };
const PUSHDOWN: MovementDemo = { start: pushdownA, end: pushdownB, startLabel: "Elbows at 90°", endLabel: "Lock arms down" };
const ERG: MovementDemo = { start: ergA, end: ergB, startLabel: "Catch", endLabel: "Drive & finish" };

/** Only exercises whose demo matches the real equipment and movement. */
const DEMOS: Record<string, MovementDemo> = {
  "Barbell Bench Press": PRESS,
  "Close-Grip Bench Press": PRESS,
  "Incline Dumbbell Press": INCLINE,
  "Machine Chest Press": MACHINE_PRESS,
  "Overhead Press": OVERHEAD,
  "Dumbbell Shoulder Press": DB_PRESS,
  "Lateral Raise": LATERAL,
  "Cable Triceps Pushdown": PUSHDOWN,
  "Barbell Row": ROW,
  "Pull-Up": PULL,
  "Weighted Pull-Up": PULL,
  "Barbell Curl": CURL,
  "Barbell Back Squat": SQUAT,
  "Leg Press": LEG_PRESS,
  "Romanian Deadlift": HINGE,
  "Conventional Deadlift": HINGE,
  "Rowing Intervals": ERG,
};

export const demoFor = (name: string): MovementDemo | null => DEMOS[name] ?? null;

/** Muscle tiles for the library's visual browser (Lyfta-style grid). */
export const MUSCLE_TILES: { muscle: string; label: string }[] = [
  { muscle: "Chest", label: "Chest" },
  { muscle: "Back", label: "Back" },
  { muscle: "Shoulders", label: "Shoulders" },
  { muscle: "Biceps", label: "Biceps" },
  { muscle: "Triceps", label: "Triceps" },
  { muscle: "Core", label: "Abs" },
  { muscle: "Quads", label: "Quads" },
  { muscle: "Hamstrings", label: "Hamstrings" },
  { muscle: "Glutes", label: "Glutes" },
  { muscle: "Calves", label: "Calves" },
  { muscle: "Rear delts", label: "Rear delts" },
  { muscle: "Posterior chain", label: "Posterior chain" },
  { muscle: "Cardio", label: "Cardio" },
];
