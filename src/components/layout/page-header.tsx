import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
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
        "fade-up mb-4 flex items-center justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {eyebrow &&
            (typeof eyebrow === "string" ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-honey-700">
                {eyebrow}
              </p>
            ) : (
              <div className="min-w-0">{eyebrow}</div>
            ))}
          <h1 className="font-display text-xl font-semibold text-hive-900 sm:text-2xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="mt-0.5 text-sm text-hive-600">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap justify-end gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
