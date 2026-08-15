import { cn } from "@/lib/utils";

const bees = [
  { top: "18%", delay: "0s", duration: "16s", scale: 1 },
  { top: "42%", delay: "3s", duration: "20s", scale: 0.8 },
  { top: "68%", delay: "7s", duration: "18s", scale: 0.7 },
];

function BeeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 24"
      className={cn("h-4 w-5 text-hive-800", className)}
      aria-hidden
    >
      <ellipse cx="16" cy="13" rx="7" ry="6" fill="#2a241f" />
      <ellipse cx="16" cy="13" rx="7" ry="6" fill="#efad32" opacity="0.95" />
      <path d="M12 8.5h8v9h-8z" fill="#2a241f" opacity="0.55" />
      <ellipse cx="10" cy="8" rx="5" ry="3.2" fill="#fff8ec" opacity="0.85" />
      <ellipse cx="22" cy="8" rx="5" ry="3.2" fill="#fff8ec" opacity="0.7" />
      <circle cx="20.5" cy="12" r="1.1" fill="#2a241f" />
    </svg>
  );
}

interface FlyingBeesProps {
  className?: string;
  count?: number;
}

export function FlyingBees({ className, count = 3 }: FlyingBeesProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {bees.slice(0, count).map((bee, index) => (
        <span
          key={index}
          className="bee-fly absolute left-[-10%]"
          style={{
            top: bee.top,
            animationDelay: bee.delay,
            animationDuration: bee.duration,
            transform: `scale(${bee.scale})`,
          }}
        >
          <BeeMark />
        </span>
      ))}
    </div>
  );
}
