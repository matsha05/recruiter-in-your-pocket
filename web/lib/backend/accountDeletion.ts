export type AccountDeletionRecord = {
  table: string;
  count: number | null;
};

export function buildAuthDeletionPendingResponse(
  deletions: AccountDeletionRecord[],
  canceledSubscriptions: number
) {
  return {
    status: 503,
    body: {
      ok: false as const,
      errorCode: "AUTH_DELETION_PENDING",
      message:
        "Your saved app data was deleted, but sign-in removal did not complete. Please try deleting your account again or contact support.",
      deletion_status: "auth_removal_pending" as const,
      retryable: true as const,
      deletions,
      canceled_subscriptions: canceledSubscriptions,
    },
  };
}

export function buildIncompleteAccountDeletionResponse() {
  return {
    status: 500,
    body: {
      ok: false as const,
      errorCode: "ACCOUNT_DELETION_INCOMPLETE",
      message:
        "Account deletion did not complete. Some app data may already be deleted; please try again or contact support.",
      deletion_status: "incomplete" as const,
      retryable: true as const,
    },
  };
}
