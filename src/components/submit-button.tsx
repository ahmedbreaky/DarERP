"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

/** A submit button that shows a "saving" label while its form is sending. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} variant={variant}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
