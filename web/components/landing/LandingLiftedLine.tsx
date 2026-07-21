"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    ArrowCounterClockwise,
    ArrowDown,
    BookOpenText,
    BracketsAngle,
    CheckCircle,
    CornersOut,
    LockKey,
    PaperPlaneTilt,
} from "@phosphor-icons/react";
import Footer from "@/components/landing/Footer";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { Button } from "@/components/ui/button";

const detailTiles = [
    { label: "Who", value: "Sales, Support + Ops", stage: 1, tone: "iris" },
    { label: "How many", value: "18 hires / week", stage: 2, tone: "sky" },
    { label: "What changed", value: "30-day program rebuilt", stage: 3, tone: "sky" },
    { label: "Result", value: "28% faster ramp", stage: 4, tone: "apricot" },
] as const;

const firstReadTrace = [
    { label: "The page" },
    { label: "Reader takeaway" },
    { label: "First action" },
];

function LiftedLineDemo() {
    const [stage, setStage] = useState(4);

    const chooseStage = (nextStage: number) => {
        setStage(nextStage);
    };

    const replay = () => {
        setStage(0);
    };

    const liveSentence = stage === 0
        ? "Led onboarding initiatives across teams to improve new-hire productivity."
        : stage === 1
            ? "Improved onboarding across Sales, Support, and Operations."
            : stage === 2
                ? "Improved onboarding for 18 new hires a week across Sales, Support, and Operations."
                : stage === 3
                    ? "Rebuilt the 30-day onboarding program for 18 new hires a week across Sales, Support, and Operations."
                    : "Cut ramp time 28% for 18 new hires a week across Sales, Support, and Operations by rebuilding the 30-day onboarding program.";

    return (
        <div className="lift-demo lift-builder" aria-label="Interactive example of strengthening one resume bullet with specific details">
            <div className="lift-demo-toolbar">
                <div>
                    <p className="lift-kicker">One recommendation, in practice</p>
                    <p id="lift-builder-instructions" className="lift-demo-note">Here is what fixing an evidence gap can look like.</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="lift-builder-replay" onClick={replay} aria-label="Replay the bullet transformation">
                    <ArrowCounterClockwise aria-hidden="true" />
                    Start over
                </Button>
            </div>

            <div className="lift-builder-stage" aria-describedby="lift-builder-instructions">
                <div className="lift-builder-before">
                    <span className="lift-builder-label">Before</span>
                    <p>
                        Led <span data-focus={stage === 3 ? "true" : "false"}>onboarding initiatives</span> across <span data-focus={stage === 1 ? "true" : "false"}>teams</span> to improve <span data-focus={stage === 2 ? "true" : "false"}>new-hire productivity</span>.
                    </p>
                </div>

                <ArrowDown className="lift-builder-arrow" aria-hidden="true" weight="regular" />

                <div className="lift-builder-tiles" role="group" aria-label="Details to add to the resume bullet">
                    {detailTiles.map((tile) => (
                        <Button
                            key={tile.value}
                            type="button"
                            variant="outline"
                            className="lift-builder-tile"
                            data-tone={tile.tone}
                            data-active={stage === tile.stage ? "true" : "false"}
                            data-complete={stage >= tile.stage ? "true" : "false"}
                            onClick={() => chooseStage(tile.stage)}
                            aria-pressed={stage >= tile.stage}
                            aria-label={`Add ${tile.label.toLowerCase()}: ${tile.value}`}
                        >
                            <span>{tile.label}</span>
                            <strong>{tile.value}</strong>
                        </Button>
                    ))}
                </div>

                <div className="lift-builder-after">
                    <span className="lift-builder-label">After</span>
                    <p aria-hidden="true">
                        {stage === 0 ? (
                            <>Led onboarding initiatives across teams to improve new-hire productivity.</>
                        ) : (
                            <>
                                {stage >= 4 ? <>Cut ramp time <span className="lifted-word lifted-word-result">28%</span> for </> : stage >= 3 ? <>Rebuilt the <span data-entered="true">30-day onboarding program</span> for </> : stage >= 2 ? <>Improved onboarding for </> : <>Improved onboarding across </>}
                                {stage >= 2 ? <><span className="lifted-word lifted-word-sky">18 new hires a week</span>{" across "}</> : null}
                                <span className="lifted-word">Sales, Support, and Operations</span>
                                {stage >= 4 ? <> by rebuilding the <span data-entered="true">30-day onboarding program</span></> : null}.
                            </>
                        )}
                    </p>
                    <span className="sr-only" aria-live="polite">{liveSentence}</span>
                    <div className="lift-builder-status" data-complete={stage === 4 ? "true" : "false"}>
                        <CheckCircle aria-hidden="true" weight={stage === 4 ? "fill" : "regular"} />
                        {stage === 4 ? "Same work. Better read." : "Choose a detail to see this example improve."}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FirstReadHero() {
    const [traceProgress, setTraceProgress] = useState(4);

    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
            setTraceProgress(100);
            return;
        }

        const timers = [
            window.setTimeout(() => setTraceProgress(34), 260),
            window.setTimeout(() => setTraceProgress(67), 720),
            window.setTimeout(() => setTraceProgress(100), 1180),
        ];
        return () => timers.forEach(window.clearTimeout);
    }, []);

    return (
        <article className="lift-first-read" aria-labelledby="lift-first-read-title">
            <header className="lift-first-read-header">
                <div className="lift-first-read-brand">
                    <span aria-hidden="true">R</span>
                    <p>Recruiter first read</p>
                </div>
                <p>Opening read</p>
            </header>

            <LiftedTrace
                items={firstReadTrace}
                progress={traceProgress}
                ariaLabel="How the report moves from the resume page to a useful first action"
                compact
                className="lift-first-read-trace"
            />

            <div className="lift-first-read-verdict">
                <p className="lift-builder-label">Likely takeaway</p>
                <h2 id="lift-first-read-title">Strong operator.<br /><em>Scope still blurry.</em></h2>
                <p>The work sounds important. The page does not yet show how much moved—or what changed because of it.</p>
            </div>

            <div className="lift-first-read-rows">
                <div className="lift-first-read-row" data-tone="butter">
                    <CornersOut aria-hidden="true" weight="duotone" />
                    <div>
                        <p>What lands</p>
                        <strong>Cross-team ownership is easy to see.</strong>
                    </div>
                </div>
                <div className="lift-first-read-row" data-tone="apricot">
                    <BracketsAngle aria-hidden="true" weight="duotone" />
                    <div>
                        <p>Where the reader has to guess</p>
                        <strong>Which teams? How many people? What improved?</strong>
                    </div>
                </div>
                <div className="lift-first-read-row" data-tone="iris">
                    <PaperPlaneTilt aria-hidden="true" weight="duotone" />
                    <div>
                        <p>Fix first</p>
                        <strong>Put the scale and result beside the onboarding work.</strong>
                    </div>
                </div>
            </div>

            <footer className="lift-first-read-evidence">
                <p>What the page says</p>
                <blockquote>“Led onboarding initiatives across teams to improve new-hire productivity.”</blockquote>
            </footer>
        </article>
    );
}

