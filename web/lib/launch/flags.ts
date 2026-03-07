const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function parseFlag(value: string | undefined, defaultValue: boolean) {
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return defaultValue;
}

export const launchFlags = {
  analytics: parseFlag(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, true),
  billingUnlock: parseFlag(process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK, true),
  extensionSync: parseFlag(process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC, true),
  guestReportSave: parseFlag(process.env.NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE, false),
  publicShareLinks: parseFlag(process.env.NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS, false),
  errorReplay: parseFlag(process.env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY, false),
} as const;

export type LaunchFlagName = keyof typeof launchFlags;

export function isLaunchFlagEnabled(name: LaunchFlagName) {
  return launchFlags[name];
}

export function getConfiguredExtensionOrigins() {
  return (process.env.RIYP_EXTENSION_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
