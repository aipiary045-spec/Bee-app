import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
  alt?: string;
};

/** Official Apiary bee-in-hexagon mark. */
export function BrandLogo({
  className,
  size = 44,
  priority = false,
  alt = "Apiary",
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/apiary-logo.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain drop-shadow-sm", className)}
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
  return (
    <div
      aria-hidden
      className={cn("brand-watermark absolute", className)}
    >
      <Image
        src="/brand/apiary-logo.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
}
