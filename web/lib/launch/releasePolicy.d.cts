export type ReleaseReadinessEnvironment = Record<string, string | undefined>;
export type ReleaseReadinessState = "hosted" | "strict" | "local";
export type ReleaseReadinessBypassStatus = "ok" | "missing" | "disabled";

export declare const RELEASE_READINESS_BYPASS_FLAGS: readonly [
  "USE_MOCK_OPENAI",
  "SKIP_DB_READY_CHECK",
];

export declare function getEnabledReleaseReadinessBypassFlags(
  env?: ReleaseReadinessEnvironment,
): Array<(typeof RELEASE_READINESS_BYPASS_FLAGS)[number]>;

export declare function resolveReleaseReadinessBypassPolicy(input: {
  env?: ReleaseReadinessEnvironment;
  releaseState: ReleaseReadinessState;
}): {
  enabledFlags: Array<(typeof RELEASE_READINESS_BYPASS_FLAGS)[number]>;
  status: ReleaseReadinessBypassStatus;
};
