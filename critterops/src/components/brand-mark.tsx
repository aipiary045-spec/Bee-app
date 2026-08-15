import Image from "next/image";

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/brand/logo.svg"
      alt="The Wildlife Pros"
      width={size}
      height={size}
      priority
      className="rounded-xl"
    />
  );
}
