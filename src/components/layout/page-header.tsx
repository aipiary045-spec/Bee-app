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
        "fade-up relative mb-6 overflow-hidden rounded-2xl surface-panel px-5 py-5 sm:px-6",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer-line" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-32 w-32 rounded-full bg-honey-400/20 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display mt-1 text-3xl font-bold text-hive-900 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-hive-600 sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
