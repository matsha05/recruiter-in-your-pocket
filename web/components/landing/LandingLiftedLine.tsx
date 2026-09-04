import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    BookOpenText,
    BracketsAngle,
    CornersOut,
    LinkedinLogo,
    LockKey,
    PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { FREE_REPORT_ENTITLEMENT } from "@/lib/billing/pricing";

function FirstReadHero() {
    return (
        <article className="lift-first-read lift-first-read-compact" aria-labelledby="lift-first-read-title">
            <header className="lift-first-read-header">
                <div className="lift-first-read-brand">
                    <span aria-hidden="true">R</span>
                    <p>Example report</p>
                </div>
                <p>First impression</p>
            </header>

            <div className="lift-first-read-verdict">
                <p className="lift-builder-label">What to clarify</p>
                <h2 id="lift-first-read-title">You led onboarding.<br /><em>What changed?</em></h2>
                <p>How many new hires did you help onboard? Include what improved and how you measured it.</p>
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
                        <p className="lift-kicker">Inside your report</p>
                        <h2 id="lift-report-first-title">What does “across teams” mean?</h2>
                    </div>
                    <p>You know which teams you worked with. A recruiter reading this resume doesn&apos;t. Your report points out where more detail would help.</p>
                </div>

                <article className="lift-report-excerpt" aria-label="Sample first-read report excerpt">
                    <div className="lift-report-excerpt-meta">
                        <span>Report excerpt</span>
                        <span>01 / First impression</span>
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
                            <strong>You were responsible for onboarding.</strong>
                            <span>It&apos;s clear you were in charge, but “across teams” doesn&apos;t say which teams or how many new hires were involved.</span>
                        </section>
                        <section className="lift-report-cell" data-tone="plain">
                            <BracketsAngle aria-hidden="true" weight="duotone" />
                            <p>Questions to answer</p>
                            <strong>Which teams? How many people? What improved?</strong>
                        </section>
                        <section className="lift-report-cell" data-tone="sky">
                            <PaperPlaneTilt aria-hidden="true" weight="duotone" />
                            <p>First action</p>
                            <strong>Add the teams you worked with, how many people you onboarded, and the result.</strong>
                        </section>
                    </div>

                    <div className="lift-report-handoff">
                        <div>
                            <p className="lift-kicker">Your turn</p>
                            <h3>Get feedback on your resume.</h3>
                            <p>{FREE_REPORT_ENTITLEMENT.promise}</p>
                        </div>
                        <div className="lift-report-handoff-actions">
                            <Link href="/workspace" className="lift-button-primary">Upload my resume <ArrowRight aria-hidden="true" weight="bold" /></Link>
                            <Link href="/sample-report" className="lift-text-link">Read the complete sample <ArrowRight aria-hidden="true" /></Link>
                        </div>
                    </div>
                </article>

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
                    <p className="lift-kicker">The recruiter behind the report</p>
                    <div className="lift-founder-profile">
                        <Image
                            src="/assets/founder-avatar.jpg"
                            alt="Matt Shaw, founder of Recruiter in Your Pocket"
                            width={180}
                            height={180}
                            sizes="(max-width: 720px) 88px, 112px"
                        />
                        <div>
                            <h2 id="lift-credibility-title">Built by Matt Shaw.</h2>
                            <p><strong>14 years in recruiting and hiring.</strong> I built this to give candidates useful feedback before they hit send.</p>
                        </div>
                    </div>
                    <p className="lift-credibility-label lift-support-label">Experience across</p>
                    <ol className="lift-support-career" aria-label="Selected recruiting and people leadership experience">
                        {career.map((company) => <li key={company}>{company}</li>)}
                    </ol>
                    <div className="lift-founder-links">
                        <a className="lift-credibility-link" href="https://www.linkedin.com/in/mattrshaw" target="_blank" rel="noopener noreferrer">
                            <LinkedinLogo aria-hidden="true" weight="fill" /> View my LinkedIn
                        </a>
                        <Link className="lift-credibility-link" href="/methodology">See how the report works <ArrowRight aria-hidden="true" /></Link>
                    </div>
                    <p className="lift-founder-ai-note">AI generates the feedback using resume review criteria developed by Matt. Your report does not include a personal review from Matt.</p>
                    <p className="lift-credibility-disclosure">Recruiter in Your Pocket is independent. Company names identify the founder&apos;s work history; no current or former employer sponsors or endorses it.</p>
                </div>

                <article className="lift-support-research" aria-labelledby="lift-research-title">
                    <BookOpenText aria-hidden="true" weight="duotone" />
                    <p className="lift-kicker">Research</p>
                    <h3 id="lift-research-title">What the research found.</h3>
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
                            <p className="lift-kicker">Recruiter feedback, before you apply.</p>
                            <h1 id="landing-home-title">You did the work.<br />Let&apos;s make sure they <span className="riyp-marker riyp-marker-block">see it.</span></h1>
                            <p className="lift-hero-deck">Upload or paste your resume. See what a recruiter might notice, what needs more detail, and what to change first.</p>
                            <div className="lift-actions">
                                <Link href="/workspace" data-testid="landing-primary-cta" className="lift-button-primary">Get my free report <ArrowRight aria-hidden="true" weight="bold" /></Link>
                                <Link href="/sample-report" className="lift-button-secondary">See an example report</Link>
                            </div>
                            <div className="lift-hero-trust">
                                <p className="lift-privacy"><LockKey aria-hidden="true" weight="regular" /> {FREE_REPORT_ENTITLEMENT.promise} No account required.</p>
                                <details className="text-sm leading-6 text-muted-foreground">
                                    <summary className="focus-ring w-fit cursor-pointer font-medium text-foreground">Free report limits</summary>
                                    <p className="mt-2 max-w-xl">{FREE_REPORT_ENTITLEMENT.boundary}</p>
                                </details>
                                <p className="lift-ai-disclosure">AI feedback shaped by <a href="https://www.linkedin.com/in/mattrshaw" target="_blank" rel="noopener noreferrer">Matt Shaw&apos;s</a> 14 years in recruiting.</p>
                            </div>
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
                        <h2 id="lift-close-title">Ready to send your resume?</h2>
                    </div>
                    <div>
                        <p>Get feedback on the resume you&apos;re about to send, with up to three changes to make first.</p>
                        <Link href="/workspace" className="lift-button-primary">Get my free report <ArrowRight aria-hidden="true" weight="bold" /></Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
