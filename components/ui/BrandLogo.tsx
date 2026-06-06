import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      alt="Daniyal Transport"
      className={`h-auto w-full object-contain ${className}`}
      height={161}
      priority
      src="/logo.png"
      width={306}
    />
  );
}
