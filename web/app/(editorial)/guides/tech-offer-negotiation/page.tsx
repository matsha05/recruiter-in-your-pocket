import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/dist/ssr";
import {
    Checklist,
    Disclosure,
    GuideEyebrow,
    GuideSection,
    Script,
    Sources,
    TechOfferStack,
    WhatItGives,
} from "@/components/guides/OfferGuidePrimitives";

export const metadata: Metadata = {
    title: "How to Read and Negotiate a Tech Offer",
    description: "A practical guide to comparing base, bonus, equity, vesting, level, and year-one cash in a tech job offer.",
};

export default function TechOfferNegotiationGuidePage() {
    return (
        <main className="bg-background text-foreground">
            <div className="border-b border-border">
                <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-4 text-sm text-muted-foreground sm:px-8">
                    <Link href="/resources" className="transition-colors hover:text-foreground">Resources</Link>
                    <CaretRight aria-hidden className="size-3" weight="bold" />
                    <span className="text-foreground">Tech offer negotiation</span>
                </nav>
            </div>

            <article className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
                <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
                    <div>
                        <GuideEyebrow>Tech offers · 12 minute guide</GuideEyebrow>
                        <h1 className="mt-5 max-w-4xl font-display text-6xl riyp-weight-500 leading-none tracking-tight text-foreground riyp-stretch-88 sm:text-7xl lg:text-8xl">
                            The headline number is not the offer.
                            <span className="mt-2 block text-brand">Read year one. Then year four.</span>
                        </h1>
                    </div>
                    <div className="border-l-2 border-brand pl-5">
                        <p className="text-base leading-7 text-muted-foreground">Base is the easy line. Level, vesting, bonus rules, and equity mechanics decide what the package may actually pay.</p>
                        <Link href="/resources/offer-negotiation" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
                            Need the counter playbook? <ArrowRight aria-hidden className="size-4" weight="bold" />
                        </Link>
                    </div>
                </header>

                <div className="mt-14 grid border-y border-border sm:grid-cols-3">
                    {[
                        ["Verify level and location", "Confirm the band, work location, and whether the role’s scope matches the level on the offer."],
                        ["Build separate years", "Write out base, target bonus, guaranteed cash, and scheduled equity vesting for each year."],
                        ["Mark the maybes", "Do not count future refreshers, private-company liquidity, or future share prices as guaranteed pay."],
                    ].map(([title, body], index) => (
                        <div key={title} className="border-b border-border py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                            <div className="font-mono text-xs text-brand">0{index + 1}</div>
                            <h2 className="mt-3 font-display text-xl riyp-weight-560">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </div>

                <GuideSection number="01" title="Turn the package into honest numbers" intro="A polished total-comp figure can mix cash you will receive with money that depends on performance, vesting, liquidity, and future share value. Separate them before you compare anything." id="honest-numbers">
                    <TechOfferStack />
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <div className="border-t border-border pt-4"><h3 className="font-semibold">Year one</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Base paid during the first year, guaranteed sign-on cash after any repayment terms, expected bonus based on its actual rules, and equity scheduled to vest.</p></div>
                        <div className="border-t border-border pt-4"><h3 className="font-semibold">Steady state</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">What remains after a sign-on ends, how vesting changes, and whether any future grant or bonus is documented or merely customary.</p></div>
                    </div>
                </GuideSection>

                <GuideSection number="02" title="Equity is not salary wearing a hoodie" intro="Ask what the award is, what it costs to own, when it becomes yours, and whether there is any realistic path to liquidity. A grant can be valuable. It can also be worth nothing." id="equity">
                    <div className="space-y-1">
                        <Disclosure title="Restricted stock units (RSUs)" eyebrow="A promise to deliver shares" defaultOpen>
                            <p className="text-sm leading-6 text-muted-foreground">Confirm the number of units, the vesting schedule, what event delivers the shares, and what happens if you leave. At a public company, current share price can help model value, but future value is still unknown. At a private company, settlement and liquidity may depend on additional events.</p>
                        </Disclosure>
                        <Disclosure title="Stock options" eyebrow="The right to buy shares">
                            <p className="text-sm leading-6 text-muted-foreground">Ask for the option count, strike price, current common-share fair market value, vesting schedule, expiration date, post-termination exercise window, and liquidity restrictions. The option only has economic value if the share value eventually exceeds the strike price and you can sell.</p>
                        </Disclosure>
                        <Disclosure title="The questions that make a grant legible" eyebrow="Take these to the recruiter">
                            <Checklist items={[
                                <>What type of award is this, and how many units or options are included?</>,
                                <>What vests in each year, and is there a cliff or other trigger?</>,
                                <>For options, what are the strike price and latest common-share fair market value?</>,
                                <>Will the company share a fully diluted share count or ownership percentage?</>,
                                <>What is the exercise window after leaving, and can it change?</>,
                                <>How have employees historically obtained liquidity? Is any future event guaranteed?</>,
                            ]} />
                        </Disclosure>
                        <Disclosure title="Taxes need a real answer, not a blog shortcut" eyebrow="Award and timing matter">
                            <p className="text-sm leading-6 text-muted-foreground">Tax treatment differs across RSUs, incentive stock options, nonqualified stock options, location, timing, and individual circumstances. Use this guide to know what to ask, then confirm the consequences with a qualified tax professional before exercising or making an election.</p>
                        </Disclosure>
                    </div>
                </GuideSection>

                <GuideSection number="03" title="Level can be the quietest expensive line" intro="The right salary at the wrong level can affect scope, promotion timing, future bands, and equity. Make the role and the label agree." id="level">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                        <Checklist items={[
                            <>Ask for the formal level and the range attached to your work location.</>,
                            <>Compare the responsibilities discussed in interviews with the written role.</>,
                            <>Ask how performance is evaluated at that level and what the next level requires.</>,
                            <>Treat external leveling data as a clue, not a company promise.</>,
                        ]} />
                        <div>
                            <Script>I want to make sure the level matches the scope we discussed. The role includes [specific responsibility]. How did the team map that scope to [offered level], and what would distinguish the next level?</Script>
                            <WhatItGives>A concrete scope question instead of “I deserve a higher title.” The answer tells you whether the disagreement is about labeling, responsibilities, or the approved band.</WhatItGives>
                        </div>
                    </div>
                </GuideSection>

                <GuideSection number="04" title="Counter the part that changes the decision" intro="Once the package is legible, choose the one or two terms that matter most. Keep the math and the message separate." id="counter">
                    <div className="space-y-1">
                        <Disclosure title="The year-one gap" eyebrow="Sign-on, base, or vesting">
                            <Script>When I compare the offers year by year, this package is [X] lower in year one because [specific reason]. This role is my preference. Is there room to close that gap through [term]?</Script>
                            <WhatItGives>The actual comparison and the term you want reviewed. Do not imply another offer exists unless it does.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="The equity grant is hard to value" eyebrow="Ask before you counter">
                            <Script>Before I compare the equity, could you share the grant type, vesting schedule, and the information the company provides candidates to understand strike price or current share value?</Script>
                            <WhatItGives>A request for missing facts. You are not assigning private equity a value the company has not supported.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="The level does not match the scope" eyebrow="Make the mismatch visible">
                            <Script>Several responsibilities we discussed, including [specific responsibility], appear closer to [level] scope. Could the team revisit the level, or clarify which responsibilities would change at the offered level?</Script>
                            <WhatItGives>A decision the team can evaluate: move the level, or narrow the scope. Either answer teaches you something important.</WhatItGives>
                        </Disclosure>
                    </div>
                    <div className="mt-8 border-l-2 border-brand pl-5">
                        <p className="font-display text-2xl riyp-weight-520 leading-8">You do not need a chess face.</p>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">You need the whole offer in writing, the missing facts, and a number you can explain without squirming.</p>
                    </div>
                </GuideSection>

                <Sources>
                    <p>Equity terms vary by company and award. Carta’s explainers cover <a href="https://carta.com/learn/equity/stock-options/strike-price/">strike price</a>, option mechanics, and dilution. Company documents control the actual grant.</p>
                    <p>The IRS explains that stock-based compensation can be taxed differently depending on the award and event. See <a href="https://www.irs.gov/taxtopics/tc427">IRS Topic 427</a> and <a href="https://www.irs.gov/publications/p525">IRS Publication 525</a>. This guide is educational, not tax advice.</p>
                    <p>Negotiation research supports making a considered counter, not promising that every employer expects one or that every request succeeds. See the <a href="https://www.nber.org/papers/w33903">2025 NBER field experiment with US tech job seekers</a>.</p>
                </Sources>
            </article>
        </main>
    );
}
