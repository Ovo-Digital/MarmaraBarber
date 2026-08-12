import Image from "next/image";

type LogoVariant = "header" | "drawer";

interface BrandLogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}

/** Dominant wordmark — geniş yatay logo; kutular orandan biraz geniş tutuldu */
const VARIANT_CLASS: Record<LogoVariant, string> = {
  header:
    "h-[24px] w-[108px] sm:h-[30px] sm:w-[135px] md:h-[38px] md:w-[170px] lg:h-[44px] lg:w-[200px] xl:h-[48px] xl:w-[220px]",
  drawer:
    "h-[32px] w-[135px] sm:h-[36px] sm:w-[155px] md:h-[40px] md:w-[175px] lg:h-[44px] lg:w-[200px]",
};

export function BrandLogo({ variant = "header", className = "", priority = false }: BrandLogoProps) {
  return (
    <span
      className={`relative inline-block shrink-0 ${VARIANT_CLASS[variant]} ${className}`}
    >
      <Image
        src="/brand/logo-dominant.svg"
        alt="Dominant"
        fill
        priority={priority}
        sizes="(max-width: 640px) 120px, (max-width: 1024px) 170px, 220px"
        className="object-contain object-left"
      />
    </span>
  );
}
