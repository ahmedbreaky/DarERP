"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/format";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { forgotPassword } from "../actions";

export function ForgotForm({
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
  const [state, action] = useActionState(forgotPassword.bind(null, lang), null);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert tone="error">{errors[state.error]}</Alert> : null}
      {state?.ok ? (
        <Alert tone="success">{format(auth.forgotSent, { email: state.values?.email ?? "" })}</Alert>
      ) : (
        <>
          <Field
            label={auth.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            ltr
            defaultValue={state?.values?.email}
          />
          <SubmitButton pendingLabel={pending} className="w-full">
            {auth.forgotButton}
          </SubmitButton>
        </>
      )}
      <p className="text-center text-sm">
        <Link href={`/${lang}/login`} className="font-medium text-primary hover:underline">
          {auth.backToLogin}
        </Link>
      </p>
    </form>
  );
}