function ReportProof() {
    return (
        <article className="lift-proof-panel" aria-labelledby="lift-report-title">
            <div className="lift-proof-heading">
                <div>
                    <p className="lift-kicker">The product</p>
                    <h2 id="lift-report-title">One report. One useful loop.</h2>
                </div>
                <Link href="/workspace?sample=1" className="lift-text-link">Open sample <ArrowRight aria-hidden="true" /></Link>
            </div>

            <div className="lift-report-rows">
                <div className="lift-report-row">
                    <CornersOut aria-hidden="true" />
                    <div>
                        <p className="lift-report-label">Read</p>
                        <p className="lift-report-copy">See the role, evidence, and open questions the page communicates.</p>
                    </div>
                    <p className="lift-report-example">What they understand—and where they guess.</p>
                </div>
                <div className="lift-report-row lift-report-row-apricot">
                    <BracketsAngle aria-hidden="true" />
                    <div>
                        <p className="lift-report-label">Answer</p>
                        <p className="lift-report-copy">Add the truthful detail the resume cannot supply on its own.</p>
                    </div>
                    <p className="lift-report-example">Your facts stay yours. No resume fan fiction.</p>
                </div>
                <div className="lift-report-row lift-report-row-butter">
                    <PaperPlaneTilt aria-hidden="true" />
                    <div>
                        <p className="lift-report-label">Compare</p>
                        <p className="lift-report-copy">Run the revised page and put the two opening reads side by side.</p>
                    </div>
                    <p className="lift-report-example">See what moved—and what is still unclear.</p>
                </div>
            </div>
        </article>
    );
}

