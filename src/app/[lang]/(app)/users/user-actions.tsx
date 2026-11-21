"use client";

import { useState, useTransition } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { ROLES, type Role } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/components/ui/cn";
import { updateUser } from "./actions";

/** Role picker + approve/deactivate button for one user row. */
export function UserActions({
  userId,
  role,
  isActive,
  dict,
}: {
  userId: string;
  role: Role;
  isActive: boolean;
  dict: Pick<Dictionary, "roles" | "users" | "errors" | "common">;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(change: { role?: Role; isActive?: boolean }) {
    setError(null);
    startTransition(async () => {
      const result = await updateUser({ userId, ...change });
      if (result.error) setError(dict.errors[result.error]);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <select
          aria-label={dict.users.role}
          value={role}
          disabled={pending}
          onChange={(e) => run({ role: e.target.value as Role })}
          className={cn(inputClass, "h-8 w-auto py-0 pe-8 text-xs")}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {dict.roles[r]}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant={isActive ? "danger" : "primary"}
          disabled={pending}
          onClick={() => run({ isActive: !isActive })}
        >
          {pending ? dict.common.saving : isActive ? dict.users.deactivate : dict.users.activate}
        </Button>
      </div>
      {error ? <p className="text-xs text-danger" role="alert">{error}</p> : null}
    </div>
  );
}
