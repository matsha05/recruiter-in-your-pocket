import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/dist/ssr";
import {
    Checklist,
    Disclosure,
    GuideEyebrow,
    GuideSection,
    HandoffDiagram,
    Script,
    Sources,
    WhatItGives,
} from "@/components/guides/OfferGuidePrimitives";

export const metadata: Metadata = {
    title: "How to Negotiate a Job Offer",
    description: "A recruiter-grounded guide to reading a job offer, choosing a counter, and making a request that can survive the approval chain.",
};

const quickStart = [
    ["Read the whole offer", "Put compensation, schedule, benefits, start date, deadline, and written conditions in one place."],
    ["Choose the ask", "Pick the change that would genuinely affect your decision. Do not send a shopping list."],
    ["Make it easy to carry", "Give the recruiter the term, your basis, and an honest description of what happens if it moves."],
];

export default function OfferNegotiationGuidePage() {
    return (
        <main className="bg-background text-foreground">
            <div className="border-b border-border">
                <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-4 text-sm text-muted-foreground sm:px-8">
                    <Link href="/resources" className="transition-colors hover:text-foreground">Resources</Link>
                    <CaretRight aria-hidden className="size-3" weight="bold" />
                    <span className="text-foreground">Offer negotiation</span>
                </nav>
            </div>

            <article className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
                <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
                    <div>
                        <GuideEyebrow>Offer negotiation · 10 minute guide</GuideEyebrow>
                        <h1 className="mt-5 max-w-4xl font-display text-6xl riyp-weight-500 leading-none tracking-tight text-foreground riyp-stretch-88 sm:text-7xl lg:text-8xl">
                            An offer is not one number.
                            <span className="mt-2 block text-brand">Find the part that can move.</span>
                        </h1>
                    </div>
                    <div className="border-l-2 border-brand pl-5">
                        <p className="text-base leading-7 text-muted-foreground">Get every term in one place. Decide what would genuinely change your answer. Then make one clear request a recruiter can carry back.</p>
                        <Link href="/resources/tech-offer-negotiation" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
                            Reading a tech offer? <ArrowRight aria-hidden className="size-4" weight="bold" />
                        </Link>
                    </div>
                </header>

                <div className="mt-14 grid border-y border-border sm:grid-cols-3">
                    {quickStart.map(([title, body], index) => (
                        <div key={title} className="border-b border-border py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                            <div className="font-mono text-xs text-brand">0{index + 1}</div>
                            <h2 className="mt-3 font-display text-xl riyp-weight-560">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </div>

                <GuideSection number="01" title="Your counter has to survive a handoff." intro="The person delivering the offer may not be the person who can change it. Give them a request they can repeat accurately in the next conversation." id="handoff">
                    <HandoffDiagram />
                    <div className="mt-6 grid gap-5 border-l border-border pl-5 sm:grid-cols-3 sm:border-l-0 sm:pl-0">
                        <p className="text-sm leading-6 text-muted-foreground"><strong className="block text-foreground">The ask</strong>“I’m looking for $115,000 in base.”</p>
                        <p className="text-sm leading-6 text-muted-foreground"><strong className="block text-foreground">The basis</strong>“That is within the posted range and reflects the scope we discussed.”</p>
                        <p className="text-sm leading-6 text-muted-foreground"><strong className="block text-foreground">The decision</strong>“If we can get there, I’m ready to sign.” Use this only when it is true.</p>
                    </div>
                </GuideSection>

                <GuideSection number="02" title="Before you counter" intro="There is no magic script that works for every employer. There is a good order of operations." id="before-you-counter">
                    <div className="divide-y divide-border border-y border-border">
                        {[
                            ["Get the complete offer in writing", "Ask for every compensation component, condition, deadline, and policy that affects the decision."],
                            ["Price this role, not your old one", "You do not need to volunteer past pay. Salary-history rules vary by location, so redirect to the role’s approved range and scope."],
                            ["Take the time you actually need", "Ask for a specific response date. If the deadline is short, ask what is fixed on their side before deciding what it means."],
                            ["Separate needs from preferences", "Know which change would alter your decision and which items would merely make the offer nicer."],
                            ["Counter clearly", "A specific request with a defensible basis is easier to understand and move through an approval chain."],
                        ].map(([title, body], index) => (
                            <div key={title} className="grid gap-2 py-5 sm:grid-cols-[2rem_15rem_1fr] sm:gap-5">
                                <span className="font-mono text-xs text-brand">{index + 1}</span>
                                <h3 className="font-semibold text-foreground">{title}</h3>
                                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
                            </div>
                        ))}
                    </div>
                </GuideSection>

                <GuideSection number="03" title="Build a counter someone can approve" intro="The recruiter does not need a performance. They need a clear request, a reason, and the truth about your decision." id="scripts">
                    <div className="space-y-1">
                        <Disclosure title="They ask for salary expectations first" eyebrow="Before the offer" defaultOpen>
                            <Script>I’d rather price this role from its scope and level. What range has the team approved?</Script>
                            <WhatItGives>A direct request for the range without pretending you have no expectations. If they cannot share it, offer a researched range of your own.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="The offer is below your target" eyebrow="A clear counter">
                            <Script>I’m excited about the role. Based on the posted range, the scope we discussed, and my experience with [specific responsibility], I was expecting a base closer to [X]. Is there room to revisit that?</Script>
                            <WhatItGives>The size of the gap and the evidence behind your target. It leaves the recruiter a clean question to take back.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="Base cannot move" eyebrow="Change the lever">
                            <Script>Thanks for checking. Which parts of the package have more flexibility? A sign-on bonus, start date, schedule, or an earlier compensation review could change the decision for me.</Script>
                            <WhatItGives>A short list of meaningful alternatives. Ask about repayment terms before counting a sign-on bonus as guaranteed cash.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="The deadline is too short" eyebrow="Ask for a date">
                            <Script>I’m taking the offer seriously and want to review the complete package. Could I give you a final answer by Friday? If that timing creates a problem, can you tell me what is fixed on your side?</Script>
                            <WhatItGives>A specific date and a chance to understand whether the deadline reflects a real constraint.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="You have another offer" eyebrow="Use only what is true">
                            <Script>I want to be transparent that I have another written offer and need to respond by [date]. This role is my preference. If there is room to bring [term] to [X], I would be ready to [honest next step].</Script>
                            <WhatItGives>A real deadline, the term that matters, and an honest close condition. Never invent an offer or promise to sign unless you mean it.</WhatItGives>
                        </Disclosure>
                    </div>
                </GuideSection>

                <GuideSection number="04" title="Read the answer, not just the number" intro="A good outcome is not always a higher base. It is a package you understand and a decision you can stand behind." id="decision">
                    <Checklist items={[
                        <>Separate guaranteed year-one cash from target or discretionary pay.</>,
                        <>Read sign-on repayment terms and any conditions attached to the offer.</>,
                        <>Confirm schedule, location, start date, title, level, and review timing in writing.</>,
                        <>Compare benefits that matter to you by their actual cost and coverage, not by a headline total.</>,
                        <>If the answer is no, decide whether the unchanged package still works. You do not owe anyone a second counter.</>,
                        <>If the answer is yes, make sure the revised terms appear in the written offer before you sign.</>,
                    ]} />
                </GuideSection>

                <Sources>
                    <p>Negotiating can improve an offer, but it is neither universal nor guaranteed. Pew found that most US workers in its survey did not ask for more, while many who did received some improvement. See <a href="https://www.pewresearch.org/short-reads/2023/04/05/when-negotiating-starting-salaries-most-us-women-and-men-dont-ask-for-higher-pay/">Pew Research Center</a>.</p>
                    <p>Salary-history restrictions differ by jurisdiction and by where the job and applicant are located. Check the applicable rule. Examples: <a href="https://www.dir.ca.gov/dlse/California_Equal_Pay_Act.htm">California DIR</a>, <a href="https://www.nyc.gov/site/cchr/law/salary-history-law.page">NYC Commission on Human Rights</a>, and <a href="https://www.mass.gov/info-details/massachusetts-law-about-hiring-employees">Massachusetts hiring law</a>.</p>
                    <p>NACE recommends written offers with material compensation terms and a clear deadline, plus a reasonable amount of time to decide. The appropriate timeline varies by role and employer. See <a href="https://www.naceweb.org/docs/default-source/default-document-library/2024/resources/2024-nace-professional-standards-for-university-relations-and-recruiting-nov-2024.pdf">NACE Professional Standards</a>.</p>
                </Sources>
            </article>
        </main>
    );
}
