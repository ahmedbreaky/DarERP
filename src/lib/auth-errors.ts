import type { AuthError } from "@supabase/supabase-js";
import type { ErrorKey } from "./form-state";

/** Turn a Supabase Auth error into one of our translated messages. */
export function authErrorKey(error: AuthError): ErrorKey {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "user_already_exists":
    case "email_exists":
      return "userExists";
    case "weak_password":
      return "weakPassword";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimit";
    case "email_address_invalid":
      return "invalidEmail";
    default:
      return "generic";
  }
}
