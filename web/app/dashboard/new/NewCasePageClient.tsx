"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronLeft } from "lucide-react";
import { streamResumeFeedback } from "@/lib/api";
import Link from "next/link";

export default function NewCasePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "resume";

  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  // ... inputs state ...
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleAnalyze = async () => {
    // 1. Prepare Case Logic
    let stage = 'applying';
    let artifactType = '';
    let artifactContent = null;
    let computedRoleContext = {
      title: roleTitle || "Unknown Role",
      company_name: companyName || "Unknown Company",
      job_description_text: jdText
    };

    if (mode === "interview") {
      stage = 'interviewing';
      artifactType = 'interview_plan';
      artifactContent = { id: 'init', schedule: [], story_bank: [] }; // Empty plan
    } else if (mode === "offer") {
      stage = 'negotiating';
      artifactType = 'offer';
      artifactContent = { id: 'init', status: 'received', components: { base_salary: 0 } }; // Empty offer
    } else {
      // Resume Mode
      stage = 'applying';
      artifactType = 'resume';
      if (!resumeText.trim()) return;
    }

    setStep("analyzing");

    try {
      // A. If Resume, we need to generate the analysis first (Stream)
      if (mode === 'resume') {
        const response = await streamResumeFeedback(resumeText, jdText || undefined, () => { }, "case_resume");
        if (response.ok && response.report) {
          artifactContent = {
            id: 'init',
            raw_text: resumeText,
            version: 1,
            analysis: response.report
          };
          // Infer role context if missing? For now use defaults.
          if (!computedRoleContext.title || computedRoleContext.title === "Unknown Role") {
            computedRoleContext.title = "Resume Analysis Case";
          }
        } else {
          setStep("input");
          alert("Analysis failed.");
          return;
        }
      }

      // B. Create Case in Backend
      const res = await fetch('/api/cases/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_mock_123', // In real app, auth
          roleContext: computedRoleContext,
          artifactType,
          artifactContent
        })
      });

      const data = await res.json();

      if (data.ok && data.caseId) {
        // C. Redirect to Persistent Page
        router.push(`/dashboard/cases/${data.caseId}`);
      } else {
        throw new Error(data.error || "Failed to create case");
      }

    } catch (e: any) {
      setStep("input");
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  const modeLabel = mode === "interview" ? "Interview Prep" : mode === "offer" ? "Offer Negotiation" : "Resume Analysis";

  // Render Form Only (result logic moved to CaseView / redirect)
  return (
    <StudioShell showSidebar={true}>
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Case Files
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-display text-3xl mb-2">{modeLabel}</h1>
          <p className="text-body-pro text-muted-foreground">Provide context to initialize this case.</p>
        </div>

        {step === "analyzing" ? (
          <div className="border border-border/50 rounded-xl bg-card p-12 text-center text-muted-foreground space-y-4 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <div>
              <p className="font-medium text-foreground">Analyzing Case Data...</p>
              <p className="text-xs">Consulting the algorithm</p>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm p-1 space-y-1">
            <div className="p-8 space-y-6">
              {mode === "interview" || mode === "offer" ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-eyebrow">Target Role</Label>
                    <Input
                      placeholder="e.g. Senior Product Manager"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="h-12 bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-eyebrow">Company</Label>
                    <Input
                      placeholder="e.g. Stripe"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-12 bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label className="text-eyebrow">{mode === "resume" ? "Resume Text" : "Job Description / Context"}</Label>
                <Textarea
                  placeholder={mode === "resume" ? "Paste full resume content..." : "Paste the JD or context here..."}
                  className="min-h-[200px] bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-indigo-500/50 transition-all font-mono text-sm resize-none p-4 leading-relaxed"
                  value={mode === "resume" ? resumeText : jdText}
                  onChange={(e) => (mode === "resume" ? setResumeText(e.target.value) : setJdText(e.target.value))}
                />
              </div>
            </div>

            <div className="bg-secondary/20 p-4 border-t border-border/50 flex justify-end rounded-b-lg">
              <Button size="lg" onClick={handleAnalyze}>
                Create Case
              </Button>
            </div>
          </div>
        )}
      </div>
    </StudioShell>
  );
}
