"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/format";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { AuthHeading } from "../auth-heading";
import { signup } from "../actions";

export function SignupForm({
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
  const [state, action] = useActionState(signup.bind(null, lang), null);

  if (state?.ok) {
    return (
      <div className="space-y-4 text-center">
        <MailCheck className="mx-auto size-10 text-primary" aria-hidden />
        <AuthHeading
          title={auth.checkEmailTitle}
          subtitle={format(auth.checkEmailBody, { email: state.values?.email ?? "" })}
        />
        <Link href={`/${lang}/login`} className="text-sm font-medium text-primary hover:underline">
          {auth.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthHeading title={auth.signupTitle} subtitle={auth.signupSubtitle} />
      <form action={action} className="space-y-4">
        {state?.error ? <Alert tone="error">{errors[state.error]}</Alert> : null}
        <Field
          label={auth.fullName}
          name="fullName"
          autoComplete="name"
          required
          maxLength={120}
          defaultValue={state?.values?.fullName}
        />
        <Field
          label={auth.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          ltr
          defaultValue={state?.values?.email}
        />
        <Field
          label={auth.password}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          ltr
          hint={auth.passwordHint}
        />
        <SubmitButton pendingLabel={pending} className="w-full">
          {auth.signupButton}
        </SubmitButton>
        <p className="text-center text-sm text-muted">
          {auth.haveAccount}{" "}
          <Link href={`/${lang}/login`} className="font-medium text-primary hover:underline">
            {auth.signIn}
          </Link>
        </p>
      </form>
    </>
  );
}
