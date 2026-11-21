import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  secondary: "border border-border bg-surface text-text hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
  danger: "border border-border bg-surface text-danger hover:bg-danger-soft",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "sm" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-60",
    size === "md" ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs",
    variants[variant],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "sm" }) {
  return <button type={type} className={cn(buttonClass(variant, size), className)} {...props} />;
}
