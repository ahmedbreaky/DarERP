import type { Dictionary } from "@/i18n/dictionaries/en";

export type ErrorKey = keyof Dictionary["errors"];

/** What a form's Server Action returns to the form. Messages are dictionary keys. */
export type FormState = {
  error?: ErrorKey;
  ok?: boolean;
  /** Echo back what the user typed so the form keeps it after an error. */
  values?: Record<string, string>;
} | null;
