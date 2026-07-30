import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-honey-400/30 bg-honey-100 text-honey-800",
        success: "border-meadow-400/30 bg-meadow-100 text-meadow-800",
        warning: "border-amber-400/30 bg-amber-100 text-amber-900",
        danger: "border-crimson-400/30 bg-crimson-100 text-crimson-800",
        muted: "border-wax-300 bg-wax-100 text-hive-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
