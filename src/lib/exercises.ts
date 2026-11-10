import type { Equipment, Level } from "./types";

export interface ExerciseDef {
  name: string;
  muscle: string;
  group: "push" | "pull" | "legs" | "core" | "cardio";
  equipment: Equipment;
  /** Suggested working load as a multiple of bodyweight. 0 = bodyweight / time based. */
  bwRatio: number;
  minLevel: Level;
  compound: boolean;
}

const L: Record<Level, number> = { beginner: 0, intermediate: 1, professional: 2 };
export const levelRank = (l: Level) => L[l];

/** Broad body regions used for filtering the library. */
export type Region = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core" | "Cardio";

export const REGIONS: Region[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
];

const MUSCLE_REGION: Record<string, Region> = {
  Chest: "Chest",
  Back: "Back",
  "Rear delts": "Shoulders",
  Shoulders: "Shoulders",
  Triceps: "Arms",
  Biceps: "Arms",
  Quads: "Legs",
  Hamstrings: "Legs",
  Glutes: "Legs",
  Calves: "Legs",
  "Posterior chain": "Legs",
  Core: "Core",
  Cardio: "Cardio",
};

export const regionOf = (muscle: string): Region => MUSCLE_REGION[muscle] ?? "Core";

/** Step-by-step setup and execution cues, keyed by exercise name. */
export const CUES: Record<string, string[]> = {
  "Flat Dumbbell Bench Press": [
    "Lie flat with feet planted, dumbbells at chest level, palms forward.",
    "Pinch the shoulder blades back and down.",
    "Press up and slightly in until arms are straight over the chest.",
    "Lower slowly until the elbows sit just below the bench line.",
  ],
  "Incline Barbell Bench Press": [
    "Set the bench to 30–45°, eyes under the bar.",
    "Grip just outside shoulder width, shoulder blades squeezed.",
    "Lower to the upper chest, elbows ~45° from the torso.",
    "Press straight up over the shoulders.",
  ],
  "Decline Bench Press": [
    "Lock the legs under the pads, head on the low end.",
    "Grip slightly wider than shoulders.",
    "Lower to the lower chest under control.",
    "Press back up without bouncing off the chest.",
  ],
  "Dumbbell Fly": [
    "Lie flat, dumbbells over the chest, palms facing each other.",
    "Keep a soft, fixed bend in the elbows.",
    "Open the arms wide until you feel a deep chest stretch.",
    "Hug the weights back together using the chest, not the arms.",
  ],
  "Incline Dumbbell Fly": [
    "Set the bench to 30°, dumbbells over the upper chest.",
    "Soft bend in the elbows throughout.",
    "Lower out wide to a stretch, then squeeze back up.",
  ],
  "Cable Crossover": [
    "Set pulleys high, step forward with a slight lean.",
    "Soft elbows, chest up.",
    "Sweep the handles down and together in front of the hips.",
    "Return slowly to a full stretch.",
  ],
  "Low-to-High Cable Fly": [
    "Set pulleys low, stand in the middle with a staggered stance.",
    "Sweep the handles up and together to chin height.",
    "Squeeze the upper chest, then lower with control.",
  ],
  "Pec Deck Fly": [
    "Seat height so handles line up with mid-chest.",
    "Back flat on the pad, slight bend in the elbows.",
    "Bring the handles together and squeeze for a second.",
    "Open slowly until you feel a chest stretch.",
  ],
  "Smith Machine Bench Press": [
    "Position the bench so the bar lowers to mid-chest.",
    "Unrack by twisting the bar, shoulder blades tight.",
    "Lower under control, press back up smoothly.",
  ],
  "Chest Dip": [
    "Grip the bars, lean the torso forward ~30°.",
    "Lower until the shoulders are just below the elbows.",
    "Press up while keeping the forward lean.",
  ],
  "Incline Push-Up": [
    "Hands on a bench, slightly wider than shoulders.",
    "Body in a straight line from head to heels.",
    "Lower the chest to the bench, then push away.",
  ],
  "Rope Triceps Pushdown": [
    "Stand tall, elbows pinned to your sides.",
    "Push the rope down and spread the ends apart at the bottom.",
    "Return slowly until forearms are just above parallel.",
  ],
  "Overhead Cable Triceps Extension": [
    "Face away from a low pulley, rope behind the head.",
    "Elbows point forward and stay still.",
    "Extend the arms fully overhead, then lower to a deep stretch.",
  ],
  "Overhead Dumbbell Triceps Extension": [
    "Hold one dumbbell overhead with both hands.",
    "Keep elbows close and pointing up.",
    "Lower behind the head, then extend fully.",
  ],
  "Skull Crusher": [
    "Lie flat, bar over the shoulders, narrow grip.",
    "Bend only at the elbows, lowering to the forehead.",
    "Extend back up without flaring the elbows.",
  ],
  "Dumbbell Kickback": [
    "Hinge forward, upper arm parallel to the floor.",
    "Extend the forearm back until the arm is straight.",
    "Squeeze the triceps, lower slowly.",
  ],
  "Bench Dip": [
    "Hands on a bench behind you, legs out front.",
    "Lower until the elbows reach ~90°.",
    "Press back up, keeping the hips close to the bench.",
  ],
  "Diamond Push-Up": [
    "Hands together under the chest forming a diamond.",
    "Body straight, elbows tucked back.",
    "Lower the chest to the hands, then press up.",
  ],
  "Barbell Bench Press": [
    "Lie flat, eyes under the bar, feet planted wide and flat.",
    "Pinch the shoulder blades back and down; keep a small arch.",
    "Grip just outside shoulder width, wrists stacked over elbows.",
    "Lower to mid-chest under control, elbows ~45° from the torso.",
    "Press up and slightly back without losing the shoulder blade squeeze.",
  ],
  "Incline Dumbbell Press": [
    "Set the bench to 30°; any higher shifts work to the shoulders.",
    "Start with the dumbbells at lower-chest height, palms forward.",
    "Press up and in, stopping just short of clashing the bells.",
    "Lower slowly until you feel a stretch across the upper chest.",
  ],
  "Overhead Press": [
    "Bar rests on the front delts, grip just outside the shoulders.",
    "Brace the abs and squeeze the glutes so the ribs stay down.",
    "Move the head back slightly, press straight up past the face.",
    "Finish with biceps by the ears and the bar over mid-foot.",
  ],
  "Dumbbell Shoulder Press": [
    "Sit tall with the back supported, dumbbells at ear height.",
    "Elbows slightly in front of the body, not flared straight out.",
    "Press until the arms are long, stopping short of locking hard.",
    "Lower under control until the upper arms pass parallel.",
  ],
  "Machine Chest Press": [
    "Set the seat so the handles line up with mid-chest.",
    "Shoulder blades pinned to the pad throughout.",
    "Press out smoothly, keeping a soft elbow at the end.",
    "Return until you feel a chest stretch, never letting the stack bang.",
  ],
  "Cable Triceps Pushdown": [
    "Stand a step back from the tower, slight forward lean.",
    "Elbows pinned to the ribs and completely still.",
    "Push down until the arms lock, squeeze for a beat.",
    "Let the forearms rise only to 90° to keep tension on.",
  ],
  "Lateral Raise": [
    "Light dumbbells, small forward lean, slight elbow bend.",
    "Lead with the elbows, not the hands.",
    "Raise to shoulder height only — no shrugging.",
    "Lower slowly over 2–3 seconds; the negative does the work.",
  ],
  "Push-Up": [
    "Hands under the shoulders, body in one straight line.",
    "Brace the abs and squeeze the glutes; no sagging hips.",
    "Lower until the chest is a fist off the floor.",
    "Press away and spread the shoulder blades at the top.",
  ],
  Dip: [
    "Grip the bars, arms locked, shoulders pulled down away from the ears.",
    "Lean forward slightly for chest, stay upright for triceps.",
    "Lower until the upper arms reach parallel — no deeper if shoulders complain.",
    "Press back up without swinging the legs.",
  ],
  "Close-Grip Bench Press": [
    "Grip shoulder-width; any narrower strains the wrists.",
    "Tuck the elbows to about 30° from the torso.",
    "Lower to the lower chest, keeping the forearms vertical.",
    "Drive up by extending the elbows hard.",
  ],
  "Barbell Row": [
    "Hinge to roughly 45°, back flat, bar over mid-foot.",
    "Brace hard; the torso angle must not change during the set.",
    "Pull to the lower ribs, elbows sweeping back, not out.",
    "Lower under control to a full stretch each rep.",
  ],
  "Lat Pulldown": [
    "Set the thigh pad snug so you stay seated.",
    "Grip wider than the shoulders, slight backward lean.",
    "Pull the elbows down to the ribs, bar to the collarbone.",
    "Let the shoulders rise fully at the top for a lat stretch.",
  ],
  "Seated Cable Row": [
    "Chest up, knees soft, torso near vertical.",
    "Start from a full stretch letting the shoulder blades travel forward.",
    "Row to the navel, squeezing the blades together.",
    "No rocking — the torso stays still.",
  ],
  "Pull-Up": [
    "Full dead hang, grip slightly wider than the shoulders.",
    "Set the shoulders down first, then pull.",
    "Drive the elbows toward the back pockets.",
    "Chin over the bar, then lower all the way down with control.",
  ],
  "Inverted Row": [
    "Bar at hip height, body straight from heels to head.",
    "The lower the bar, the harder the row.",
    "Pull the chest to the bar, elbows close to the body.",
    "Keep the hips level — no piking upward.",
  ],
  "Dumbbell Row": [
    "One hand and knee on the bench, back flat like a table.",
    "Let the dumbbell hang and stretch the lat.",
    "Row to the hip, elbow tight to the side.",
    "Don't twist the torso to finish the rep.",
  ],
  "Face Pull": [
    "Rope set at upper-chest height, split stance.",
    "Pull the rope apart toward the forehead.",
    "Finish with the hands beside the ears, elbows high.",
    "Light weight, slow tempo — this is a rear-delt and cuff exercise.",
  ],
  "Barbell Curl": [
    "Shoulder-width grip, elbows just in front of the hips.",
    "Curl without letting the elbows drift forward.",
    "Squeeze at the top, then lower over 2–3 seconds.",
    "No hip swing — if it swings, drop the weight.",
  ],
  "Dumbbell Hammer Curl": [
    "Neutral grip, thumbs up, arms by the sides.",
    "Curl straight up, keeping the wrists neutral.",
    "Pause briefly at the top for the brachialis.",
    "Lower fully to a straight arm each rep.",
  ],
  "Weighted Pull-Up": [
    "Add load only once 8 clean bodyweight reps are easy.",
    "Belt or dip belt; keep the weight tight to the hips.",
    "Same mechanics as a strict pull-up — no kipping.",
    "Control the descent; this is where the added load bites.",
  ],
  "Barbell Back Squat": [
    "Bar on the upper traps, hands just outside the shoulders.",
    "Feet shoulder-width, toes turned out 15–30°.",
    "Big breath into the belly, brace, then break at hips and knees together.",
    "Descend to at least parallel with the knees tracking over the toes.",
    "Drive the whole foot into the floor; hips and chest rise together.",
  ],
  "Goblet Squat": [
    "Hold a dumbbell vertically against the chest.",
    "Elbows inside the knees, chest tall.",
    "Sit straight down between the heels.",
    "Pause at the bottom, then stand tall and squeeze the glutes.",
  ],
  "Romanian Deadlift": [
    "Start standing, bar against the thighs, knees softly bent.",
    "Push the hips straight back, bar dragging down the legs.",
    "Stop when the hamstrings stretch — usually just below the knee.",
    "Drive the hips forward to stand; spine stays neutral throughout.",
  ],
  "Conventional Deadlift": [
    "Bar over mid-foot, shins an inch away.",
    "Hinge, grip just outside the legs, drop the hips until the shins touch.",
    "Chest up, lats tight, pull the slack out of the bar.",
    "Push the floor away; the bar travels in a straight vertical line.",
    "Lock out with the glutes — no leaning back.",
  ],
  "Leg Press": [
    "Feet shoulder-width, mid-platform, whole foot in contact.",
    "Lower until the knees reach about 90° without the hips rolling up.",
    "Press through the mid-foot and heel.",
    "Never lock the knees hard at the top.",
  ],
  "Walking Lunge": [
    "Step out far enough that the front shin stays near vertical.",
    "Drop the back knee toward the floor, torso upright.",
    "Push through the front heel to step into the next rep.",
    "Keep the steps in a straight line for balance.",
  ],
  "Leg Curl": [
    "Align the knee joint with the machine's pivot.",
    "Hips flat on the pad, no arching to cheat.",
    "Curl fully, squeeze the hamstrings for a beat.",
    "Resist for 3 seconds on the way back.",
  ],
  "Bulgarian Split Squat": [
    "Rear foot on a bench, front foot two strides ahead.",
    "Slight forward torso lean loads the glutes more.",
    "Lower straight down until the front thigh is parallel.",
    "Drive through the front heel; the back leg is only balance.",
  ],
  "Standing Calf Raise": [
    "Balls of the feet on the platform, heels free.",
    "Drop the heels for a deep stretch.",
    "Rise onto the big toe as high as possible.",
    "Pause for one second at the top every rep.",
  ],
  "Air Squat": [
    "Feet shoulder-width, arms forward for balance.",
    "Hips back and down, heels flat.",
    "Reach full depth with a neutral spine.",
    "Stand fully and squeeze the glutes at the top.",
  ],
  "Glute Bridge": [
    "Lie on your back, heels close to the glutes.",
    "Push through the heels and lift the hips.",
    "Squeeze the glutes hard; ribs stay down.",
    "Lower slowly without resting between reps.",
  ],
  Plank: [
    "Elbows under the shoulders, forearms parallel.",
    "Body in one line from heels to head.",
    "Tuck the tailbone and brace the abs at 50% effort.",
    "Breathe normally — quality beats duration.",
  ],
  "Hanging Leg Raise": [
    "Dead hang, shoulders active, legs together.",
    "Start by curling the pelvis upward, not just lifting the legs.",
    "Raise to at least hip height without swinging.",
    "Lower slowly over 3 seconds.",
  ],
  "Cable Crunch": [
    "Kneel facing the stack, rope beside the head.",
    "Hips stay fixed; only the spine moves.",
    "Crunch the ribs toward the pelvis and exhale hard.",
    "Return until you feel the abs stretch.",
  ],
  "Dead Bug": [
    "Lie on your back, arms up, hips and knees at 90°.",
    "Press the lower back gently into the floor.",
    "Extend the opposite arm and leg slowly.",
    "Stop before the back arches; that's your range.",
  ],
  "Zone 2 Treadmill": [
    "Warm up 5 minutes at an easy walk.",
    "Settle at a pace where you can hold a conversation.",
    "Target roughly 60–70% of max heart rate.",
    "Hold steady for the full duration, then cool down.",
  ],
  "Rowing Intervals": [
    "Sequence each stroke: legs, then back, then arms.",
    "Reverse it on the recovery: arms, back, legs.",
    "Drive hard with the legs — they do most of the work.",
    "Alternate hard efforts with equal easy paddling.",
  ],
  "Assault Bike Sprints": [
    "Set the seat so the knee is nearly straight at full extension.",
    "Punch and pull with the arms while driving the legs.",
    "Go all-out for the work interval, then spin easy.",
    "Keep the torso still — no bouncing.",
  ],
  "Incline Walk": [
    "Set 8–12% incline at a comfortable walking speed.",
    "Stand tall, no leaning on the handrails.",
    "Full heel-to-toe strides.",
    "Keep the heart rate steady and conversational.",
  ],
  Burpees: [
    "Squat, hands down, jump the feet back to a plank.",
    "Chest to floor with a straight body, no snaking hips.",
    "Jump the feet back in under the hips.",
    "Stand and jump, landing with soft knees.",
  ],
  "Jump Rope": [
    "Rope reaches the armpits when stood on at the middle.",
    "Elbows close, turn the rope with the wrists.",
    "Small jumps — an inch of clearance is enough.",
    "Land on the balls of the feet, knees soft.",
  ],
};

