"use client";

import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";

/** Shown when an email link (confirm / reset) was invalid: /login?error=link */
export function LinkErrorNotice({ message }: { message: string }) {
  const params = useSearchParams();
  if (params.get("error") !== "link") return null;
  return (
    <div className="mb-4">
      <Alert tone="error">{message}</Alert>
    </div>
  );
}
