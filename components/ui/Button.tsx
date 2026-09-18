import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Tone = "amber" | "navy" | "red" | "green" | "ghost";

const toneClasses: Record<Tone, string> = {
  amber: "bg-amber text-navyDeep",
  navy: "bg-navy text-white",
  red: "bg-red text-white",
  green: "bg-green text-white",
  ghost: "bg-transparent text-navy border border-line",
};

export function Button({
  tone = "amber",
  full = true,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; full?: boolean }) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-xl py-3 px-4 font-semibold text-sm transition active:scale-[0.98] disabled:opacity-50",
        full && "w-full",
        toneClasses[tone],
        className
      )}
    />
  );
}
