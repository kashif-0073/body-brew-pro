import { Play } from "lucide-react";
import { demoFor, muscleImage } from "@/lib/visuals";

/** Animated start→end form demo when available, otherwise a pulsing muscle highlight. */
export function ExerciseVisual({ name, muscle }: { name: string; muscle: string }) {
  const demo = demoFor(name);

  if (!demo) {
    return (
      <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-plate">
        <img decoding="async" loading="lazy" src={muscleImage(muscle)} alt={`${muscle} muscles worked`} width={816} height={816} className="muscle-pulse aspect-square w-full object-contain" />
        <figcaption className="px-3 pb-3 text-center text-xs font-semibold text-plate-foreground">Target: {muscle}</figcaption>
      </figure>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
      <figure className="relative overflow-hidden rounded-2xl bg-plate">
        {demo ? (
          <>
            <div className="relative aspect-square">
              <img decoding="async" loading="lazy" src={demo.start} alt={`${name} start position`} width={816} height={816} className="demo-a absolute inset-0 size-full object-contain" />
              <img decoding="async" loading="lazy" src={demo.end} alt={`${name} end position`} width={816} height={816} className="demo-b absolute inset-0 size-full object-contain" />
            </div>
            <figcaption className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase text-plate-foreground">
              <span className="demo-a rounded-full bg-plate/90 px-2 py-1 shadow-sm">1 · {demo.startLabel}</span>
              <span className="demo-b rounded-full bg-plate/90 px-2 py-1 shadow-sm">2 · {demo.endLabel}</span>
            </figcaption>
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-plate/90 px-2 py-1 text-[10px] font-semibold uppercase text-plate-foreground shadow-sm">
              <Play className="size-3" aria-hidden="true" /> Form demo
            </span>
          </>
        ) : (
          <div className="relative aspect-square">
            <img decoding="async" loading="lazy" src={muscleImage(muscle)} alt={`${muscle} muscles worked`} width={816} height={816} className="muscle-pulse absolute inset-0 size-full object-contain" />
          </div>
        )}
      </figure>
      <figure className="flex flex-col justify-center overflow-hidden rounded-2xl bg-plate">
        <img decoding="async" loading="lazy" src={muscleImage(muscle)} alt={`${muscle} highlighted`} width={816} height={816} className="aspect-square w-full object-contain" />
        <figcaption className="px-3 pb-3 text-center text-xs font-semibold text-plate-foreground">
          Target: {muscle}
        </figcaption>
      </figure>
    </div>
  );
}
