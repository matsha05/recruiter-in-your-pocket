/** The instrument is an illustrative review, independent from an uploaded resume. */
export type ModeId = 'story' | 'impact' | 'fit';
export type Mode = ModeId | null;
export type StageId = 'paper' | 'read' | 'next';
export type Point = [
    number,
    number
];
export interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface PlaneRegion {
    width: number;
    height: number;
    corners: [
        Point,
        Point,
        Point,
        Point
    ];
}
export interface KeyRegion extends PlaneRegion {
    id: ModeId;
    label?: string;
}
export interface InstrumentGeometry {
    source: string;
    sourceWidth: number;
    sourceHeight: number;
    crop: Crop;
    cleanPlate: boolean;
    paper: PlaneRegion;
    keys: KeyRegion[];
    dial: {
        x: number;
        y: number;
        radiusX: number;
        radiusY: number;
        rotation: number;
        sourceNeedleAngle: number;
    };
}
export type ElementFactory = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) => HTMLElementTagNameMap[K];
export type Project = (element: HTMLElement, region: PlaneRegion, crop: Crop) => void;
export interface InstrumentView {
    title: string;
    body: string;
    compactTitle: string;
    compactBody: string;
    compactNote?: string;
}
export interface InstrumentMode {
    id: ModeId;
    label: string;
    eyebrow: string;
    question: string;
    sourceExcerpt: string;
    sourceLabel?: string;
    sourceContext: string;
    sourceFactIds: string[];
    integrityNote: string;
    jobRequirementVisible: boolean;
    accent: string;
    stages: Record<StageId, InstrumentView>;
}
export interface InstrumentContent {
    schemaVersion: number;
    concept?: string;
    headline?: string[];
    introduction?: string;
    sampleDisclosure?: string;
    sample: {
        role: string;
        context: string;
        shortContext: string;
        sourceFacts: {
            id: string;
            text: string;
        }[];
        jobRequirement: {
            label: string;
            text: string;
            provenance: string;
            shortText: string;
        };
        resume: {
            label: string;
            summaryHeading: string;
            summary: string;
            experienceHeading: string;
            role: string;
            industry: string;
            experience: string[];
            skillsHeading: string;
            skills: string;
            sourceFactsLabel: string;
            sourceFactsExplanation: string;
        };
    };
    modes: InstrumentMode[];
    controls: {
        modeGroupLabel: string;
        modePurpose: string;
        modeLabels: string[];
        stageGroupLabel: string;
        stagePurpose: string;
        stageLabels: string[];
        dialLabel: string;
        dialInstructions: string;
        sceneInstructions: string;
        originalLabel: string;
        annotationLabel: string;
        nextLabel: string;
        factsButton: string;
        closeFactsButton: string;
        factsHeading: string;
        primaryAction: string;
        privacyLine: string;
        sampleLabel: string;
        statusTemplate: string;
        keyboardHint: string;
        paperQuoteLabel: string;
    };
    behaviorNotes?: string[];
    browserQaAssertions?: {
        id: string;
        assertion: string;
        evidence: string;
    }[];
    defaults: {
        mode: Mode;
        stage: StageId;
    };
    stages: {
        id: StageId;
        label: string;
    }[];
    home: {
        revision: string;
        eyebrow: string;
        title: string;
        body: string;
        options: {
            label: string;
            body: string;
        }[];
        instruction: string;
        sourceExcerpt?: string;
        observation?: string;
    };
}
export interface InstrumentState {
    mode?: Mode;
    stage?: StageId;
    powered?: boolean;
}
export interface CreateInstrumentOptions {
    container: HTMLElement;
    content: InstrumentContent;
    onMode?: (mode: ModeId) => void;
    onStage?: (stage: StageId) => void;
    onPowerChange?: (powered: boolean) => void;
    onReady?: () => void;
    geometry?: InstrumentGeometry;
    /** Permanent, already-rendered React plate. The runtime overlays controls and reuses its pixels. */
    sourceImage?: HTMLImageElement;
    /** Cancels image loading and disposes any completed instance. */
    signal?: AbortSignal;
    /** A resolved CSS font family, suitable for CanvasRenderingContext2D.font. */
    fontFamily?: string;
}
