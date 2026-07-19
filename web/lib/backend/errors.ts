export type AppError = Error & {
  code?: string;
  httpStatus?: number;
  internal?: unknown;
};

export function createAppError(
  code: string,
  message: string,
  httpStatus: number,
  internal?: unknown,
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.httpStatus = httpStatus;
  if (internal !== undefined) error.internal = internal;
  return error;
}
