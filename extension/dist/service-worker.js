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
async function getSavedJobs$1() {
  const storage = await getStorage();
  return storage.savedJobs;
}
async function updateBadge() {
  const jobs = await getSavedJobs$1();
  const count = jobs.length;
  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count) });
    await chrome.action.setBadgeBackgroundColor({ color: "#0D9488" });
  } else {
    await chrome.action.setBadgeText({ text: "" });
  }
}

const API_BASE = "http://localhost:3000";
async function captureJob(jd, meta) {
  const response = await fetch(`${API_BASE}/api/extension/capture-jd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ jd, meta })
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to capture job");
  }
  return data.data;
}
async function getSavedJobs() {
  const response = await fetch(`${API_BASE}/api/extension/saved-jobs`, {
    method: "GET",
    credentials: "include"
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch jobs");
  }
  return data.data;
}
async function deleteJob(jobId) {
  const response = await fetch(`${API_BASE}/api/extension/delete-job?id=${encodeURIComponent(jobId)}`, {
    method: "DELETE",
    credentials: "include"
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to delete job");
  }
}
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/api/extension/auth-status`, {
      method: "GET",
      credentials: "include"
    });
    const data = await response.json();
    return {
      authenticated: data.authenticated ?? false,
      user: data.user ?? null
    };
  } catch {
    return { authenticated: false, user: null };
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
        const apiJobs = await getSavedJobs();
        const localJobs = await getSavedJobs$1();
        const mergedJobs = mergeJobs(apiJobs, localJobs);
        return { success: true, data: mergedJobs };
      } catch {
        const localJobs = await getSavedJobs$1();
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
      const jobs = await getSavedJobs$1();
      const job = jobs.find((j) => j.id === message.payload.jobId);
      if (!job) {
        return { success: false, error: "Job not found" };
      }
      return { success: true, data: { score: job.score ?? 0 } };
    }
    case "OPEN_WEBAPP": {
      const path = message.payload?.path ?? "/saved-jobs";
      const baseUrl = "http://localhost:3000";
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
//# sourceMappingURL=service-worker.js.map
