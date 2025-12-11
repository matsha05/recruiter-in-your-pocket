"use client";

import { useMemo, useState } from "react";
import { createCheckoutSession, parseResume, postResumeFeedback } from "../../../lib/api";
import { trackEvent } from "../../../lib/analytics";


const tabs = [
  { id: "overview", label: "Overview" },
  { id: "fixes", label: "Top Fixes" },
  { id: "sections", label: "By Section" },
  { id: "rewrites", label: "Bullet Upgrades" },
  { id: "alignment", label: "Job Alignment" },
  { id: "wins", label: "Missing Wins" }
];

export default function WorkspaceShell() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const summary = useMemo(
    () =>
      resumeText.length > 0
        ? `Ready to send ~${resumeText.length} characters to the API.`
        : "Paste resume text or upload a file to see summary here.",
    [resumeText]
  );

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      trackEvent("file_selected", { fileName: file.name, size: file.size });
      setFileName(file.name);
      setStatus(`Parsing ${file.name}...`);
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const parsed = await parseResume(formData);
        if (!parsed.ok || !parsed.text) {
          throw new Error(parsed.message || "Could not parse the file.");
        }
        setResumeText(parsed.text);
        setStatus(`Parsed ${file.name} (${parsed.text.length} chars)`);
      } catch (err: any) {
        setError(err?.message || "Upload failed.");
        setStatus(null);
      } finally {
        setUploading(false);
      }
    }
  }

  async function onRun() {
    setError(null);
    if (!resumeText.trim()) {
      setError("Please upload a PDF/DOCX or paste resume text.");
      trackEvent("run_attempt_empty");
      return;
    }
    setLoading(true);
    setStatus("Running analysis...");
    trackEvent("run_started", { hasFile: !!fileName, textLength: resumeText.length });
    try {
      const resp = await postResumeFeedback({
        text: resumeText,
        jobDescription: jobText
      });
      if (!resp.ok) {
        setError(resp.message || "Unable to run analysis.");
        setStatus(null);
        trackEvent("run_failed", { error: resp.message });
        return;
      }
      setReport(resp.data);
      trackEvent("run_success", { score: resp.data.score });
      setStatus(
        resp.free_uses_remaining !== undefined
          ? `Done. Free uses remaining: ${resp.free_uses_remaining ?? "—"}`
          : "Done."
      );
    } catch (e: any) {
      setError(e?.message || "Unable to run analysis.");
      setStatus(null);
      trackEvent("run_failed", { error: e?.message });
    } finally {
      setLoading(false);
    }
  }

  async function onUpgrade() {
    trackEvent("upgrade_clicked");
    try {
      const resp = await createCheckoutSession("24h");
      if (resp.ok && resp.url) {
        window.location.href = resp.url;
      } else {
        setError(resp.message || "Could not start checkout.");
      }
    } catch (e: any) {
      setError(e?.message || "Checkout failed.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input panel */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Your resume</h2>
          <p className="text-sm text-slate-600">
            Upload PDF/DOCX or paste. This is a placeholder; wire it to Supabase Storage + your API.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50">
          <span className="text-sm font-medium text-slate-800">Upload a file</span>
          <span className="text-xs text-slate-500">PDF or DOCX</span>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onFileChange} />
        </label>
        {fileName && <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">{fileName}</div>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Paste resume text</span>
            <span className="text-xs text-slate-500">{resumeText.length} chars</span>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[180px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Paste your resume text here..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Job description (optional)</span>
            <span className="text-xs text-slate-500">{jobText.length} chars</span>
          </div>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Paste the job description for alignment analysis..."
          />
        </div>

        <button
          type="button"
          onClick={onRun}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading || uploading}
        >
          {loading ? "Running..." : uploading ? "Parsing..." : "See how recruiters read you →"}
        </button>

        {status && <p className="text-sm text-slate-700">{status}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </section>

      {/* Report panel */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Report</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              onClick={onUpgrade}
            >
              Upgrade
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setReport(null);
                setResumeText("");
                setJobText("");
                setFileName(null);
                setStatus(null);
                trackEvent("new_report_clicked");
              }}
            >
              New report
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => trackEvent("sample_report_clicked")}
            >
              Sample report
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[220px] rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
          <p className="text-sm font-semibold text-slate-800">Preview</p>
          {report ? (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {activeTab === "overview" && (
                <>
                  <div className="font-semibold">
                    Score: {report.score ?? "—"} {report.score_label ? `(${report.score_label})` : ""}
                  </div>
                  <div>{report.summary || "No summary returned."}</div>
                </>
              )}
              {activeTab === "fixes" && (
                <ul className="list-disc space-y-1 pl-5">
                  {(report.gaps || []).map((gap: string, idx: number) => (
                    <li key={idx}>{gap}</li>
                  ))}
                  {!report.gaps?.length && <li className="text-slate-500">No gaps returned.</li>}
                </ul>
              )}
              {activeTab === "sections" && (
                <p className="text-slate-600">Section-level details not mapped yet. (Backend has richer fields.)</p>
              )}
              {activeTab === "rewrites" && (
                <ul className="space-y-2">
                  {(report.rewrites || []).map((rw: any, idx: number) => (
                    <li key={idx} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <div className="text-xs uppercase tracking-wide text-slate-500">{rw.label || "Rewrite"}</div>
                      <div className="text-slate-600 line-through">{rw.original}</div>
                      <div className="font-semibold text-slate-900">{rw.better}</div>
                    </li>
                  ))}
                  {!report.rewrites?.length && <li className="text-slate-500">No rewrites returned.</li>}
                </ul>
              )}
              {activeTab === "alignment" && (
                <div className="space-y-1">
                  <div className="text-slate-800 font-semibold">Strongly aligned</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {(report.job_alignment?.strongly_aligned || []).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {!report.job_alignment?.strongly_aligned?.length && (
                      <li className="text-slate-500">None listed.</li>
                    )}
                  </ul>
                  <div className="text-slate-800 font-semibold">Underplayed</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {(report.job_alignment?.underplayed || []).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {!report.job_alignment?.underplayed?.length && <li className="text-slate-500">None listed.</li>}
                  </ul>
                  <div className="text-slate-800 font-semibold">Missing</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {(report.job_alignment?.missing || []).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {!report.job_alignment?.missing?.length && <li className="text-slate-500">None listed.</li>}
                  </ul>
                </div>
              )}
              {activeTab === "wins" && (
                <ul className="list-disc space-y-1 pl-5">
                  {(report.missing_wins || []).map((win: string, idx: number) => (
                    <li key={idx}>{win}</li>
                  ))}
                  {!report.missing_wins?.length && <li className="text-slate-500">No missing wins listed.</li>}
                </ul>
              )}
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-600">
                {summary} Active tab: <span className="font-semibold">{tabs.find((t) => t.id === activeTab)?.label}</span>
              </p>
              <p className="mt-3 text-sm text-slate-500">
                When you hook this up, render the real report sections (overview, fixes, sections, rewrites, alignment,
                wins) here using the backend response.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

