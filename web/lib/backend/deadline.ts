/**
 * A promise with a deadline. The report route's dependencies (Redis, Supabase) have no request
 * timeout of their own, so a hung connection would hold the person on the wait screen until the
 * platform killed the function. Past the deadline the caller fails closed with its own error, before
 * any model call and before anything is consumed.
 */
export function withDeadline<T>(promise: Promise<T>, ms: number, onTimeout: () => Error): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(onTimeout()), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}
