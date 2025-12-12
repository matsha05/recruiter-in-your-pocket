/**
 * Research Library - Study JSON Types
 * 
 * These types match the schema defined in .agent/workflows/add-research-study.md
 * Used for JSON-driven research page generation.
 */

export interface StudySource {
    id: number;
    name: string;
    url: string;
    date: string;
    notes?: "primary" | "supporting";
}

export interface StudyFigure {
    id: string;
    title: string;
    caption: string;
    /** Component name to render (e.g., "ResumeScanZones", "ScanPatternOverlay") */
    component: string;
}

export interface StudyInsight {
    /** Typographic marker: "01", "F-PATTERN", etc. NO icons/emoji */
    marker?: string;
    /** Index for auto-numbering if no marker provided */
    index?: number;
    title: string;
    explanation: string;
    riypImplication: string;
    impacts?: string[];
}

export interface StudyExample {
    do: string[];
    dont: string[];
}

export interface RiypChange {
    feature: string;
    why: string;
}

export interface StudySnapshot {
    whatItStudied: string;
    method: string[];
    sample: string;
    keyFinding: string;
    /** Must follow Headline Style Guide - no metaphors, slogans, or branded phrases */
    keyStat: string;
    soWhatForResumes: string;
}

export interface Footnote {
    id: number;
    title: string;
    author: string;
    year: number | string;
    evidence: string;
    sourceUrl: string;
    /** Position in content where footnote appears (section ID + approximate location) */
    position?: string;
}

export interface StudyData {
    slug: string;
    category: string[];
    title: string;
    subtitle: string;
    year: number | string;
    authors?: string[];

    primarySource?: {
        link: string;
        type: "journal-article" | "report" | "web-article" | "practitioner-analysis";
    };

    studySnapshot: StudySnapshot;
    figures: StudyFigure[];
    keyInsights: StudyInsight[];
    examples?: StudyExample;
    riypChanges: RiypChange[];
    sources: StudySource[];
    footnotes?: Footnote[];
    limitations: string[];
    lastUpdated: string;

    /** Additional narrative sections as markdown */
    narrativeSections?: {
        id: string;
        title: string;
        content: string;
    }[];
}

/**
 * Library card data for the main research index page
 */
export interface StudyCard {
    id: string;
    number: string;
    category: string;
    title: string;
    thesis: string;
    methods: string[];
    readTime: string;
    tags: string[];
    href: string;
    productTie: string;
}
