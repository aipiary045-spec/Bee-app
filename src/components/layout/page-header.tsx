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
        "fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-honey-700">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-1 text-3xl font-bold text-hive-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-hive-600">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
