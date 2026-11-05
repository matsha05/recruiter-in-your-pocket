"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CaretDown } from "@phosphor-icons/react";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";
import { ReadComparison } from "@/components/workspace/report/ReadComparison";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { ScoreBand } from "@/components/workspace/report/markup/ScoreBand";
import { Clipping } from "@/components/materials/Clipping";
import { Paper } from "@/components/materials/Paper";
import { Pile } from "@/components/materials/Pile";
import rhythm from "@/components/materials/Rhythm.module.css";
import { Button } from "@/components/ui/button";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { JORDAN_EXAMPLE, JORDAN_RECHECK } from "@/lib/marketing/jordan-example";
import sampleReport from "@/public/sample-report.json";
import styles from "./Round4.module.css";

/** The wait screen as it stands, frozen at the writing stage, on Jordan's resume. */
export function WaitMock({ resumeText }: { resumeText: string }) {
    const [startedAt] = useState(() => Date.now() - 41_000);
    return (
        <div className={rhythm.page}>
            <AnalysisScanning stage="writing" startedAt={startedAt} resumeText={resumeText} onCancel={() => undefined} />
        </div>
    );
}

/** The re-check comparison as it stands: the sample report beside a revision with one Critical Miss changed and the score up. */
export function CompareMock() {
    const previous = sampleReport as unknown as ReportData;
    const topFixes = (previous.top_fixes || []).map((fix, index) => index === 0 ? { ...fix, fix: "Add what changed after the monthly renewal-risk reviews: the renewal rate before and after, or the accounts saved.", text: "Add what changed after the monthly renewal-risk reviews." } : fix);
    const current = { ...previous, score: 86, score_label: "Clear and specific", top_fixes: topFixes } as ReportData;
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <ReadComparison previous={previous} current={current} />
            </section>
        </div>
    );
}

/** Proposed: the upload where the sheet is the input, one button under it, everything else quiet. */
export function UploadMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={rhythm.title}>Let&rsquo;s see what they see.</h1>
                <div className={styles.upload}>
                    <Paper kind="plain" className={styles.dropSheet} role="button" tabIndex={0} aria-label="Drop your resume here, or choose a file">
                        <p className={styles.dropLine}>Drop your resume here.</p>
                        <p className={styles.dropQuiet}>PDF or Word, up to 4 MB. Or click to choose a file.</p>
                    </Paper>
                    <p className={styles.quietRow}>
                        <a href="#" className="riyp-link-quiet">Paste the text instead</a>
                        <Link href="/sample-report" className="riyp-link-quiet">See Jordan&rsquo;s report</Link>
                    </p>
                    <div className={styles.optional}><span>Compare with a job <span style={{ color: "hsl(var(--text-muted))", fontWeight: 400 }}>(optional)</span></span><CaretDown weight="bold" aria-hidden="true" /></div>
                    <Button size="lg" disabled>Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Button>
                    <p className={styles.quietRow}>OpenAI writes the report from your resume. We don&rsquo;t store the resume or opt it into model training. <Link href="/privacy" className="riyp-link-quiet">How we handle your data</Link></p>
                </div>
            </section>
        </div>
    );
}

/** Proposed: the report's first screen with the Critical Miss as the site's clipping. */
export function FirstScreenMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <div className={styles.first}>
                    <div>
                        <span className={styles.verdictLabel}>Verdict</span>
                        <p className={styles.verdict}>Your current role centers on customer relationships and renewals for a defined SaaS portfolio.</p>
                        <p className={styles.verdictRest}>The objective and soft-skill statements take up space without explaining what you do differently.</p>
                    </div>
                    <div className={styles.bandWrap}><ScoreBand score={sampleReport.score} /></div>
                    <div>
                        <h2 className={styles.missHead}>Fix this first.</h2>
                        <span className={styles.missLabel}>Critical Miss · Experience</span>
                        <Clipping
                            line={JORDAN_EXAMPLE.line}
                            note="That would show how the monthly review informed your renewal work."
                            above="Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue"
                            below="Ran quarterly business reviews with customer leadership teams"
                        />
                        <div className={styles.ask}>
                            <p>{JORDAN_EXAMPLE.asks[0].question}</p>
                            <div className={styles.field} aria-hidden="true" />
                            <p className={styles.quietRow}><a href="#" className="riyp-link-quiet">I don&rsquo;t know</a><a href="#" className="riyp-link-quiet">I didn&rsquo;t do this</a></p>
                        </div>
                        <div className={rhythm.link}><FictionalTag /></div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/** Proposed: the comparison as the homepage's re-check, two clippings and the pen's word on the change. */
export function CompareProposedMock() {
    const { before, after, change } = JORDAN_RECHECK;
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h2 className={rhythm.title}>Your Critical Miss changed.</h2>
                <div className={styles.compare}>
                    <Clipping caption="First report · Oct 28" line={before} dim />
                    <Clipping caption="Revision 1 · Nov 4" line={after} note={`Changed. Up ${change}.`} />
                    <p className={styles.sum}>Up {change} since the first report. <span className={styles.sumQuiet}>The report now leads with a new Critical Miss; the Verdict reads the same.</span></p>
                </div>
            </section>
        </div>
    );
}

/** Proposed: settings on the rhythm, one column of rows, delete last. */
export function SettingsMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={rhythm.title}>Settings.</h1>
                <div className={styles.settings}>
                    <div className={styles.srow}><h2>Name</h2><input className={styles.field} defaultValue="Jordan" readOnly aria-label="Display name" /><Button variant="secondary" size="sm" disabled>Save</Button></div>
                    <div className={styles.srow}><h2>Email</h2><p>candidate@example.test</p><span /></div>
                    <div className={styles.srow}>
                        <h2>Your pass</h2>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            <Pile count={5} marked={[0, 1]} size="lg" label="Five sheets, two used" />
                            <p>3 of 5 reports left. Ends Jan 3, 2027.</p>
                        </div>
                        <Button variant="secondary" size="sm">New report</Button>
                    </div>
                    <div className={styles.srow}><h2>Purchases</h2><p className={styles.receipt}><span><strong>Job Search Pass</strong> · $29.00 · Oct 5, 2026</span><a href="#" className="riyp-link-quiet">Receipt</a></p><span /></div>
                    <div className={styles.srow}><h2>Your data</h2><p>Everything we hold, as a file.</p><Button variant="secondary" size="sm">Export</Button></div>
                    <div className={styles.srow}><h2>Delete account</h2><p>Your reports and your account go with it. Nothing comes back.</p><Button variant="destructive" size="sm">Delete</Button></div>
                </div>
            </section>
        </div>
    );
}
