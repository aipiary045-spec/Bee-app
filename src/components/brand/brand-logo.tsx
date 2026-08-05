import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
  alt?: string;
};

/** Official Apiary bee-in-hexagon mark (transparent PNG). */
export function BrandLogo({
  className,
  size = 44,
  priority = false,
  alt = "Apiary",
}: BrandLogoProps) {
  // Natural logo art is roughly square.
  const width = size;
  const height = size;

  return (
    <Image
      src="/brand/apiary-logo.png"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "object-contain drop-shadow-[0_6px_14px_rgba(122,70,18,0.22)]",
        className
      )}
    />
  );
}

type BrandWatermarkProps = {
  className?: string;
  /** Larger decorative mark, usually faded behind content. */
  size?: number;
};

export function BrandWatermark({
  className,
  size = 420,
}: BrandWatermarkProps) {
  const width = size;
  return (
    <div aria-hidden className={cn("brand-watermark absolute", className)}>
      <Image
        src="/brand/apiary-logo.png"
        alt=""
        width={width}
        height={size}
        className="object-contain"
      />
    </div>
  );
}
