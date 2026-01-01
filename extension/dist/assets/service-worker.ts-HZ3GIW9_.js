import { b as getJobsUrl, c as checkAuth, d as deleteJob, e as getSavedJobs$1, f as captureJob } from './api-C29iMCNa.js';
export { g as getLoginUrl } from './api-C29iMCNa.js';

const STORAGE_KEY = "riyp_extension_data";
const DEFAULT_STORAGE = {
  savedJobs: [],
  lastUpdated: Date.now()
};
async function getStorage() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? DEFAULT_STORAGE;
}
async function setStorage(data) {
  const current = await getStorage();
  await chrome.storage.local.set({
    [STORAGE_KEY]: {
      ...current,
      ...data,
      lastUpdated: Date.now()
    }
  });
}
async function addSavedJob(job) {
  const storage = await getStorage();
  const existingIndex = storage.savedJobs.findIndex((j) => j.url === job.url);
  if (existingIndex >= 0) {
    storage.savedJobs[existingIndex] = job;
  } else {
    storage.savedJobs.unshift(job);
  }
  storage.savedJobs = storage.savedJobs.slice(0, 50);
  await setStorage({ savedJobs: storage.savedJobs });
}
async function deleteSavedJob(jobIdOrUrl) {
  const storage = await getStorage();
  const index = storage.savedJobs.findIndex(
    (j) => j.id === jobIdOrUrl || j.url === jobIdOrUrl
  );
  if (index === -1) {
    return null;
  }
  const [deleted] = storage.savedJobs.splice(index, 1);
  await setStorage({ savedJobs: storage.savedJobs });
  return deleted;
}
async function getSavedJobs() {
  const storage = await getStorage();
  return storage.savedJobs;
}
async function isJobCaptured(url) {
  const storage = await getStorage();
  const job = storage.savedJobs.find((j) => j.url === url);
  return { captured: !!job, job };
}
async function updateBadge() {
  const jobs = await getSavedJobs();
  const count = jobs.length;
  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count) });
    await chrome.action.setBadgeBackgroundColor({ color: "#0D9488" });
  } else {
    await chrome.action.setBadgeText({ text: "" });
  }
}

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch((error) => {
      console.error("[RIYP] Message handler error:", error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
);
async function handleMessage(message) {
  switch (message.type) {
    case "CAPTURE_JD": {
      const { jd, meta } = message.payload;
      try {
        const savedJob = await captureJob(jd, meta);
        await addSavedJob(savedJob);
        await updateBadge();
        return { success: true, data: savedJob };
      } catch (error) {
        console.warn("[RIYP] API capture failed, saving locally:", error);
        const localJob = {
          ...meta,
          score: null,
          jdPreview: jd.slice(0, 200)
        };
        await addSavedJob(localJob);
        await updateBadge();
        return { success: true, data: localJob };
      }
    }
    case "GET_JOBS": {
      try {
        const apiJobs = await getSavedJobs$1();
        const localJobs = await getSavedJobs();
        const mergedJobs = mergeJobs(apiJobs, localJobs);
        return { success: true, data: mergedJobs };
      } catch {
        const localJobs = await getSavedJobs();
        return { success: true, data: localJobs };
      }
    }
    case "DELETE_JOB": {
      const { jobId } = message.payload;
      try {
        await deleteJob(jobId);
      } catch (error) {
        console.warn("[RIYP] API delete failed (maybe local-only job):", error);
      }
      await deleteSavedJob(jobId);
      await updateBadge();
      return { success: true, deleted: jobId };
    }
    case "CHECK_AUTH": {
      const result = await checkAuth();
      return { success: true, data: result };
    }
    case "GET_QUICK_MATCH": {
      const jobs = await getSavedJobs();
      const job = jobs.find((j) => j.id === message.payload.jobId);
      if (!job) {
        return { success: false, error: "Job not found" };
      }
      return { success: true, data: { score: job.score ?? 0 } };
    }
    case "CHECK_JOB_STATUS": {
      const { url } = message.payload;
      const result = await isJobCaptured(url);
      return {
        success: true,
        data: {
          captured: result.captured,
          score: result.job?.score ?? null,
          jobId: result.job?.id
        }
      };
    }
    case "OPEN_WEBAPP": {
      const path = message.payload?.path ?? "/jobs";
      const baseUrl = getJobsUrl().replace("/jobs", "");
      await chrome.tabs.create({
        url: `${baseUrl}${path}`
      });
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown message type" };
  }
}
function mergeJobs(apiJobs, localJobs) {
  const jobMap = /* @__PURE__ */ new Map();
  for (const job of localJobs) {
    jobMap.set(job.url, job);
  }
  for (const job of apiJobs) {
    jobMap.set(job.url, job);
  }
  return Array.from(jobMap.values()).sort((a, b) => b.capturedAt - a.capturedAt);
}
chrome.runtime.onInstalled.addListener(async () => {
  console.log("[RIYP] Extension installed");
  await updateBadge();
  const { authenticated } = await checkAuth();
  console.log("[RIYP] Auth status:", authenticated);
});
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.riyp_extension_data) {
    updateBadge();
  }
});
console.log("[RIYP] Service worker initialized");

export { checkAuth, getJobsUrl };
//# sourceMappingURL=service-worker.ts-HZ3GIW9_.js.map
