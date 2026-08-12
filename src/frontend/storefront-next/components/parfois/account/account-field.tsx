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
      <span className="text-[11px] text-[#666]">
        {label}
        {required && <span className="text-[#e53935]">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const accountInputClass =
  "w-full border-0 border-b border-[#ccc] bg-transparent py-2 text-[13px] text-black outline-none focus:border-black placeholder:text-[#bbb]";

export const accountSelectClass =
  "w-full appearance-none border-0 border-b border-[#ccc] bg-transparent py-2 pr-6 text-[13px] text-black outline-none focus:border-black";
