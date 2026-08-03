import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "fade-up relative mb-10 overflow-hidden rounded-3xl surface-panel px-6 py-7 sm:px-8",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer-line" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-honey-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-36 w-36 rounded-full bg-meadow-400/15 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-honey-700">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display mt-2 text-4xl font-bold text-hive-900 sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-hive-600">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}
