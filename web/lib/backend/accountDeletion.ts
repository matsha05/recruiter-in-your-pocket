export type AccountDeletionRecord = {
  table: string;
  count: number | null;
};

type AuthOperationError = { message: string };

type AuthOperationResult = {
  error: AuthOperationError | null;
};

export async function finalizeAccountAuthDeletion(input: {
  deleteUser: () => Promise<AuthOperationResult>;
  signOut: () => Promise<AuthOperationResult>;
}) {
  const { error: authDeleteError } = await input.deleteUser();
  if (authDeleteError) {
    return {
      deleted: false as const,
      authDeleteError,
      sessionSignOutError: null,
    };
  }

  let sessionSignOutError: AuthOperationError | null;
  try {
    ({ error: sessionSignOutError } = await input.signOut());
  } catch (error) {
    sessionSignOutError = {
      message: error instanceof Error ? error.message : "Session cleanup failed",
    };
  }
  return {
    deleted: true as const,
    authDeleteError: null,
    sessionSignOutError,
  };
}

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
