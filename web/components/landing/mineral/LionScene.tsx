"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { LionPoint, LionRig } from "./lionRig";
import styles from "./LionScene.module.css";

const pointerQuery = "(min-width: 901px) and (hover: hover) and (pointer: fine)";
const sourceWidth = 1536;
const sourceHeight = 1024;
type MotionState = "still" | "loading" | "ready" | "failed";

export function LionScene({ compositionRef }: { compositionRef: RefObject<HTMLDivElement | null> }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [motionState, setMotionState] = useState<MotionState>("still");

    useEffect(() => {
        const canvas = canvasRef.current;
        const original = imageRef.current;
        const composition = compositionRef.current;
        if (!canvas || !original || !composition) return;

        const pointer = window.matchMedia(pointerQuery);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const events = new AbortController();
        let rig: LionRig | undefined;
        let clean: HTMLImageElement | undefined;
        let preparing = false;
        let disposed = false;
        let failed = false;
        let inView = false;
        let frame = 0;
        let lastTime = 0;
        let target: LionPoint = [0, 0];
        let head: LionPoint = [0, 0];
        let eyes: LionPoint = [0, 0];

        const eligible = () => pointer.matches && !reducedMotion.matches && inView && !document.hidden && !disposed && !failed;
        const active = () => eligible() && Boolean(rig);
        const status = (value: MotionState) => { if (!disposed) setMotionState(value); };
        const cancelFrame = () => {
            if (frame) window.cancelAnimationFrame(frame);
            frame = 0;
            lastTime = 0;
        };
        const resetPose = () => {
            cancelFrame();
            target = [0, 0];
            head = [0, 0];
            eyes = [0, 0];
        };
        const fail = () => {
            if (failed) return;
            failed = true;
            resetPose();
            rig?.destroy();
            rig = undefined;
            status("failed");
        };
        const draw = () => {
            if (!active()) return;
            try { rig!.render(head, eyes); } catch { fail(); }
        };
        const resize = () => {
            if (!active()) return;
            const bounds = canvas.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.min(sourceWidth, Math.max(1, Math.round(bounds.width * ratio)));
            rig!.resize(width, Math.round(width * sourceHeight / sourceWidth));
            draw();
        };

        const advance = (now: number) => {
            frame = 0;
            if (!active()) {
                // A preference can change before its media-query event is delivered.
                sync();
                return;
            }
            // Exponential damping stays stable with elapsed time, even on slow frames.
            const dt = Math.max(0, (now - (lastTime || now - 16.7)) / 1000);
            lastTime = now;
            const headEase = 1 - Math.exp(-dt / 0.235);
            const eyeEase = 1 - Math.exp(-dt / 0.068);
            let error = 0;
            for (const index of [0, 1] as const) {
                head[index] += (target[index] - head[index]) * headEase;
                const eyeTarget = target[index] - head[index] * 0.35;
                eyes[index] += (eyeTarget - eyes[index]) * eyeEase;
                error += Math.abs(target[index] - head[index]) + Math.abs(eyeTarget - eyes[index]);
            }
            const settled = error < 0.00015;
            if (settled) {
                head = [...target];
                eyes = [target[0] * 0.65, target[1] * 0.65];
            }
            draw();
            if (!settled && active()) frame = window.requestAnimationFrame(advance);
        };
        const wake = () => {
            if (!active() || frame) return;
            lastTime = 0;
            frame = window.requestAnimationFrame(advance);
        };
        const settle = () => {
            target = [0, 0];
            if (head[0] || head[1] || eyes[0] || eyes[1]) wake();
        };

        async function prepare() {
            if (preparing || rig || !eligible()) return;
            preparing = true;
            status("loading");
            try {
                // Use the visible image itself: no second request or alternate optimizer URL.
                await original!.decode();
                if (!eligible()) return;
                clean = new window.Image();
                clean.decoding = "async";
                clean.src = "/assets/characters/pocket-lion-room.webp";
                const [renderer] = await Promise.all([import("./lionRig"), clean.decode()]);
                if (!eligible()) return;
                if (original!.naturalWidth !== sourceWidth || original!.naturalHeight !== sourceHeight || clean.naturalWidth !== sourceWidth || clean.naturalHeight !== sourceHeight) {
                    throw new Error("The lion plates must share their approved dimensions.");
                }
                rig = renderer.createLionRig(canvas!, original!, clean);
                resize();
                if (!failed && eligible()) status("ready");
            } catch {
                if (!disposed) fail();
            } finally {
                preparing = false;
                clean = undefined;
                if (!disposed && !failed && !eligible()) status("still");
            }
        }

        const sync = () => {
            if (!eligible()) {
                resetPose();
                status(failed ? "failed" : "still");
                return;
            }
            if (rig) {
                resize();
                if (!failed) status("ready");
            } else {
                void prepare();
            }
        };
        const point = (event: PointerEvent) => {
            if (!active() || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
            const bounds = canvas.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width * sourceWidth;
            const y = (event.clientY - bounds.top) / bounds.height * sourceHeight;
            target = [Math.tanh((x - 1090) / 400), Math.tanh((y - 320) / 360)];
            wake();
        };
        const signal = events.signal;
        composition.addEventListener("pointermove", point, { passive: true, signal });
        composition.addEventListener("pointerleave", settle, { signal });
        composition.addEventListener("pointercancel", settle, { signal });
        window.addEventListener("blur", () => { resetPose(); draw(); }, { signal });
        document.addEventListener("visibilitychange", sync, { signal });
        pointer.addEventListener("change", sync);
        reducedMotion.addEventListener("change", sync);
        canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); fail(); }, { signal });
        window.addEventListener("pagehide", () => { resetPose(); status("still"); }, { signal });
        window.addEventListener("pageshow", sync, { signal });

        const visibility = new IntersectionObserver(([entry]) => {
            inView = entry?.isIntersecting ?? false;
            sync();
        });
        const sizing = new ResizeObserver(resize);
        visibility.observe(composition);
        sizing.observe(canvas);

        return () => {
            disposed = true;
            cancelFrame();
            events.abort();
            pointer.removeEventListener("change", sync);
            reducedMotion.removeEventListener("change", sync);
            visibility.disconnect();
            sizing.disconnect();
            clean?.removeAttribute("src");
            rig?.destroy();
        };
    }, [compositionRef]);

    return (
        <div className={styles.scene} data-testid="lion-hero-scene" data-motion-state={motionState}>
            <Image
                ref={imageRef}
                src="/assets/characters/pocket-lion.webp"
                alt="A lion adviser wearing glasses reviews a sample resume in a warmly lit studio inside a teal pocket, asking what improved about the candidate's onboarding work."
                fill priority unoptimized
                sizes="(max-width: 700px) 175vw, (max-width: 900px) 1225px, (min-width: 1800px) 1800px, 100vw"
                className={styles.still}
                data-testid="lion-hero-still"
            />
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" data-testid="lion-hero-canvas" />
        </div>
    );
}
