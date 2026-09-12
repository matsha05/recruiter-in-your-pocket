import type { CreateInstrumentOptions, InstrumentState, PlaneRegion, Crop, InstrumentView, ModeId, StageId, Mode } from './types';
import { context2d, installScopedStyle } from './dom';
import { geometry as calibration } from './reference-geometry';
import { createDial } from './instrument-dial';
import { createKeys } from './instrument-keys';
import { createPower } from './instrument-power';
import { loadKeyMaterials, waitForKeyMaterials } from './key-materials';
const STYLE_ID = 'reference-instrument-styles';
const css = `
.ri-art { position: absolute; inset: 0; overflow: visible; isolation: isolate; }
.ri-board { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.ri-plate { position: absolute; max-width: none !important; user-select: none; pointer-events: none;
  mask-image: linear-gradient(to right,transparent,black 2%,black 98%,transparent),linear-gradient(to bottom,transparent,black 3%,black 89%,transparent);
  mask-composite: intersect; -webkit-mask-composite: source-in; }
.ri-paper { position: absolute; left: 0; top: 0; transform-origin: 0 0; overflow: hidden; border-radius: 26px;
  color: hsl(var(--text-strong)); padding: 30px 34px 25px; box-sizing: border-box; background: #e7e4da;
  box-shadow: inset 7px 5px 12px #15201f2b, inset -2px -4px 9px #514d3930; pointer-events: none;
  font-family: var(--ri-font-family, var(--font-body)), 'Arial', sans-serif; text-align: left; -webkit-font-smoothing: antialiased;
}
.ri-paper-texture { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .72; z-index: -1; }
.ri-paper-topline { display: flex; align-items: baseline; justify-content: space-between; gap: 20px;
  font-size: 10px; line-height: 1.2; font-weight: 600; letter-spacing: 1.6px; text-transform: uppercase;
  margin: 0 0 25px; color: hsl(var(--text-strong)); }
.ri-paper-stage { color: hsl(var(--text-muted)); letter-spacing: 1.2px; font-size: 9px; font-weight: 500; text-transform: uppercase; }
.ri-paper-title { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.ri-source-label { font-size: 10px; font-weight: 500; line-height: 1.2; letter-spacing: 1.3px;
  text-transform: uppercase; margin: 0 0 9px; color: hsl(var(--text-muted)); }
.ri-source { font-family: inherit; font-size: 21px; font-weight: 400; font-style: normal;
  letter-spacing: -.15px; line-height: 1.32; padding: 0; margin: 0; color: hsl(var(--text-muted)); }
.ri-source-annotation { text-decoration: underline; text-decoration-color: hsl(var(--brand-strong));
  text-decoration-thickness: 1.6px; text-underline-offset: 5px; text-decoration-skip-ink: none; }
.ri-response-label { font-size: 10px; line-height: 1.2; letter-spacing: 1.3px;
  text-transform: uppercase; margin: 23px 0 9px; font-weight: 600; color: hsl(var(--brand-strong)); }
.ri-response { font-family: inherit; font-size: 22px; font-weight: 550;
  font-style: normal; line-height: 1.28; letter-spacing: -.2px; color: hsl(var(--text-strong));
  padding: 0; margin: 0; border: 0; background: none; }
.ri-paper[data-stage="next"] .ri-response { font-size: 21px; line-height: 1.25; }
.ri-paper[data-stage="paper"] .ri-response-label, .ri-paper[data-stage="paper"] .ri-response { display: none; }
.ri-paper[data-mode="home"] .ri-response { font-size: 25px; line-height: 1.28; max-width: 420px; }
.ri-caveat { font: 12px/1.3 var(--ri-font-family, var(--font-body)), Arial, sans-serif; color: hsl(var(--text-muted)); margin: 10px 0 0; }
.ri-job { font: 11px/1.35 var(--ri-font-family, var(--font-body)), Arial, sans-serif; color: hsl(var(--text-muted)); margin: 14px 0 0; letter-spacing: 0; }
.ri-art[data-clean-plate="true"] .ri-paper { background:transparent;box-shadow:none;mix-blend-mode:multiply; }
.ri-art[data-clean-plate="true"] .ri-paper-texture { display:none; }
.ri-dial:focus-visible { outline:3px solid hsl(var(--surface-page)); }
.ri-dial-face { position: absolute; pointer-events: none; transform-origin: center; }
.ri-dial { position: absolute; border: 0; border-radius: 50%; background: transparent; cursor: ew-resize;
  padding: 0; outline-offset: 5px; touch-action: pan-y; -webkit-tap-highlight-color: transparent; }
.ri-dial-grab { cursor: grabbing !important; }
.ri-engraving { position: absolute; color: #dddbc3; font: 500 9px/1 var(--ri-font-family, var(--font-body)),Arial,sans-serif;
  text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 1px 1px #03232790;
  transform: rotate(7deg); transform-origin: 0 0; pointer-events: none; white-space: nowrap; }
`;
function solve(matrix: number[][], vector: number[]) {
    const a = matrix.map((row, index) => [...row, vector[index]]);
    const n = vector.length;
    for (let col = 0; col < n; col++) {
        let largest = col;
        for (let row = col + 1; row < n; row++)
            if (Math.abs(a[row][col]) > Math.abs(a[largest][col]))
                largest = row;
        [a[col], a[largest]] = [a[largest], a[col]];
        const divisor = a[col][col];
        if (Math.abs(divisor) < 1e-10)
            throw new Error('Invalid reference calibration');
        for (let k = col; k <= n; k++)
            a[col][k] /= divisor;
        for (let row = 0; row < n; row++)
            if (row !== col) {
                const factor = a[row][col];
                for (let k = col; k <= n; k++)
                    a[row][k] -= factor * a[col][k];
            }
    }
    return a.map(row => row[n]);
}
function project(element: HTMLElement, region: PlaneRegion, crop: Crop) {
    const source = [[0, 0], [region.width, 0], [region.width, region.height], [0, region.height]];
    const target = region.corners.map(([x, y]) => [x - crop.x, y - crop.y]);
    const matrix: number[][] = [], vector: number[] = [];
    for (let i = 0; i < 4; i++) {
        const [x, y] = source[i], [u, v] = target[i];
        matrix.push([x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]);
        vector.push(u, v);
    }
    const h = solve(matrix, vector);
    element.style.width = region.width + 'px';
    element.style.height = region.height + 'px';
    element.style.transform = `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
}
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    element.className = className;
    if (text)
        element.textContent = text;
    return element;
}
function paperTexture(canvas: HTMLCanvasElement) {
    canvas.width = 1040;
    canvas.height = 730;
    const ctx = context2d(canvas);
    const image = ctx.createImageData(canvas.width, canvas.height);
    let seed = 831;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
    for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const falloff = Math.pow((x - 430) / 1040, 2) * 9 + y / canvas.height * 2;
            const grain = (random() - .5) * 11;
            image.data[i] = 239 - falloff + grain;
            image.data[i + 1] = 236 - falloff + grain;
            image.data[i + 2] = 225 - falloff + grain;
            image.data[i + 3] = 255;
        }
    ctx.putImageData(image, 0, 0);
}
export async function createInstrument({ container, content, onMode, onStage, onPowerChange, onReady, geometry = calibration, signal, fontFamily, sourceImage }: CreateInstrumentOptions) {
    if (signal?.aborted)
        throw new DOMException('Instrument loading cancelled', 'AbortError');
    for (const id of ['story', 'impact', 'fit'] as const)
        if (!content.modes.some(mode => mode.id === id))
            throw new Error(`Missing instrument mode: ${id}`);
    for (const id of ['paper', 'read', 'next'] as const)
        if (!content.stages.some(stage => stage.id === id))
            throw new Error(`Missing instrument stage: ${id}`);
    const { crop } = geometry;
    let currentMode: Mode = content.defaults?.mode ?? null;
    let currentStage: StageId = currentMode === null ? 'read' : (content.defaults?.stage || content.stages[1].id);
    let disposed = false, boardScale = 1, topOffset = 0;
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionPreference.matches;
    let hasRendered = false;
    let powered = true;
    const inkAnimations = new Map<HTMLElement, Animation>();
    let paintedMode = currentMode, paintedStage = currentStage;
    const root = el('div', 'ri-art');
    const resolvedFont = fontFamily || getComputedStyle(container).fontFamily || 'Arial, sans-serif';
    root.style.setProperty('--ri-font-family', resolvedFont);
    root.dataset.cleanPlate = String(geometry.cleanPlate);
    root.dataset.powered = "true";
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'Interactive resume review instrument');
    const board = el('div', 'ri-board');
    Object.assign(board.style, { width: crop.width + 'px', height: crop.height + 'px' });
    const plate = sourceImage || el('img', 'ri-plate');
    if (!sourceImage) {
        plate.alt = '';
        plate.draggable = false;
        plate.decoding = 'async';
        plate.src = geometry.source;
        Object.assign(plate.style, {
            left: -crop.x + 'px', top: -crop.y + 'px', width: geometry.sourceWidth + 'px', height: geometry.sourceHeight + 'px',
        });
    }
    const materialsLoading = loadKeyMaterials(geometry);
    const plateLoading = new Promise<void>((resolve, reject) => {
        const cleanup = () => { plate.removeEventListener('load', loaded); plate.removeEventListener('error', failed); signal?.removeEventListener('abort', aborted); };
        const aborted = () => { cleanup(); reject(new DOMException('Instrument loading cancelled', 'AbortError')); };
        const loaded = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error('Approved reference artwork unavailable')); };
        plate.addEventListener('load', loaded, { once: true });
        plate.addEventListener('error', failed, { once: true });
        signal?.addEventListener('abort', aborted, { once: true });
        if (signal?.aborted)
            aborted();
        else if (plate.complete)
            if (plate.naturalWidth) loaded(); else failed();
    });
    await plateLoading;
    // A stalled optimization must not leave a fully visible device inert.
    // Once its photograph is available, the original reconstruction is safe.
    const preparedMaterials = await waitForKeyMaterials(materialsLoading, signal);
    if (signal?.aborted)
        throw new DOMException('Instrument loading cancelled', 'AbortError');
    const removeStyle = installScopedStyle(STYLE_ID, css);
    const cleanupOnFailure: (() => void)[] = [removeStyle, () => root.remove()];
    try {
        // The React image stays in place through hydration and readiness. It is
        // both the visible photograph and the canvas source, so it loads once.
        if (!sourceImage) board.append(plate);
        const paper = el('div', 'ri-paper');
        paper.setAttribute('role', 'group');
        paper.setAttribute('aria-label', 'Instrument display');
        project(paper, geometry.paper, crop);
        const texture = el('canvas', 'ri-paper-texture');
        if (!geometry.cleanPlate) paperTexture(texture);
        const topline = el('div', 'ri-paper-topline');
        const modeLabel = el('span', '', 'Home');
        const stageLabel = el('span', 'ri-paper-stage');
        topline.append(modeLabel, stageLabel);
        // The physical controls work with touch and keyboard. The disclosure
        // outside the artwork makes the same document available at reading size.
        const title = el('h3', 'ri-paper-title');
        const sourceLabel = el('p', 'ri-source-label', 'From the sample resume');
        const source = el('p', 'ri-source');
        const sourceInk = el('span', '');
        source.append(sourceInk);
        const responseLabel = el('p', 'ri-response-label');
        const response = el('p', 'ri-response');
        const responseInk = el('span', '');
        response.append(responseInk);
        const caveat = el('p', 'ri-caveat');
        const job = el('p', 'ri-job');
        paper.append(texture, topline, title, sourceLabel, source, responseLabel, response, caveat, job);
        board.append(paper);
        const keyControls = createKeys({
            board, plate, geometry, crop, project, el, onMode, fontFamily: resolvedFont, preparedMaterials,
            getMode: () => currentMode, isReducedMotion: () => reducedMotion, isDisposed: () => disposed,
        });
        cleanupOnFailure.push(() => keyControls.dispose());
        const keys = keyControls.keys;
        function stageIndex() { return Math.max(0, content.stages.findIndex(item => item.id === currentStage)); }
        const rotary = createDial({
            board, plate, geometry, crop, fontFamily: resolvedFont,
            initialStage: stageIndex(),
            stageLabels: content.stages.map(stage => stage.label),
            onStage: index => onStage?.(content.stages[index].id),
        });
        cleanupOnFailure.push(() => rotary.dispose());
        const powerControl = createPower({ board, plate, crop, project, el,
            onToggle: () => setPowered(!powered) });
        cleanupOnFailure.push(() => powerControl.dispose());
        function setPowered(value: boolean) {
            if (disposed || powered === value)
                return;
            powered = value;
            if (!powered) {
                rotary.finishMotion();
                keyControls.finishMotion();
            }
            render();
            onPowerChange?.(powered);
        }
        root.append(board);
        container.append(root);
        function revealInk(elements: HTMLElement[]) {
            for (const animation of inkAnimations.values())
                animation.cancel();
            inkAnimations.clear();
            if (reducedMotion || disposed)
                return;
            for (const element of elements) {
                const animation = element.animate([{ opacity: .42 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
                inkAnimations.set(element, animation);
                animation.finished.then(() => {
                    if (inkAnimations.get(element) === animation)
                        inkAnimations.delete(element);
                }).catch(() => { });
            }
        }
        function render() {
            const modeChanged = paintedMode !== currentMode;
            const stageChanged = paintedStage !== currentStage;
            const home = currentMode === null;
            const mode = content.modes.find(item => item.id === currentMode) || content.modes[1];
            const stage = content.stages.find(item => item.id === currentStage) || content.stages[1];
            const impact = content.modes.find(item => item.id === 'impact')!;
            const view: Pick<InstrumentView, 'compactTitle' | 'compactBody' | 'compactNote'> = home ? {
                compactTitle: content.home.title,
                compactBody: content.home.revision,
            } : mode.stages[currentStage];
            const excerpt = home ? (content.home.sourceExcerpt || impact.sourceExcerpt) : mode.sourceExcerpt;
            modeLabel.textContent = home ? 'Resume review' : mode.label;
            stageLabel.textContent = 'Example';
            title.textContent = view.compactTitle;
            sourceLabel.textContent = home ? 'Before' : 'On the resume';
            const phrases: Record<ModeId, string> = {
                story: 'Customer-focused professional',
                impact: 'Responsible for managing',
                fit: 'improve customer onboarding',
            };
            const phrase = phrases[home ? 'impact' : mode.id];
            const phraseStart = excerpt.indexOf(phrase);
            sourceInk.replaceChildren();
            if (!home && currentStage === 'read' && phraseStart !== -1) {
                sourceInk.append(document.createTextNode(excerpt.slice(0, phraseStart)), el('span', 'ri-source-annotation', phrase), document.createTextNode(excerpt.slice(phraseStart + phrase.length)));
            }
            else {
                sourceInk.textContent = excerpt;
            }
            responseLabel.hidden = !home && currentStage === 'paper';
            responseLabel.textContent = home ? 'After' : currentStage === 'next' ? 'A clearer version' : 'A recruiter’s read';
            responseInk.textContent = view.compactBody;
            caveat.hidden = !view.compactNote;
            caveat.textContent = view.compactNote || '';
            job.hidden = home || !mode.jobRequirementVisible;
            job.textContent = 'Sample role · ' + content.sample.jobRequirement.shortText;
            paper.dataset.mode = home ? 'home' : mode.id;
            paper.dataset.stage = stage.id;
            keyControls.render(currentMode, { instant: !hasRendered, powered });
            root.dataset.powered = String(powered);
            paper.setAttribute('aria-hidden', String(!powered));
            powerControl.setPowered(powered);
            root.dataset.mode = home ? 'home' : mode.id;
            root.dataset.stage = stage.id;
            if (hasRendered && (modeChanged || stageChanged)) {
                const changedInk: HTMLElement[] = [title];
                if (home || currentStage !== 'paper')
                    changedInk.push(responseInk, responseLabel);
                if (stageChanged)
                    changedInk.push(stageLabel);
                if (modeChanged)
                    changedInk.push(sourceInk, modeLabel);
                revealInk(changedInk);
            }
            paintedMode = currentMode;
            paintedStage = currentStage;
            if (powered) {
                rotary.setEnabled(!home);
                rotary.setStage(stageIndex());
            }
            else {
                rotary.setEnabled(false, { park: false });
                rotary.element.setAttribute('aria-label', 'A closer look. Turn instrument power on to use the dial.');
            }
            hasRendered = true;
        }
        function resize() {
            if (disposed)
                return;
            const rect = container.getBoundingClientRect();
            boardScale = Math.min(rect.width / crop.width, rect.height / crop.height);
            topOffset = Math.max(0, (rect.height - crop.height * boardScale) / 2);
            board.style.transform = `translate(${(rect.width - crop.width * boardScale) / 2}px,${topOffset}px) scale(${boardScale})`;
            board.style.setProperty('--ri-hit-padding', Math.max(0, (48 / boardScale - 42) / 2) + 'px');
            board.style.setProperty('--ri-hit-padding-x', Math.max(0, (46 / boardScale - 97) / 2) + 'px');
            powerControl.resize(boardScale);
        }
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        cleanupOnFailure.push(() => observer.disconnect());
        const finishMotion = () => {
            rotary.finishMotion();
            keyControls.finishMotion();
            powerControl.finishMotion();
            for (const animation of inkAnimations.values())
                animation.cancel();
            inkAnimations.clear();
        };
        const motionChanged = (event: MediaQueryListEvent) => { reducedMotion = event.matches; rotary.setReducedMotion(reducedMotion); if (reducedMotion)
            finishMotion(); };
        const visibilityChanged = () => { if (document.hidden)
            finishMotion(); };
        const windowBlur = () => {
            keyControls.releaseAll();
        };
        motionPreference.addEventListener('change', motionChanged);
        document.addEventListener('visibilitychange', visibilityChanged);
        window.addEventListener('blur', windowBlur);
        cleanupOnFailure.push(() => motionPreference.removeEventListener('change', motionChanged), () => document.removeEventListener('visibilitychange', visibilityChanged), () => window.removeEventListener('blur', windowBlur));
        resize();
        render();
        const api = {
            setState(next: InstrumentState) {
                if (disposed)
                    return;
                if (next.mode !== undefined && (next.mode === null || content.modes.some(item => item.id === next.mode)))
                    currentMode = next.mode;
                if (next.stage !== undefined && content.stages.some(item => item.id === next.stage))
                    currentStage = next.stage;
                if (currentMode === null)
                    currentStage = 'read';
                if (typeof next.powered === "boolean")
                    powered = next.powered;
                render();
            },
            setPowered,
            getSnapshot() {
                const home = currentMode === null;
                const mode = content.modes.find(item => item.id === currentMode) || content.modes[1], stage = content.stages.find(item => item.id === currentStage) || content.stages[1];
                const view = home ? { title: content.home.title, body: content.home.body, compactTitle: content.home.title, compactBody: content.home.revision } : mode.stages[currentStage];
                const bounds = container.getBoundingClientRect();
                const dial = rotary.getSnapshot();
                const keyStates = keyControls.getSnapshot();
                const position = (element: HTMLElement) => { const r = element.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };
                return {
                    renderer: 'reference-plate', artSource: geometry.source, mode: currentMode, stage: currentStage, powered, powerControl: position(powerControl.element),
                    width: bounds.width, height: bounds.height, dpr: window.devicePixelRatio, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
                    rotation: { x: 0, y: 0, z: 0 }, buttons: keys.map(key => ({ id: key.id, ...position(key.element) })), knob: dial.control, display: position(paper),
                    dial,
                    animation: { dialMoving: dial.moving, dialAngle: dial.angle, dialTarget: dial.target, pressedKeys: keyStates.filter(state => state.held).length,
                        keysMoving: keyStates.some(state => state.moving), latchedKeys: currentMode === null ? [] : [currentMode], inkChanging: inkAnimations.size > 0 },
                    keyStates,
                    displayText: { title: view.compactTitle, body: !home && currentStage === 'paper' ? mode.sourceExcerpt : view.compactBody, source: home ? (content.home.sourceExcerpt || content.modes.find(item => item.id === 'impact')!.sourceExcerpt) : mode.sourceExcerpt },
                    fullAdvice: { title: view.title, body: view.body }, compactDisplay: { title: view.compactTitle, body: view.compactBody },
                    home, stageLabel: home ? 'Home' : stage.label, paperBounds: { scrollHeight: paper.scrollHeight, height: paper.clientHeight },
                };
            },
            dispose() {
                if (disposed)
                    return;
                finishMotion();
                disposed = true;
                observer.disconnect();
                rotary.dispose();
                keyControls.dispose();
                powerControl.dispose();
                motionPreference.removeEventListener('change', motionChanged);
                document.removeEventListener('visibilitychange', visibilityChanged);
                window.removeEventListener('blur', windowBlur);
                signal?.removeEventListener('abort', api.dispose);
                removeStyle();
                root.remove();
            },
        };
        signal?.addEventListener('abort', api.dispose, { once: true });
        cleanupOnFailure.push(api.dispose);
        onReady?.();
        return api;
    }
    catch (error) {
        for (const cleanup of cleanupOnFailure.reverse())
            cleanup();
        throw error;
    }
}
export type InstrumentHandle = Awaited<ReturnType<typeof createInstrument>>;
export type InstrumentSnapshot = ReturnType<InstrumentHandle['getSnapshot']>;
