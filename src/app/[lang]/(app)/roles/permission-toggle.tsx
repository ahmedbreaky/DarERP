"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Permission } from "@/lib/permissions";
import { setRolePermission } from "./actions";

export function PermissionToggle({
  role,
  permission,
  enabled,
  label,
  errorText,
}: {
  role: "manager" | "staff";
  permission: Permission;
  enabled: boolean;
  label: string;
  errorText: Record<string, string>;
}) {
  const [optimistic, setOptimistic] = useOptimistic(enabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="checkbox"
        aria-label={label}
        checked={optimistic}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          setError(null);
          startTransition(async () => {
            setOptimistic(next);
            const result = await setRolePermission({ role, permission, enabled: next });
            if (result.error) setError(errorText[result.error]);
          });
        }}
        className="size-4.5 cursor-pointer accent-primary disabled:cursor-wait"
      />
      {error ? <span className="text-xs text-danger" role="alert">{error}</span> : null}
    </div>
  );
}
