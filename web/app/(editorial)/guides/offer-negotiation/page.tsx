import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { GuideOpening } from "@/components/guides/GuideOpening";
import styles from "@/components/guides/GuidePresentation";
import { NegotiationOutcomeDiagram } from "@/components/guides/NegotiationOutcomeDiagram";
import {
    Checklist,
    Disclosure,
    GuideSection,
    HandoffDiagram,
    Script,
    Sources,
    WhatItGives,
} from "@/components/guides/OfferGuidePrimitives";

export const metadata: Metadata = {
    title: "How to negotiate a job offer",
    description: "How to handle the salary question, the offer call, your number, the counter, and the close, with the research behind each step.",
    alternates: { canonical: "/resources/offer-negotiation" },
};

const quickStart = [
    ["Say less on the offer call", "Thank them, ask your questions, and take a few days. You don't have to react to the number on the spot."],
    ["Pick one number", "A total you would sign at, grounded in the level and the range. Hold that total and stay flexible on the mix."],
    ["Ask live, confirm in writing", "Make the counter on a call, where tone carries. Then send a short email that sums up what you discussed."],
] as const;

export default function OfferNegotiationGuidePage() {
    return (
        <>
        <div className="bg-background text-foreground selection:bg-brand/15">
            <div className="border-b border-border">
                <nav aria-label="Breadcrumb" className="mx-auto box-content flex max-w-column flex-wrap items-center gap-2 px-[var(--marketing-gutter)] py-4 text-sm text-muted-foreground">
                    <Link href="/resources" className="focus-ring inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-foreground">After the offer</Link>
                    <CaretRight aria-hidden className="size-3" weight="bold" />
                    <span className="text-foreground">Offer negotiation</span>
                </nav>
            </div>

            <article className="mx-auto box-content max-w-column px-[var(--marketing-gutter)] pb-24 pt-28 sm:pt-36">
                <GuideOpening
                    eyebrow="Offer negotiation · a twelve-minute guide"
                    title={<>Most offers have some room. Here&apos;s how to find it.</>}
                    take={<>Our take, from the recruiter&apos;s side of the table: there&apos;s usually some room, and recruiters expect a good candidate to ask. Most people don&apos;t. The skill is asking in a way the recruiter can take to whoever approves the offer.</>}
                    quick={quickStart}
                    link={{ href: "/resources/tech-offer-negotiation", label: "Offer includes equity? Read the tech guide" }}
                />

                <GuideSection number="01" title="By the offer, everyone wants this to close" intro="The company has spent weeks finding you and has often passed on other candidates to get here. The recruiter is measured on filling the seat. The hiring manager wants the work started. In our experience, a reasonable, specific ask gives them something to say yes to. It isn't risk-free: some offers are firm, and how you ask matters." id="why">
                    <NegotiationOutcomeDiagram />
                    <p className={`${styles.readingCopy} mt-8`}>Plenty of people never ask. In a field experiment with real job ads, 9.4% of applicants negotiated pay when the ad didn&apos;t mention it, and 23.1% when the ad said pay was negotiable. In a 2025 experiment with US tech job seekers, 54% negotiated on their own, and a short note encouraging them raised that to 61%. The share who got better pay rose from 30% to 36%. In an older study of MBA graduates from one school, men who bargained ended up about 4% higher and women about 3%.</p>
                    <p className={`${styles.readingCopy} mt-4`}><strong className="text-foreground">Our take:</strong> even when the first answer is that the number is fixed, the room is often somewhere else: base, sign-on, equity, level, or start date. Your job is to find which one.</p>
                </GuideSection>

                <GuideSection number="02" title="Before the offer, let them name the range" intro="Early in the process you'll be asked what you're looking for. Answering with a number before you know the level and scope usually caps you. Ask for the range first. Many states and cities now require employers to share one." id="before">
                    <div className="space-y-1">
                        <Disclosure title="They ask what you're looking for" eyebrow="The recruiter screen" defaultOpen>
                            <Script>I&apos;d like to learn more about the scope and level before I put a number on it. Could you share the range you have for this role?</Script>
                            <WhatItGives>You have expectations, and you want the role defined before you price it. In our experience, most recruiters will share the range when asked directly.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="They insist on a number" eyebrow="Give a range you'd be glad to hit">
                            <Script>Based on what I know so far and what similar roles pay, I&apos;m thinking somewhere in the range of [your target] to [a bit higher]. I&apos;d want to revisit once we&apos;ve talked about the level.</Script>
                            <WhatItGives>A researched range whose bottom is a number you&apos;d be happy with. Never put your walk-away number at the bottom. In experiments, a range that started at the asker&apos;s target and reached higher won better terms than the target alone, without making the other side like them less.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="They ask what you make now" eyebrow="Price the new role">
                            <Script>I&apos;d rather focus on what this role is worth. What range has the team set for it?</Script>
                            <WhatItGives>A redirect to the job in front of you. Many US states and cities restrict salary-history questions, and the rules differ by location, so check yours. <Link href="/research/salary-history-bans" className="riyp-link">What the salary-history studies found</Link>.</WhatItGives>
                        </Disclosure>
                    </div>
                </GuideSection>

                <GuideSection number="03" title="On the offer call, thank them and ask questions" intro="When the recruiter calls with numbers, this isn't the negotiation yet. It's the fact-finding. Be warm about the role, hold back on reacting to the number, and leave with everything you need to decide." id="offer-call">
                    <Script>Thank you, I&apos;m really excited about this team. I&apos;d like a couple of days to look at the whole package. Could I ask a few questions so I have the full picture?</Script>
                    <div className="mt-8">
                        <Checklist items={[
                            <>What level is this, and what separates it from the next level up?</>,
                            <>What&apos;s the range for this level in my location?</>,
                            <>How is the bonus set, and what has it paid out in practice?</>,
                            <>For equity: what type, how much, how it vests, and what the stated value is based on.</>,
                            <>Is there a sign-on bonus, and does it have to be repaid if I leave early?</>,
                            <>When do you need an answer, and can I have the offer in writing?</>,
                        ]} />
                    </div>
                </GuideSection>

                <GuideSection number="04" title="Pick your number" intro="Before you counter, decide the one total you'd sign at. Everything else in the conversation is about how to get there." id="number">
                    <div className="divide-y divide-border border-y border-border">
                        {[
                            ["Check the level first", "Level sets the range, so it's the biggest lever. If the scope you discussed sounds like the next level up, raise that before you talk about money. The tech guide has the words."],
                            ["Aim for the top half of the range", "If your experience fits the role well, the upper half of the range is a fair target. Price this role, not your current one."],
                            ["Think in total pay", "Add up base, bonus, sign-on, and equity per year. Decide the total you need, then stay flexible on the mix."],
                            ["Make it specific", "Ask for $143,500, not \"around $140k.\" In negotiation experiments over prices, people who got a precise first offer countered closer to it than people who got a round one."],
                            ["Only ask for what you'd sign at", "If they meet your number, you should be ready to say yes. If you still have doubts about the job, sort those out first."],
                        ].map(([title, body], index) => (
                            <div key={title} className="grid gap-2 py-6 md:grid-cols-[2rem_13rem_minmax(0,1fr)] md:gap-5">
                                <span className={`${styles.label} tabular-nums text-muted-foreground`}>{index + 1}</span>
                                <h3 className="font-semibold text-foreground">{title}</h3>
                                <p className={styles.readingCopy}>{body}</p>
                            </div>
                        ))}
                    </div>
                </GuideSection>

                <GuideSection number="05" title="Make the ask" intro="The recruiter usually can't approve the change. They take it to a manager or a compensation team. Give them three things to carry: what you want, why, and what happens if they get there." id="ask">
                    <HandoffDiagram />
                    <p className={`${styles.readingCopy} mt-8`}>Ask on a call if you can. Start with genuine enthusiasm, name the number once, and keep it collaborative: you&apos;re working the problem together. How you ask matters. In experiments, evaluators were less willing to work with candidates who asked for more, and the penalty was usually larger for women. <strong className="text-foreground">Our advice:</strong> tie a specific number to the role and treat the gap as a shared problem. It&apos;s the easiest kind of request for a recruiter to champion.</p>
                    <div className="mt-8 space-y-1">
                        <Disclosure title="The offer is below your number" eyebrow="The counter" defaultOpen>
                            <Script>I&apos;m excited about this and I want to make it work. Given the scope we discussed and the range for the level, I was looking for a total closer to [$X]. If we can get there, I&apos;m ready to sign.</Script>
                            <WhatItGives>The number, the basis, and the decision. Say the last part only if it&apos;s true.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="Base salary can't move" eyebrow="Move the mix, hold the total">
                            <Script>I understand. Is there flexibility elsewhere? A sign-on bonus, more equity, or an earlier compensation review would get us to the same place.</Script>
                            <WhatItGives>A path to your total through parts that come out of a different budget. Check repayment terms before counting a sign-on bonus as cash.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="You have another offer" eyebrow="Only what's true">
                            <Script>I want to be upfront: I have another written offer, and I need to respond by [date]. This team is my first choice. If we can get to [$X], I&apos;ll sign this week.</Script>
                            <WhatItGives>Real leverage. In our experience, a competing offer is the most reliable way to move a number, so it&apos;s worth finishing other processes. Never invent one.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="The deadline is too short" eyebrow="Ask for a date">
                            <Script>I&apos;m taking this seriously and want to give you a real answer. Could I get back to you by Friday? If that&apos;s a problem, can you tell me what&apos;s driving the timing?</Script>
                            <WhatItGives>A specific date, and a chance to learn whether the deadline is a real constraint.</WhatItGives>
                        </Disclosure>
                        <Disclosure title="The answer is no" eyebrow="Decide, don't drift">
                            <Script>Thanks for checking. Let me think it over and get back to you by [day].</Script>
                            <WhatItGives>Time to decide whether the package works as it is. You don&apos;t owe anyone a second counter.</WhatItGives>
                        </Disclosure>
                    </div>
                </GuideSection>

                <GuideSection number="06" title="Close it in writing" intro="After the call, send a short note that sums up where you landed. It keeps the recruiter's version and yours the same when they go for approval." id="close">
                    <Script label="What you can send">Thanks for the time today. To recap: you&apos;re going to check on [the change] to get the total to [$X]. If that works, I&apos;m ready to sign. Looking forward to hearing back.</Script>
                    <div className="mt-8">
                        <Checklist items={[
                            <>Check that every agreed change is in the written offer before you sign.</>,
                            <>List base and one-time payments separately from target or discretionary pay.</>,
                            <>Read sign-on repayment terms and any conditions attached to the offer.</>,
                            <>Confirm title, level, location, schedule, start date, and review timing.</>,
                            <>Compare benefits by what they&apos;re worth to you, not by a headline total.</>,
                            <>Once you sign, close the loop with any other companies kindly. You may want to work with them later.</>,
                        ]} />
                    </div>
                </GuideSection>

                <Sources>
                    <p>Who asked, and what happened: <a href="https://www.pewresearch.org/short-reads/2023/04/05/when-negotiating-starting-salaries-most-us-women-and-men-dont-ask-for-higher-pay/">Pew Research Center (2023)</a>, a February 2023 survey of 5,188 employed US adults who aren&apos;t self-employed, about the last time they were hired. Encouragement to negotiate: Cullen, Pakzad-Hurson &amp; Perez-Truglia, <a href="https://www.nber.org/papers/w33903">&ldquo;Pushing the Envelope&rdquo;</a>, NBER Working Paper 33903 (2025), a field experiment run with levels.fyi.</p>
                    <p>Negotiating when pay is stated as negotiable: Leibbrandt &amp; List, <a href="https://doi.org/10.1287/mnsc.2014.1994">&ldquo;Do Women Avoid Salary Negotiations?&rdquo;</a>, Management Science (2015), a field experiment with administrative-assistant ads in nine US cities. The rates above are from the <a href="https://www.nber.org/papers/w18511">2012 working paper</a>. MBA bargaining: Gerhart &amp; Rynes, <a href="https://doi.org/10.1037/0021-9010.76.2.256">Journal of Applied Psychology (1991)</a>, 205 graduates of one business school in 1987–89, from a placement-office survey. The 4% and 3% are from the authors&apos; 1990 working paper.</p>
                    <p>Precise numbers: Mason, Lee, Wiley &amp; Ames, <a href="https://doi.org/10.1016/j.jesp.2013.02.012">&ldquo;Precise offers are potent anchors&rdquo;</a> (2013), tested in price negotiations, not salaries. Ranges: Ames &amp; Mason, <a href="https://doi.org/10.1037/pspi0000016">&ldquo;Tandem anchoring&rdquo;</a> (2015), including a hypothetical salary scenario. Cost of asking: Bowles, Babcock &amp; Lai, <a href="https://doi.org/10.1016/j.obhdp.2006.09.001">OBHDP (2007)</a>, evaluations of written and video candidates, not real hiring decisions.</p>
                    <p>Salary-history and pay-range rules differ by location. Examples: <a href="https://www.dir.ca.gov/dlse/California_Equal_Pay_Act.htm">California DIR</a>, <a href="https://www.nyc.gov/site/cchr/law/salary-history-law.page">NYC Commission on Human Rights</a>, and <a href="https://www.mass.gov/info-details/massachusetts-law-about-hiring-employees">Massachusetts hiring law</a>. For offer timelines, see the <a href="https://www.naceweb.org/docs/default-source/default-document-library/2024/resources/2024-nace-professional-standards-for-university-relations-and-recruiting-nov-2024.pdf">NACE Professional Standards</a>.</p>
                </Sources>
            </article>
        </div>
            <Footer />
        </>
    );
}
