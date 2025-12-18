export type OutcomeCategory =
  | "success"
  | "validation_error"
  | "auth_required"
  | "not_found"
  | "rate_limited"
  | "timeout"
  | "network_error"
  | "provider_error"
  | "schema_invalid"
  | "internal_error";
