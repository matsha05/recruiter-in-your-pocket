"use client";

import Image from "next/image";
import { useEffect, useId, useReducer, useRef, useState } from "react";
import sample from "./content.json";
import type { InstrumentContent, Mode, StageId } from "./runtime/types";
import { createInstrument, type InstrumentHandle } from "./runtime/reference-instrument";
import styles from "./PocketInstrument.module.css";

const content = sample as InstrumentContent;
type State = { mode: Mode; stage: StageId; powered: boolean };
type Action = { type: "mode"; value: Mode } | { type: "stage"; value: StageId } | { type: "power"; value: boolean };
const initialState: State = { mode: null, stage: "read", powered: true };

function transition(state: State, action: Action): State {
    if (action.type === "power") return { ...state, powered: action.value };
    if (action.type === "stage") return state.mode === null ? state : { ...state, stage: action.value, powered: true };
    const mode = action.value === state.mode && state.powered ? null : action.value;
    return { mode, stage: mode === null ? "read" : state.stage, powered: true };
}

/** The approved interactive artwork, mounted directly in the real landing hero. */
export function PocketInstrument() {
    const [state, dispatch] = useReducer(transition, initialState);
    const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
    const [expanded, setExpanded] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const plateRef = useRef<HTMLImageElement>(null);
    const rendererRef = useRef<InstrumentHandle | null>(null);
    const stateRef = useRef(state);
    const id = useId();
    const home = state.mode === null;
    const mode = content.modes.find(item => item.id === state.mode) ?? content.modes[1];
    const view = home ? content.home : mode.stages[state.stage];
    const hint = !state.powered ? "Press the side switch to turn it back on." : home ? "Choose a key. Turn the dial." : `${mode.label} · ${content.stages.find(item => item.id === state.stage)?.label}`;

    useEffect(() => {
        stateRef.current = state;
        rendererRef.current?.setState(state);
    }, [state]);

    useEffect(() => {
        const container = stageRef.current;
        if (!container) return;
        const controller = new AbortController();
        let renderer: InstrumentHandle | undefined;
        async function mount() {
            try {
                // The artwork and controls can start with the fallback font.
                // Canvas labels redraw once the page's fonts finish loading.
                if (controller.signal.aborted) return;
                renderer = await createInstrument({
                    container: container!, content, signal: controller.signal,
                    sourceImage: plateRef.current ?? undefined,
                    fontFamily: '"Instrument Sans", Arial, sans-serif',
                    onMode: value => dispatch({ type: "mode", value }),
                    onStage: value => dispatch({ type: "stage", value }),
                    onPowerChange: value => dispatch({ type: "power", value }),
                });
                if (controller.signal.aborted) { renderer.dispose(); return; }
                rendererRef.current = renderer;
                renderer.setState(stateRef.current);
                setStatus("ready");
            } catch {
                if (!controller.signal.aborted) setStatus("failed");
            }
        }
        void mount();
        return () => {
            controller.abort();
            renderer?.dispose();
            rendererRef.current = null;
        };
    }, []);

    return (
        <div className={styles.instrument} data-testid="pocket-instrument" data-status={status} data-mode={state.mode ?? "home"} data-stage={state.stage} data-powered={state.powered}>
            <div className={styles.stage} ref={stageRef} data-testid="instrument-stage" role="group" aria-label="Interactive sample resume review" aria-describedby={`${id}-instructions`}>
                <div className={styles.placeholder} aria-hidden="true">
                    <Image ref={plateRef} src="/assets/instrument/clean-plate.v1.webp" alt="" width={1536} height={1024} priority unoptimized className={styles.plate} />
                </div>
            </div>
            <p id={`${id}-instructions`} className="sr-only">Story, Impact, and Fit choose a focus. Press the selected key again to return Home. The dial changes between the resume, a recruiter’s read, and the next move. The brass side switch controls power. Open Read at full size for the same feedback in larger text.</p>
            <div className={status === "failed" ? styles.caption : "sr-only"}><p>{status === "failed" ? "Explore a sample of the feedback below." : hint}</p></div>
            <details className={styles.example} open={expanded || status === "failed"} onToggle={event => setExpanded(event.currentTarget.open)}>
                <summary>Read at full size <span aria-hidden="true">+</span></summary>
                <div className={styles.readable}>
                    <p className={styles.disclosure}>Fictional example · Customer success</p>
                    {status === "failed" && <div className={styles.modes} role="group" aria-label="Choose a focus">
                        <button type="button" aria-pressed={home} onClick={() => dispatch({ type: "mode", value: null })}>Home</button>
                        {content.modes.map(item => <button key={item.id} type="button" aria-pressed={state.mode === item.id} onClick={() => dispatch({ type: "mode", value: item.id })}>{item.label}</button>)}
                    </div>}
                    {status === "failed" && !home && <fieldset className={styles.views}>
                        <legend className="sr-only">Choose a view</legend>
                        {content.stages.map(item => <label key={item.id}>
                            <input type="radio" name={`${id}-view`} value={item.id} checked={state.stage === item.id}
                                onChange={() => dispatch({ type: "stage", value: item.id })}
                                onClick={() => { if (!state.powered) dispatch({ type: "stage", value: item.id }); }} />
                            <span>{item.label}</span>
                        </label>)}
                    </fieldset>}
                    <div className={styles.feedback} data-testid="instrument-readable-feedback">
                        <p className={styles.label}>{home ? "Before" : "On the resume"}</p>
                        <blockquote>{home ? content.home.sourceExcerpt : mode.sourceExcerpt}</blockquote>
                        {mode.jobRequirementVisible && !home && <p className={styles.job}><strong>Sample role</strong>{content.sample.jobRequirement.text}</p>}
                        {home ? <><p className={styles.label}>After</p><h3 className={styles.revision}>{content.home.revision}</h3><p>{view.body}</p></> : state.stage === "paper" ? <p className={styles.sourceContext}>{mode.sourceContext}</p> : <><h3>{view.title}</h3><p>{view.body}</p></>}
                    </div>
                    <details className={styles.facts}>
                        <summary>See the facts behind this advice <span aria-hidden="true">+</span></summary>
                        <p>Background supplied with this fictional resume:</p>
                        <ul>{content.sample.sourceFacts.filter(fact => mode.sourceFactIds.includes(fact.id)).map(fact => <li key={fact.id}>{fact.text}</li>)}</ul>
                        <p>{mode.integrityNote}</p>
                    </details>
                </div>
            </details>
            <p className="sr-only" aria-live="polite" aria-atomic="true">{state.powered ? `${home ? "Home. All keys released." : `${mode.label}. ${content.stages.find(item => item.id === state.stage)?.label}.`} ${view.title}` : "Instrument off. The full-size example remains available below."}</p>
        </div>
    );
}