function ResearchProof() {
    return (
        <article className="lift-proof-panel" aria-labelledby="lift-research-title">
            <div className="lift-proof-heading">
                <div>
                    <p className="lift-kicker">Research</p>
                    <h2 id="lift-research-title">Advice with receipts.</h2>
                </div>
                <BookOpenText aria-hidden="true" className="lift-heading-icon" />
            </div>

            <div className="lift-research-lede">
                <p>Clearer resumes helped employers see ability that was already there.</p>
            </div>
            <dl className="lift-research-list">
                <div>
                    <dt>What the study found</dt>
                    <dd>Writing assistance increased hiring by 8% in a field experiment with nearly 500,000 job seekers.</dd>
                </div>
                <div>
                    <dt>Published research</dt>
                    <dd><a href="https://www.nber.org/papers/w30886" target="_blank" rel="noopener noreferrer">Wiles, Munyikwa &amp; Horton (2023), NBER Working Paper 30886.</a></dd>
                </div>
                <div>
                    <dt>Limit</dt>
                    <dd>The experiment took place in an online labor market. It does not prove the same lift in every hiring process.</dd>
                </div>
            </dl>
            <Link href="/research/writing-quality-hire-probability" className="lift-text-link lift-research-link">Read the study breakdown <ArrowRight aria-hidden="true" /></Link>
        </article>
    );
}

function CredibilityBand() {
    const career = ["Robert Half", "Google", "Meta", "X-Team", "OpenAI"];

    return (
        <section className="lift-credibility" aria-labelledby="lift-credibility-title">
            <div className="lift-shell lift-credibility-grid">
                <div className="lift-credibility-copy">
                    <p className="lift-kicker">Recruiting judgment, made repeatable</p>
                    <h2 id="lift-credibility-title">Built from 14 years inside recruiting and hiring teams.</h2>
                    <p>RIYP turns the questions recruiters ask privately into a product you can use before you apply: what lands, where the reader has to guess, and what to make clearer next.</p>
                </div>

                <div className="lift-credibility-proof">
                    <p className="lift-credibility-label">Experience across</p>
                    <ol aria-label="Selected recruiting and people leadership experience">
                        {career.map((company) => <li key={company}>{company}</li>)}
                    </ol>
                    <Link className="lift-credibility-link" href="/methodology">
                        See how the report works <ArrowRight aria-hidden="true" />
                    </Link>
                    <p className="lift-credibility-disclosure">Recruiter in Your Pocket is independent. Company names identify the founder&apos;s work history; no current or former employer sponsors or endorses it.</p>
                </div>
            </div>
        </section>
    );
}

export function LandingLiftedLine() {
    return (
        <div data-visual-anchor="landing-home" className="lift-page">
            <section className="lift-hero" aria-labelledby="landing-home-title">
                <div className="lift-shell">
                    <div className="lift-hero-grid">
                        <div className="lift-hero-copy">
                            <p className="lift-kicker">Recruiter feedback, before you apply</p>
                            <h1 id="landing-home-title">You did the work.<br />Let&apos;s make sure they <span className="riyp-marker riyp-marker-block">see it.</span></h1>
                            <p className="lift-hero-deck">Your private recruiter-style report shows what they understand, where they hesitate, and the changes that will make the biggest difference.</p>
                            <div className="lift-actions">
                                <Link href="/workspace" data-testid="landing-primary-cta" className="lift-button-primary">See my first read <ArrowRight aria-hidden="true" weight="bold" /></Link>
                                <Link href="/workspace?sample=1" className="lift-button-secondary">View a sample</Link>
                            </div>
                            <p className="lift-privacy"><LockKey aria-hidden="true" weight="regular" /> First report free. No account required. Anonymous resume text is not saved by RIYP.</p>
                        </div>
                        <FirstReadHero />
                    </div>
                </div>
            </section>

            <section className="lift-practice-section" aria-labelledby="lift-practice-title">
                <div className="lift-shell">
                    <div className="lift-practice-heading">
                        <div>
                            <p className="lift-kicker">From question to revision</p>
                            <h2 id="lift-practice-title">The report finds the missing detail.<span>You decide what is true.</span></h2>
                        </div>
                        <p>Answer in your own words, keep the fact beside the draft, then run the new resume and compare the read. Nothing gets invented for you.</p>
                    </div>
                    <LiftedLineDemo />
                </div>
            </section>

            <section id="how-it-works" className="lift-proof-section" aria-label="Report and research preview">
                <div className="lift-shell lift-proof-grid">
                    <ReportProof />
                    <ResearchProof />
                </div>
            </section>

            <CredibilityBand />

            <section className="lift-close" aria-labelledby="lift-close-title">
                <div className="lift-shell lift-close-grid">
                    <div>
                        <p className="lift-kicker">Before you send it</p>
                        <h2 id="lift-close-title">There&apos;s probably more value here than your resume is showing.</h2>
                    </div>
                    <div>
                        <p>Good experience gets missed all the time. Usually for fixable reasons.</p>
                        <Link href="/workspace" className="lift-button-primary">Get your report <ArrowRight aria-hidden="true" weight="bold" /></Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
