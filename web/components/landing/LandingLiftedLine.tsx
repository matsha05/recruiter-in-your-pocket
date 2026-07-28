import Link from "next/link";
import {
    ArrowRight,
    BookOpenText,
    BracketsAngle,
    CornersOut,
    LockKey,
    PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";

function FirstReadHero() {
    return (
        <article className="lift-first-read lift-first-read-compact" aria-labelledby="lift-first-read-title">
            <header className="lift-first-read-header">
                <div className="lift-first-read-brand">
                    <span aria-hidden="true">R</span>
                    <p>Recruiter first read</p>
                </div>
                <p>Opening read</p>
            </header>

            <div className="lift-first-read-verdict">
                <p className="lift-builder-label">Likely takeaway</p>
                <h2 id="lift-first-read-title">Strong operator.<br /><em>Scope still blurry.</em></h2>
                <p>The work sounds important. The page does not yet show how much moved—or what changed because of it.</p>
            </div>

            <footer className="lift-first-read-evidence">
                <p>Exact resume line</p>
                <blockquote>“Led onboarding initiatives across teams to improve new-hire productivity.”</blockquote>
            </footer>
        </article>
    );
}

function ReportFirstSection() {
    return (
        <section id="how-it-works" className="lift-report-first" aria-labelledby="lift-report-first-title">
            <div className="lift-shell">
                <div className="lift-report-first-heading">
                    <div>
                        <p className="lift-kicker">The first-read report</p>
                        <h2 id="lift-report-first-title">See what the first read actually gives you.</h2>
                    </div>
                    <p>Not a score to decode. A clear read of what lands, what stays blurry, and the first truthful change worth making.</p>
                </div>

                <article className="lift-report-excerpt" aria-label="Sample first-read report excerpt">
                    <div className="lift-report-excerpt-meta">
                        <span>Report excerpt</span>
                        <span>01 / Opening read</span>
                    </div>
                    <div className="lift-report-excerpt-grid">
                        <section className="lift-report-cell" data-tone="plain">
                            <CornersOut aria-hidden="true" weight="duotone" />
                            <p>Exact resume line</p>
                            <blockquote>“Led onboarding initiatives across teams to improve new-hire productivity.”</blockquote>
                        </section>
                        <section className="lift-report-cell" data-tone="butter">
                            <BookOpenText aria-hidden="true" weight="duotone" />
                            <p>Likely takeaway</p>
                            <strong>Strong operator. Scope still blurry.</strong>
                            <span>Cross-team ownership is easy to see.</span>
                        </section>
                        <section className="lift-report-cell" data-tone="plain">
                            <BracketsAngle aria-hidden="true" weight="duotone" />
                            <p>Missing context questions</p>
                            <strong>Which teams? How many people? What improved?</strong>
                        </section>
                        <section className="lift-report-cell" data-tone="sky">
                            <PaperPlaneTilt aria-hidden="true" weight="duotone" />
                            <p>First action</p>
                            <strong>Put the scale and result beside the onboarding work.</strong>
                        </section>
                    </div>

                    <div className="lift-report-handoff">
                        <div>
                            <p className="lift-kicker">Your turn</p>
                            <h3>Now see what yours says.</h3>
                            <p>Your first report is free, private by default, and requires no account to start.</p>
                        </div>
                        <div className="lift-report-handoff-actions">
                            <Link href="/workspace" className="lift-button-primary">Upload my resume <ArrowRight aria-hidden="true" weight="bold" /></Link>
                            <Link href="/workspace?sample=1" className="lift-text-link">Read the complete sample <ArrowRight aria-hidden="true" /></Link>
                        </div>
                    </div>
                </article>

                <div className="lift-transformation" aria-label="Illustrative transformation example">
                    <div>
                        <p className="lift-kicker">Transformation example</p>
                        <p>Same work. More visible evidence.</p>
                    </div>
                    <dl>
                        <div><dt>Led initiatives</dt><dd>Rebuilt 30-day program</dd></div>
                        <div><dt>Teams</dt><dd>Sales, Support &amp; Ops</dd></div>
                        <div><dt>Productivity</dt><dd>Cut ramp time 28%</dd></div>
                    </dl>
                </div>
            </div>
        </section>
    );
}

function SupportBand() {
    const career = ["Robert Half", "Google", "Meta", "X-Team", "OpenAI"];

    return (
        <section className="lift-credibility" aria-labelledby="lift-credibility-title">
            <div className="lift-shell lift-support-grid">
                <div className="lift-credibility-copy">
                    <p className="lift-kicker">Recruiting judgment, made repeatable</p>
                    <h2 id="lift-credibility-title">Built from 14 years inside recruiting and hiring teams.</h2>
                    <p>RIYP turns the questions recruiters ask privately into a product you can use before you apply: what lands, where the reader has to guess, and what to make clearer next.</p>
                    <p className="lift-credibility-label lift-support-label">Experience across</p>
                    <ol className="lift-support-career" aria-label="Selected recruiting and people leadership experience">
                        {career.map((company) => <li key={company}>{company}</li>)}
                    </ol>
                    <Link className="lift-credibility-link" href="/methodology">See how the report works <ArrowRight aria-hidden="true" /></Link>
                    <p className="lift-credibility-disclosure">Recruiter in Your Pocket is independent. Company names identify the founder&apos;s work history; no current or former employer sponsors or endorses it.</p>
                </div>

                <article className="lift-support-research" aria-labelledby="lift-research-title">
                    <BookOpenText aria-hidden="true" weight="duotone" />
                    <p className="lift-kicker">Research</p>
                    <h3 id="lift-research-title">Advice with receipts.</h3>
                    <p>Writing assistance increased hiring by 8% in a field experiment with nearly 500,000 job seekers.</p>
                    <p className="lift-support-limit">Limit: the experiment took place in an online labor market. It does not prove the same lift in every hiring process.</p>
                    <a href="https://www.nber.org/papers/w30886" target="_blank" rel="noopener noreferrer" className="lift-credibility-link">Wiles, Munyikwa &amp; Horton (2023) <ArrowRight aria-hidden="true" /></a>
                </article>
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

            <ReportFirstSection />
            <SupportBand />

            <section className="lift-close" aria-labelledby="lift-close-title">
                <div className="lift-shell lift-close-grid">
                    <div>
                        <p className="lift-kicker">Before you send it</p>
                        <h2 id="lift-close-title">Let&apos;s make sure the value is visible.</h2>
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
