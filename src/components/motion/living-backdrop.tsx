import { FlyingBees } from "@/components/motion/flying-bees";
import { cn } from "@/lib/utils";

const glows = [
  {
    className:
      "glow-drift -left-24 top-[-4rem] h-[22rem] w-[22rem] bg-honey-400/25",
  },
  {
    className:
      "glow-drift-alt right-[-6rem] top-[18%] h-[26rem] w-[26rem] bg-meadow-400/16",
    style: { animationDelay: "-8s" },
  },
  {
    className:
      "glow-drift-slow bottom-[-5rem] left-[28%] h-[20rem] w-[20rem] bg-honey-300/20",
    style: { animationDelay: "-14s" },
  },
];

const motes = [
  { left: "8%", delay: "0s", duration: "16s", size: 5, drift: 18 },
  { left: "16%", delay: "2.4s", duration: "19s", size: 3, drift: 28 },
  { left: "27%", delay: "5s", duration: "14s", size: 4, drift: 12 },
  { left: "39%", delay: "1.2s", duration: "21s", size: 3, drift: 22 },
  { left: "48%", delay: "7s", duration: "17s", size: 6, drift: 16 },
  { left: "61%", delay: "3.6s", duration: "15s", size: 3, drift: 30 },
  { left: "72%", delay: "9s", duration: "20s", size: 4, drift: 14 },
  { left: "81%", delay: "4.2s", duration: "18s", size: 3, drift: 24 },
  { left: "90%", delay: "6.5s", duration: "16s", size: 5, drift: 10 },
  { left: "33%", delay: "11s", duration: "22s", size: 2, drift: 36 },
  { left: "55%", delay: "8.4s", duration: "13s", size: 4, drift: 20 },
  { left: "12%", delay: "13s", duration: "24s", size: 3, drift: 8 },
];

export function LivingBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div className="honeycomb-shift absolute inset-0" />
      {glows.map((glow) => (
        <div
          key={glow.className}
          className={cn(
            "absolute rounded-full blur-3xl",
            glow.className
          )}
          style={glow.style}
        />
      ))}
      {motes.map((mote, index) => (
        <span
          key={`${mote.left}-${index}`}
          className="pollen-mote absolute rounded-full bg-honey-400/55 shadow-[0_0_10px_rgba(239,173,50,0.35)] dark:bg-honey-300/40"
          style={{
            left: mote.left,
            width: mote.size,
            height: mote.size,
            animationDelay: mote.delay,
            animationDuration: mote.duration,
            ["--mote-drift" as string]: `${mote.drift}px`,
          }}
        />
      ))}
      <FlyingBees count={2} className="opacity-35" />
    </div>
  );
}
