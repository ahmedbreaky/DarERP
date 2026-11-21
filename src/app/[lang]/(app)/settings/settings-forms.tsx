"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { changePassword, updateProfile } from "./actions";

type Dict = Pick<Dictionary, "auth" | "errors" | "common" | "settings">;

export function ProfileForm({ fullName, email, dict }: { fullName: string; email: string; dict: Dict }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4 p-5">
      {state?.error ? <Alert tone="error">{dict.errors[state.error]}</Alert> : null}
      {state?.ok ? <Alert tone="success">{dict.common.saved}</Alert> : null}
      <Field label={dict.auth.fullName} name="fullName" defaultValue={fullName} required maxLength={120} />
      <Field label={dict.auth.email} name="email" defaultValue={email} disabled ltr />
      <SubmitButton pendingLabel={dict.common.saving}>{dict.common.save}</SubmitButton>
    </form>
  );
}

export function PasswordForm({ dict }: { dict: Dict }) {
  const [state, action] = useActionState(changePassword, null);
  return (
    <form action={action} className="space-y-4 p-5">
      {state?.error ? <Alert tone="error">{dict.errors[state.error]}</Alert> : null}
      {state?.ok ? <Alert tone="success">{dict.settings.passwordChanged}</Alert> : null}
      <Field
        label={dict.auth.newPassword}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        ltr
        hint={dict.auth.passwordHint}
      />
      <SubmitButton pendingLabel={dict.common.saving}>{dict.auth.resetButton}</SubmitButton>
    </form>
  );
}
