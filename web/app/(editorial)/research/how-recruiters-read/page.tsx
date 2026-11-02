import { pageMetadata } from "@/lib/seo/metadata";
import { AdviceList, AnswerArticle, ArticleBridge, EvidenceList } from "@/components/research/AnswerArticle";
import { SectionFindingsFigure } from "@/components/research/diagrams/SectionFindingsFigure";

const PATH = "/research/how-recruiters-read";
const PINA = "https://doi.org/10.3390/make5030038";

export const metadata = pageMetadata({
    path: PATH,
    title: "Do recruiters only spend six seconds on a resume?",
    description: "What peer-reviewed eye-tracking studies found about where recruiters look on a resume, and why the six-second figure isn't a rule.",
    type: "article",
});

export default function HowRecruitersReadPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    No study shows a fixed timer. The six-second figure comes from a job site&rsquo;s 2012 report on its own product, which watched 30 recruiters.
                    In the strongest eye-tracking study since, recruiters who spent longer on a resume&rsquo;s Experience section were more likely to move it forward.
                </>
            }
            answerSource={{
                text: <>From a peer-reviewed study of 2,043 resume reviews by recruiters in one US state (Pina et al., 2023).</>,
                href: PINA,
            }}
            painNote="Six seconds is the kind of number that sticks when nobody writes back."
            visualization={<SectionFindingsFigure figureNumber={1} />}
            sources={[
                {
                    id: "source-1",
                    title: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume",
                    publisher: "Machine Learning and Knowledge Extraction",
                    year: "2023",
                    href: PINA,
                },
                {
                    id: "source-2",
                    title: "The Importance of Representative Design in Judgment Tasks: The Case of Resume Screening",
                    publisher: "Journal of Occupational and Organizational Psychology",
                    year: "2002",
                    href: "https://doi.org/10.1348/09631790260098749",
                },
                {
                    id: "source-3",
                    title: "Eye-Tracking Study",
                    publisher: "TheLadders",
                    year: "2012",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf",
                },
            ]}
            nextQuestions={["resume-length-myths", "spelling-errors-impact", "how-we-score"]}
        >
            <h2 className="research-h2">What this means for your resume</h2>
            <AdviceList
                items={[
                    {
                        lead: "Put your recent, relevant experience where it’s easy to find.",
                        body: <>That&rsquo;s the section where longer looks went with moving a resume forward (<a href="#pina-2023" className="focus-ring riyp-link-quiet">Pina et al., 2023</a>).</>,
                    },
                    {
                        lead: "Explain your part in the work.",
                        body: "Give each role what a reader needs to judge it: the work, your part, the team and the scale, and the result when you can verify it.",
                    },
                    {
                        lead: "Use titles, headings, and dates a reader recognizes.",
                        body: "Say what kind of work you do in plain role language, not an internal title or a broad slogan. Familiar headings, visible dates, and a predictable order let a reader find your roles without hunting for them.",
                    },
                ]}
                notSupported={{
                    title: "What the studies don’t support",
                    body: "Writing for one reading speed, one scan path, or one layout. They don’t show that every resume is read in an F-pattern, that one layout works best for every role, or that two columns always fail.",
                }}
            />

            <ArticleBridge question="What does your Experience section say first?">
                Your report opens with a Verdict: a plain-words summary of what your resume says first. If your role, scope, or results are unclear in a way that could cost you the interview, a Critical Miss says so, starting with the one to fix first. It can&rsquo;t tell you how long anyone will look.
            </ArticleBridge>

            <h2 className="research-h2">What the evidence says</h2>
            <EvidenceList
                entries={[
                    {
                        id: "pina-2023",
                        name: "Pina et al., 2023",
                        kind: "Peer-reviewed eye-tracking study",
                        href: PINA,
                        linkLabel: "Read the study",
                        found: "Total review time and time spent on Experience were associated with moving a resume to the next stage. Education mattered to a lesser extent. There was no comparable result for Skills, Projects, Introduction, or Address. The researchers didn’t identify one required reading time or one scan path.",
                        method: "221 people who hired computer science graduates, recruited at career fairs and businesses in one southwestern US state. Each decided whether to move resumes forward in a simulated screen, with no time limit and no specific job named. After 24 participants with incomplete data were removed, the paper analyzed 2,043 reviews.",
                        limit: "Whether the extra time caused the decision. A recruiter may spend longer because the resume is relevant, because it’s difficult, or because they’re weighing a decision. It’s also one state, one field’s graduates, and a simulated screen.",
                    },
                    {
                        id: "theladders-2012",
                        name: "TheLadders, 2012",
                        kind: "A job site’s eye-tracking report about its own product",
                        href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf",
                        linkLabel: "Read the report (PDF)",
                        found: "It watched 30 recruiters and popularized an average first screen of roughly six seconds.",
                        limit: "How long recruiters in general spend. It’s useful as category history, not as a timer for every recruiter, role, or hiring process.",
                    },
                    {
                        id: "fritzsche-brannick-2002",
                        name: "Fritzsche & Brannick, 2002",
                        kind: "Peer-reviewed judgment study. We read only its abstract.",
                        href: "https://doi.org/10.1348/09631790260098749",
                        linkLabel: "Read the abstract",
                        found: "Forty recruiters judged 60 actual resumes or matching resume profiles. Their ratings, and the cues they used, differed between the two formats.",
                        limit: "How to write or lay out a resume. It’s a lesson about how to study screening: simplified profiles aren’t a stand-in for real resumes.",
                    },
                ]}
            />
        </AnswerArticle>
    );
}
