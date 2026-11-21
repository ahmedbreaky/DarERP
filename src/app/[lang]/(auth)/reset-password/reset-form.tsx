"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { resetPassword } from "../actions";

export function ResetForm({
  lang,
  auth,
  errors,
  pending,
}: {
  lang: Locale;
  auth: Dictionary["auth"];
  errors: Dictionary["errors"];
  pending: string;
}) {
  const [state, action] = useActionState(resetPassword.bind(null, lang), null);

  return (
    <form action={action} className="space-y-4">
      {state?.error === "linkInvalid" ? (
        <Alert tone="error">
          {auth.resetNoSession}{" "}
          <Link href={`/${lang}/forgot-password`} className="font-medium underline">
            {auth.forgotButton}
          </Link>
        </Alert>
      ) : state?.error ? (
        <Alert tone="error">{errors[state.error]}</Alert>
      ) : null}
      <Field
        label={auth.newPassword}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        ltr
        hint={auth.passwordHint}
      />
      <SubmitButton pendingLabel={pending} className="w-full">
        {auth.resetButton}
      </SubmitButton>
    </form>
  );
}
