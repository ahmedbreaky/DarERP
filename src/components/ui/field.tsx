import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export const inputClass = cn(
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text",
  "placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring",
  "disabled:opacity-60",
);

/** A labelled input. `ltr` keeps emails/passwords left-to-right in Arabic. */
export function Field({
  label,
  hint,
  ltr,
  className,
  id,
  name,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; ltr?: boolean }) {
  const inputId = id ?? name;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        dir={ltr ? "ltr" : undefined}
        className={cn(inputClass, ltr && "text-start")}
        {...props}
      />
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
