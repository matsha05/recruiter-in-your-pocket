import type { Page } from "@playwright/test";
import type { ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ArchiveServerIdentityReceipt,
  RenderedReportReceipt,
  Variant,
} from "../../lib/gauntlet/types";
import { canonicalJsonSha256, serialize } from "./contracts";

export type ArchiveServerIdentity = ArchiveServerIdentityReceipt;

export type ArchiveIdentityChallenge = {
  identity: ArchiveServerIdentity;
  publicPath: string;
  bytes: Buffer;
};

const FULL_GIT_SHA = /^[a-f0-9]{40}$/;
const CAPTURE_NONCE = /^[a-f0-9]{48}$/;

function captureBridgeKey(nonce: string) {
  if (!CAPTURE_NONCE.test(nonce)) throw new Error("archive capture nonce is invalid");
  return `__riyp_gauntlet_capture_${nonce}`;
}
export function buildArchiveIdentityChallenge(input: {
  variant: Variant;
  commit: string;
  nonce?: string;
}): ArchiveIdentityChallenge {
  if (!FULL_GIT_SHA.test(input.commit)) throw new Error("archive identity commit is invalid");
  const nonce = input.nonce ?? randomBytes(24).toString("hex");
  if (!CAPTURE_NONCE.test(nonce)) throw new Error("archive capture nonce is invalid");
  const identity: ArchiveServerIdentity = {
    schemaVersion: "1",
    nonce,
    variant: input.variant,
    commit: input.commit,
  };
  return {
    identity,
    publicPath: `/__gauntlet-${nonce}/archive-identity.json`,
    bytes: Buffer.from(serialize(identity)),
  };
}

export function assertArchiveIdentityBytes(
  actual: Buffer,
  challenge: ArchiveIdentityChallenge,
  label: string,
) {
  if (!actual.equals(challenge.bytes)) {
    throw new Error(`${label}: server archive identity did not match byte-for-byte`);
  }
}

export function assertRenderedReportReceipt(input: {
  receipt: RenderedReportReceipt;
  identity: ArchiveServerIdentity;
  caseId: string;
  effectiveReport: Record<string, unknown>;
}) {
  const expected = {
    ...input.identity,
    caseId: input.caseId,
    component: "ReportStream" as const,
    reportSha256: canonicalJsonSha256(input.effectiveReport),
  };
  if (canonicalJsonSha256(input.receipt) !== canonicalJsonSha256(expected)) {
    throw new Error(`${input.identity.variant}/${input.caseId}: rendered ReportStream report receipt mismatch`);
  }
}

