import { Dumbbell, Gauge, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui-kit";
import { MuscleMap } from "@/components/MuscleMap";
import { cuesFor, regionOf, type ExerciseDef } from "@/lib/exercises";
import { EQUIPMENT_LABEL, LEVEL_LABEL } from "@/lib/types";

interface ExerciseDetailsDialogProps {
  exercise: ExerciseDef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExerciseDetailsDialog({
  exercise,
  open,
  onOpenChange,
}: ExerciseDetailsDialogProps) {
  if (!exercise) return null;

  const cues = cuesFor(exercise.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[85vh] overflow-y-auto border-glass-line sm:max-w-xl">
        <DialogHeader className="pr-8 text-left">
          <Eyebrow>{regionOf(exercise.muscle)} technique</Eyebrow>
          <DialogTitle className="font-display text-2xl font-bold">{exercise.name}</DialogTitle>
          <DialogDescription>
            Follow each cue in order, using a controlled load and pain-free range of motion.
          </DialogDescription>
        </DialogHeader>

        <MuscleMap muscle={exercise.muscle} />

        <div className="grid grid-cols-3 gap-2" aria-label="Exercise details">
          <div className="glass-tile rounded-xl p-3">
            <Target className="mb-2 size-4 text-cyan" aria-hidden="true" />
            <p className="text-[10px] text-muted-foreground">Primary area</p>
            <p className="mt-0.5 text-xs font-semibold">{exercise.muscle}</p>
          </div>
          <div className="glass-tile rounded-xl p-3">
            <Dumbbell className="mb-2 size-4 text-violet" aria-hidden="true" />
            <p className="text-[10px] text-muted-foreground">Equipment</p>
            <p className="mt-0.5 text-xs font-semibold">{EQUIPMENT_LABEL[exercise.equipment]}</p>
          </div>
          <div className="glass-tile rounded-xl p-3">
            <Gauge className="mb-2 size-4 text-lime" aria-hidden="true" />
            <p className="text-[10px] text-muted-foreground">Level</p>
            <p className="mt-0.5 text-xs font-semibold">{LEVEL_LABEL[exercise.minLevel]}</p>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold">Step-by-step form</h3>
          {cues.length ? (
            <ol className="mt-3 space-y-2.5">
              {cues.map((cue, index) => (
                <li key={cue} className="glass-tile flex gap-3 rounded-xl p-3 text-sm leading-relaxed">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-softer text-[11px] font-bold text-cyan">
                    {index + 1}
                  </span>
                  <span>{cue}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Detailed coaching cues are not available for this exercise yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}