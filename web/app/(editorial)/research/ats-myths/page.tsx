import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import Link from "next/link";
import { comparison } from "@/components/compare/comparisons";
import { ATSFunnel } from "@/components/research/diagrams/ATSFunnel";

const PATH = "/research/ats-myths";

export const metadata = pageMetadata({
    path: PATH,
    title: "Is an ATS rejecting my resume before anyone reads it?",
    description: "What Greenhouse and Lever documentation says about resume parsing: the fields it extracts, the formatting that can get lost, and what it doesn't prove.",
    type: "article",
});

export default function ATSMythsPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Not with one magic score. The software pulls your text into fields, and if it can&rsquo;t, the file stays attached and someone enters the details by hand.
                    Automatic rejection does exist, but in Greenhouse and Lever&rsquo;s documentation it runs on your answers to application questions, not on your resume&rsquo;s formatting.
                </>
            }
            answerSource={{
                text: <>From Greenhouse and Lever&rsquo;s own documentation on resume parsing.</>,
                href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse",
                linkLabel: "Read the documentation",
            }}
            painNote="The robot story is popular because silence needs a villain."
            nextQuestions={["human-vs-algorithm", "automation-and-bias", "how-recruiters-read"]}
            visualization={
                <>
                    <h2 className="research-h2">From a file to a recruiter record</h2>
                    <p className="research-body mb-6">
                        The parser reads the file, extracts information such as contact details and work history, and places it into structured fields. Employer rules, searches, filters, and human review happen after that and vary by system and company.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <ATSFunnel />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Unsuccessful resume parse",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse"
                },
                {
                    id: "source-2",
                    title: "Understanding Resume Parsing",
                    publisher: "Lever Help Center",
                    year: "2026",
                    href: "https://help.lever.co/s/article/Understanding-Resume-Parsing"
                },
                {
                    id: "source-3",
                    title: "Employment Tests and Selection Procedures",
                    publisher: "EEOC",
                    year: "2007",
                    href: "https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures"
                },
                {
                    id: "source-4",
                    title: "Candidate and prospect filters",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/360043184152-Candidate-and-prospect-filters"
                },
                {
                    id: "source-5",
                    title: "Auto-reject",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/360000653472-Auto-reject"
                },
                {
                    id: "source-6",
                    title: "Operating the Archive",
                    publisher: "Lever Help Center",
                    year: "2026",
                    href: "https://help.lever.co/s/article/Operating-the-Archive"
                }
            ]}
        >
            <h2 className="research-h2">What the parser actually does</h2>
            <p className="research-body mb-6">
                Current Greenhouse and Lever documentation describes parsers that extract readable information from a resume and populate candidate fields such as contact information and work history.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Stored-data filters"
                    desc={
                        <>
                            Recruiters can filter stored applications by fields such as status, source, education, and custom application data. That is separate from whether the resume text parsed correctly.
                            <Citation id="source-4">4</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Search and discovery"
                    desc={
                        <>
                            Once information is stored, recruiters may search, filter, and review it according to the employer&apos;s workflow.
                            <Citation id="source-4">4</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">What can actually break</h2>
            <p className="research-body">
                Greenhouse lists image-based resumes, graphics, word art, complex tables, headers, footers, text boxes, and columned layouts among formatting patterns that can produce unsuccessful or partial parsing. Lever notes that image files are not parseable and recommends checking whether the document text can be highlighted.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                {" "}A failed parse doesn&apos;t make the resume disappear. Greenhouse attaches the file to the candidate and asks the recruiter to enter the details by hand, and Lever describes the same fix.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">Parsing is not the whole selection process</h2>
            <p className="research-body mb-6">
                ATS products can also expose search and filter tools, and employer workflows differ by configuration. Automatic rejection does exist, but in Greenhouse and Lever&apos;s documentation it runs on answers to application questions, often called knockout questions, not on resume formatting.
                <Citation id="source-4">4</Citation>
                <Citation id="source-5">5</Citation>
                <Citation id="source-6">6</Citation>
                {" "}Both let employers reject or archive applicants automatically on an answer like &ldquo;Do you have a commercial driver&apos;s license?&rdquo; The parser itself is only the extraction step.
                <Citation id="source-5">5</Citation>
                <Citation id="source-6">6</Citation>
                {" "}Where software does screen people out, it is mostly elsewhere: <ResearchLink to="automation-and-bias">which job ads you see, whether you&rsquo;re eligible, and how you reach a person</ResearchLink>. And once the file is in front of a person, the question is the reader, who isn&rsquo;t immune to software either: in one experiment, <ResearchLink to="human-vs-algorithm">an algorithm&rsquo;s recommendation swayed recruiters who said they trusted it less than a person</ResearchLink>.
                {" "}EEOC guidance on employment tests and selection procedures, issued in 2007 and not specific to software, says a screen that disproportionately excludes people by race, sex, or another protected trait has to be job-related and consistent with business necessity.
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="research-h2">Practical takeaways</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Use standard section headers so both parsers and humans can navigate quickly.</li>
                <li>Write role titles and core skills in plain language, not internal jargon.</li>
                <li>Avoid graphics or tables that disrupt parsing and readability.</li>
                <li>A single column with clear headings, consistent dates, and standard section names is the safest baseline.</li>
                <li>Use the role&apos;s language where it truthfully describes your experience. Don&apos;t stuff hidden or repeated keyword blocks into the file. A scanner&apos;s match rate is <Link href={comparison("jobscan").path} className="focus-ring riyp-link">the vendor&apos;s own model of an ATS, not the employer&apos;s</Link>.</li>
            </ul>

            <ArticleBridge question="What does a person see once they open it?">
                Your report is a recruiter&apos;s read of the page, not an ATS score. It works from the text we pull from your file, so it can&apos;t tell you how a particular employer&apos;s software or filters will treat it.
            </ArticleBridge>
        </AnswerArticle>
    );
}