export async function installCaptureBridge(input: {
  page: Page;
  identity: ArchiveServerIdentity;
  caseId: string;
}) {
  captureBridgeKey(input.identity.nonce);
  await input.page.addInitScript(({ identity, caseId }) => {
    const key = `__riyp_gauntlet_capture_${identity.nonce}`;
    Object.defineProperty(window, key, {
      value: { identity, caseId },
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }, { identity: input.identity, caseId: input.caseId });
}

export async function observeRenderedReportReceipt(input: {
  page: Page;
  archiveIdentity: ArchiveServerIdentity;
  caseId: string;
  effectiveReport: Record<string, unknown>;
}) {
  const receipt = await input.page.evaluate(async ({ identity, caseId }) => {
    type ReactFiber = {
      memoizedProps?: unknown;
      return?: ReactFiber | null;
    };
    type CaptureBridge = {
      identity: typeof identity;
      caseId: string;
      receipt?: {
        schemaVersion: "1";
        nonce: string;
        variant: "candidate" | "production";
        commit: string;
        caseId: string;
        component: "ReportStream";
        reportSha256: string;
      };
    };
    const key = `__riyp_gauntlet_capture_${identity.nonce}`;
    const bridge = (window as unknown as Record<string, unknown>)[key] as CaptureBridge | undefined;
    if (!bridge
      || bridge.caseId !== caseId
      || bridge.identity.schemaVersion !== identity.schemaVersion
      || bridge.identity.nonce !== identity.nonce
      || bridge.identity.variant !== identity.variant
      || bridge.identity.commit !== identity.commit) {
      throw new Error("capture bridge identity mismatch");
    }

    // This section is emitted directly by ReportStream. Walking from its host
    // fiber to the first owner with a `report` prop observes the actual prop
    // React rendered, rather than trusting the capture callback's input.
    const reportSection = document.querySelector("#section-first-impression");
    if (!reportSection) throw new Error("ReportStream anchor is missing");
    const fiberKey = Object.getOwnPropertyNames(reportSection)
      .find((candidate) => candidate.startsWith("__reactFiber$"));
    if (!fiberKey) throw new Error("ReportStream React fiber is unavailable");
    let fiber = (reportSection as unknown as Record<string, unknown>)[fiberKey] as ReactFiber | undefined;
    let renderedReport: Record<string, unknown> | null = null;
    while (fiber) {
      const props = fiber.memoizedProps;
      if (props
        && typeof props === "object"
        && !Array.isArray(props)
        && Object.prototype.hasOwnProperty.call(props, "report")) {
        const candidate = (props as { report?: unknown }).report;
        if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
          renderedReport = candidate as Record<string, unknown>;
          break;
        }
      }
      fiber = fiber.return ?? undefined;
    }
    if (!renderedReport) throw new Error("ReportStream report prop is unavailable");

    const sortJson = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(sortJson);
      if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([nestedKey, nested]) => [nestedKey, sortJson(nested)]));
      }
      return value;
    };
    const canonicalBytes = new TextEncoder().encode(JSON.stringify(sortJson(renderedReport)));
    const digest = await crypto.subtle.digest("SHA-256", canonicalBytes);
    const reportSha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const nextReceipt = Object.freeze({
      ...identity,
      caseId,
      component: "ReportStream" as const,
      reportSha256,
    });
    Object.defineProperty(bridge, "receipt", {
      value: nextReceipt,
      configurable: false,
      enumerable: true,
      writable: false,
    });
    return nextReceipt;
  }, { identity: input.archiveIdentity, caseId: input.caseId });
  assertRenderedReportReceipt({
    receipt,
    identity: input.archiveIdentity,
    caseId: input.caseId,
    effectiveReport: input.effectiveReport,
  });
  return receipt;
}

export async function writeArchiveIdentityChallenge(
  webRoot: string,
  challenge: ArchiveIdentityChallenge,
) {
  const relative = challenge.publicPath.replace(/^\//, "");
  const destination = path.join(webRoot, "public", relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, challenge.bytes, { flag: "wx" });
  return destination;
}

export async function assertArchiveServerIdentity(input: {
  origin: string;
  challenge: ArchiveIdentityChallenge;
  childExited: () => boolean;
  label: string;
  fetchImpl?: typeof fetch;
}) {
  if (input.childExited()) throw new Error(`${input.label}: isolated server is not alive`);
  const response = await (input.fetchImpl ?? fetch)(`${input.origin}${input.challenge.publicPath}`, {
    cache: "no-store",
    redirect: "manual",
  });
  if (response.status !== 200) {
    throw new Error(`${input.label}: archive identity returned HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  assertArchiveIdentityBytes(bytes, input.challenge, input.label);
  if (input.childExited()) throw new Error(`${input.label}: isolated server exited during identity verification`);
}

/** `killed` only means a signal was sent; signalCode/exitCode prove termination. */
export function isProcessExited(child: Pick<ChildProcess, "exitCode" | "signalCode">) {
  return child.exitCode !== null || child.signalCode !== null;
}

export function nextBuildArguments(nextBin: string) {
  return [nextBin, "build", "--webpack"];
}

export async function waitForServer(input: {
  origin: string;
  challenge: ArchiveIdentityChallenge;
  childOutput: Buffer[];
  childExited: () => boolean;
  label: string;
  fetchImpl?: typeof fetch;
}) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (input.childExited()) {
      throw new Error(`${input.label}: isolated server exited before readiness\n${Buffer.concat(input.childOutput).toString("utf8").slice(-8_000)}`);
    }
    try {
      await assertArchiveServerIdentity({
        origin: input.origin,
        challenge: input.challenge,
        childExited: input.childExited,
        label: `${input.label} readiness`,
        fetchImpl: input.fetchImpl,
      });
      return;
    } catch (error) {
      if (error instanceof Error
        && (error.message.includes("did not match byte-for-byte")
          || error.message.includes("is not alive")
          || error.message.includes("exited during"))) {
        throw error;
      }
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${input.label}: isolated server did not prove archive identity in 90 seconds`);
}