export const cuesFor = (name: string): string[] => CUES[name] ?? [];


export const EXERCISES: ExerciseDef[] = [
  // Push
  { name: "Barbell Bench Press", muscle: "Chest", group: "push", equipment: "barbell", bwRatio: 0.8, minLevel: "intermediate", compound: true },
  { name: "Incline Dumbbell Press", muscle: "Chest", group: "push", equipment: "dumbbell", bwRatio: 0.28, minLevel: "beginner", compound: true },
  { name: "Overhead Press", muscle: "Shoulders", group: "push", equipment: "barbell", bwRatio: 0.5, minLevel: "intermediate", compound: true },
  { name: "Dumbbell Shoulder Press", muscle: "Shoulders", group: "push", equipment: "dumbbell", bwRatio: 0.22, minLevel: "beginner", compound: true },
  { name: "Machine Chest Press", muscle: "Chest", group: "push", equipment: "machine", bwRatio: 0.6, minLevel: "beginner", compound: true },
  { name: "Cable Triceps Pushdown", muscle: "Triceps", group: "push", equipment: "machine", bwRatio: 0.35, minLevel: "beginner", compound: false },
  { name: "Lateral Raise", muscle: "Shoulders", group: "push", equipment: "dumbbell", bwRatio: 0.1, minLevel: "beginner", compound: false },
  { name: "Push-Up", muscle: "Chest", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Dip", muscle: "Triceps", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: true },
  { name: "Close-Grip Bench Press", muscle: "Triceps", group: "push", equipment: "barbell", bwRatio: 0.6, minLevel: "professional", compound: true },
  { name: "Flat Dumbbell Bench Press", muscle: "Chest", group: "push", equipment: "dumbbell", bwRatio: 0.3, minLevel: "beginner", compound: true },
  { name: "Incline Barbell Bench Press", muscle: "Chest", group: "push", equipment: "barbell", bwRatio: 0.65, minLevel: "intermediate", compound: true },
  { name: "Decline Bench Press", muscle: "Chest", group: "push", equipment: "barbell", bwRatio: 0.75, minLevel: "intermediate", compound: true },
  { name: "Dumbbell Fly", muscle: "Chest", group: "push", equipment: "dumbbell", bwRatio: 0.12, minLevel: "beginner", compound: false },
  { name: "Incline Dumbbell Fly", muscle: "Chest", group: "push", equipment: "dumbbell", bwRatio: 0.1, minLevel: "beginner", compound: false },
  { name: "Cable Crossover", muscle: "Chest", group: "push", equipment: "machine", bwRatio: 0.15, minLevel: "beginner", compound: false },
  { name: "Low-to-High Cable Fly", muscle: "Chest", group: "push", equipment: "machine", bwRatio: 0.12, minLevel: "beginner", compound: false },
  { name: "Pec Deck Fly", muscle: "Chest", group: "push", equipment: "machine", bwRatio: 0.4, minLevel: "beginner", compound: false },
  { name: "Smith Machine Bench Press", muscle: "Chest", group: "push", equipment: "machine", bwRatio: 0.7, minLevel: "beginner", compound: true },
  { name: "Chest Dip", muscle: "Chest", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: true },
  { name: "Incline Push-Up", muscle: "Chest", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Rope Triceps Pushdown", muscle: "Triceps", group: "push", equipment: "machine", bwRatio: 0.3, minLevel: "beginner", compound: false },
  { name: "Overhead Cable Triceps Extension", muscle: "Triceps", group: "push", equipment: "machine", bwRatio: 0.3, minLevel: "beginner", compound: false },
  { name: "Overhead Dumbbell Triceps Extension", muscle: "Triceps", group: "push", equipment: "dumbbell", bwRatio: 0.2, minLevel: "beginner", compound: false },
  { name: "Skull Crusher", muscle: "Triceps", group: "push", equipment: "barbell", bwRatio: 0.3, minLevel: "intermediate", compound: false },
  { name: "Dumbbell Kickback", muscle: "Triceps", group: "push", equipment: "dumbbell", bwRatio: 0.08, minLevel: "beginner", compound: false },
  { name: "Bench Dip", muscle: "Triceps", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Diamond Push-Up", muscle: "Triceps", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: true },

  // Pull
  { name: "Barbell Row", muscle: "Back", group: "pull", equipment: "barbell", bwRatio: 0.7, minLevel: "intermediate", compound: true },
  { name: "Lat Pulldown", muscle: "Back", group: "pull", equipment: "machine", bwRatio: 0.6, minLevel: "beginner", compound: true },
  { name: "Seated Cable Row", muscle: "Back", group: "pull", equipment: "machine", bwRatio: 0.6, minLevel: "beginner", compound: true },
  { name: "Pull-Up", muscle: "Back", group: "pull", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: true },
  { name: "Inverted Row", muscle: "Back", group: "pull", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Dumbbell Row", muscle: "Back", group: "pull", equipment: "dumbbell", bwRatio: 0.3, minLevel: "beginner", compound: true },
  { name: "Face Pull", muscle: "Rear delts", group: "pull", equipment: "machine", bwRatio: 0.25, minLevel: "beginner", compound: false },
  { name: "Barbell Curl", muscle: "Biceps", group: "pull", equipment: "barbell", bwRatio: 0.3, minLevel: "beginner", compound: false },
  { name: "Dumbbell Hammer Curl", muscle: "Biceps", group: "pull", equipment: "dumbbell", bwRatio: 0.15, minLevel: "beginner", compound: false },
  { name: "Weighted Pull-Up", muscle: "Back", group: "pull", equipment: "bodyweight", bwRatio: 0.2, minLevel: "professional", compound: true },

  // Legs
  { name: "Barbell Back Squat", muscle: "Quads", group: "legs", equipment: "barbell", bwRatio: 1.0, minLevel: "intermediate", compound: true },
  { name: "Goblet Squat", muscle: "Quads", group: "legs", equipment: "dumbbell", bwRatio: 0.3, minLevel: "beginner", compound: true },
  { name: "Romanian Deadlift", muscle: "Hamstrings", group: "legs", equipment: "barbell", bwRatio: 0.9, minLevel: "intermediate", compound: true },
  { name: "Conventional Deadlift", muscle: "Posterior chain", group: "legs", equipment: "barbell", bwRatio: 1.3, minLevel: "professional", compound: true },
  { name: "Leg Press", muscle: "Quads", group: "legs", equipment: "machine", bwRatio: 1.6, minLevel: "beginner", compound: true },
  { name: "Walking Lunge", muscle: "Glutes", group: "legs", equipment: "dumbbell", bwRatio: 0.2, minLevel: "beginner", compound: true },
  { name: "Leg Curl", muscle: "Hamstrings", group: "legs", equipment: "machine", bwRatio: 0.4, minLevel: "beginner", compound: false },
  { name: "Bulgarian Split Squat", muscle: "Quads", group: "legs", equipment: "dumbbell", bwRatio: 0.25, minLevel: "intermediate", compound: true },
  { name: "Standing Calf Raise", muscle: "Calves", group: "legs", equipment: "machine", bwRatio: 0.5, minLevel: "beginner", compound: false },
  { name: "Air Squat", muscle: "Quads", group: "legs", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Glute Bridge", muscle: "Glutes", group: "legs", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },

  // Core
  { name: "Plank", muscle: "Core", group: "core", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Hanging Leg Raise", muscle: "Core", group: "core", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: false },
  { name: "Cable Crunch", muscle: "Core", group: "core", equipment: "machine", bwRatio: 0.35, minLevel: "beginner", compound: false },
  { name: "Dead Bug", muscle: "Core", group: "core", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },

  // Cardio / conditioning
  { name: "Zone 2 Treadmill", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Rowing Intervals", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "intermediate", compound: false },
  { name: "Assault Bike Sprints", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "professional", compound: false },
  { name: "Incline Walk", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Burpees", muscle: "Cardio", group: "cardio", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Jump Rope", muscle: "Cardio", group: "cardio", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },
];
