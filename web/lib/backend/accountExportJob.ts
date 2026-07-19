import { buildAccountExportPayload } from "./accountExport";
import { accountExportExpiresAt } from "./accountExportRetention";
import { logError } from "../observability/logger";

type ExportUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any> | null;
};

async function transitionJob(
  admin: any,
  jobId: string,
  userId: string,
  allowedStatuses: string[],
  patch: Record<string, unknown>,
) {
  const { data, error } = await admin
    .from("account_export_jobs")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("user_id", userId)
    .in("status", allowedStatuses)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(
      `Account export state transition failed: ${error?.message || "job was not in an expected state"}`,
    );
  }
}

export async function runInlineExportJob(admin: any, jobId: string, user: ExportUser) {
  await transitionJob(admin, jobId, user.id, ["pending"], {
    status: "running",
    started_at: new Date().toISOString(),
    error_message: null,
  });

  try {
    const payload = await buildAccountExportPayload(admin, user);
    await transitionJob(admin, jobId, user.id, ["running"], {
      status: "completed",
      completed_at: new Date().toISOString(),
      expires_at: accountExportExpiresAt(),
      result_json: payload,
      error_message: null,
    });
  } catch (err: any) {
    logError({
      msg: "account.export.inline_failed",
      user_id: user.id,
      outcome: "internal_error",
      err: {
        name: err?.name || "ExportError",
        message: err?.message || "Export generation failed",
      },
    });

    try {
      await transitionJob(admin, jobId, user.id, ["pending", "running"], {
        status: "failed",
        completed_at: new Date().toISOString(),
        result_json: null,
        expires_at: null,
        error_message: "Export generation failed",
      });
    } catch (transitionError: any) {
      logError({
        msg: "account.export.failure_transition_failed",
        user_id: user.id,
        outcome: "internal_error",
        err: {
          name: transitionError?.name || "ExportStateError",
          message: transitionError?.message || "Export failure state could not be recorded",
        },
      });
    }

    throw err;
  }
}
