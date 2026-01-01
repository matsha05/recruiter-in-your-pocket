const API_BASE = "http://localhost:3000" ;
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
function getJobsUrl() {
  return `${API_BASE}/jobs`;
}
function getLoginUrl() {
  return `${API_BASE}/login?from=extension`;
}
function getGoogleAuthUrl() {
  return `${API_BASE}/auth/google?from=extension`;
}

export { API_BASE as A, getGoogleAuthUrl as a, getJobsUrl as b, checkAuth as c, deleteJob as d, getSavedJobs as e, captureJob as f, getLoginUrl as g };
//# sourceMappingURL=api-C29iMCNa.js.map
