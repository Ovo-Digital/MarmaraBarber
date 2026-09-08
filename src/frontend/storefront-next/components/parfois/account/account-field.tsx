import type { ReactNode } from "react";

interface AccountFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function AccountField({ label, required, children, className = "" }: AccountFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span
        className="text-[11px] uppercase tracking-[0.14em]"
        style={{ color: "rgba(20,17,15,0.55)", fontFamily: "var(--font-owners)" }}
      >
        {label}
        {required && <span style={{ color: "var(--sg-red)" }}> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/* Alt çizgili sade alan; odaklanınca çizgi marka kırmızısına döner. */
export const accountInputClass =
  "w-full border-0 border-b border-[rgba(20,17,15,0.25)] bg-transparent py-2.5 text-[14px] text-[var(--lx-ink)] outline-none focus:border-[var(--sg-red)] placeholder:text-[rgba(20,17,15,0.3)]";

export const accountSelectClass =
  "w-full appearance-none border-0 border-b border-[rgba(20,17,15,0.25)] bg-transparent py-2.5 pr-6 text-[14px] text-[var(--lx-ink)] outline-none focus:border-[var(--sg-red)]";
