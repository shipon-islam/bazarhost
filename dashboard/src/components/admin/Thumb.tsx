import Image from "next/image";
import { initials, cn } from "@/lib/utils";

/**
 * Square thumbnail with graceful fallbacks: image → emoji (mock data) → initials.
 * Uses next/image; blob/data URLs (local previews) are rendered unoptimised.
 * Remote images need their host added to `images.remotePatterns` in next.config.ts.
 */
export function Thumb({
  src,
  emoji,
  name,
  size = 40,
  rounded = "lg",
  className,
}: {
  src?: string | null;
  emoji?: string;
  name: string;
  size?: number;
  rounded?: "lg" | "full";
  className?: string;
}) {
  const radius = rounded === "full" ? "rounded-full" : "rounded-lg";
  if (src) {
    const local = src.startsWith("blob:") || src.startsWith("data:");
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized={local}
        className={cn("shrink-0 bg-gray-100 object-cover", radius, className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gray-100 font-semibold text-gray-600",
        radius,
        className,
      )}
    >
      {emoji ?? initials(name)}
    </span>
  );
}
