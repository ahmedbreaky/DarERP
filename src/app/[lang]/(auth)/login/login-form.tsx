"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { login } from "../actions";

export function LoginForm({
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
  const [state, action] = useActionState(login.bind(null, lang), null);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert tone="error">{errors[state.error]}</Alert> : null}
      <Field
        label={auth.email}
        name="email"
        type="email"
        autoComplete="email"
        required
        ltr
        defaultValue={state?.values?.email}
      />
      <div className="space-y-1.5">
        <Field label={auth.password} name="password" type="password" autoComplete="current-password" required ltr />
        <div className="text-end">
          <Link href={`/${lang}/forgot-password`} className="text-sm text-primary hover:underline">
            {auth.forgotPassword}
          </Link>
        </div>
      </div>
      <SubmitButton pendingLabel={pending} className="w-full">
        {auth.loginButton}
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        {auth.noAccount}{" "}
        <Link href={`/${lang}/signup`} className="font-medium text-primary hover:underline">
          {auth.createAccount}
        </Link>
      </p>
    </form>
  );
}
