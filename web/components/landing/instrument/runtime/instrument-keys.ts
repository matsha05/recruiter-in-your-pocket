import { context2d, installScopedStyle, listen } from './dom';
import type { Crop, ElementFactory, InstrumentGeometry, KeyRegion, Mode, ModeId, Project } from './types';
import type { PreparedKeyMaterials } from './key-materials';
type Point = [
    number,
    number
];
interface KeysOptions {
    board: HTMLElement;
    plate: HTMLImageElement;
    geometry: InstrumentGeometry;
    crop: Crop;
    project: Project;
    el: ElementFactory;
    fontFamily: string;
    onMode?: (mode: ModeId) => void;
    getMode?: () => Mode;
    isReducedMotion?: () => boolean;
    isDisposed?: () => boolean;
    preparedMaterials?: PreparedKeyMaterials | null;
}
interface KeyState {
    id: ModeId;
    region: KeyRegion;
    element: HTMLButtonElement;
    canvas: HTMLCanvasElement;
    label: string;
    ctx: CanvasRenderingContext2D;
    texture: HTMLCanvasElement;
    capPath: Path2D;
    normal: {
        x: number;
        y: number;
    };
    depth: number;
    target: number;
    velocity: number;
    frame: number;
    held: boolean;
    latched: boolean;
    pointerId: number | null;
    cancelClick: boolean;
    surfaceTransform: string;
    start: number;
    omega: number;
    initialVelocity: number;
    offset: number;
    from: number;
}
interface KeyRenderOptions {
    instant?: boolean;
    powered?: boolean;
}
/*
 * A low-travel latching key, reconstructed in the photographed control plane.
 * The source-derived case opening stays fixed. The photographic cap, bevel
 * and legend travel together along the chassis normal and behind that opening.
 * Depths are source-image pixels, rather than CSS pixels after page scaling.
 */
const STYLE_ID = 'instrument-tactile-key-styles';
const DENSITY = 4;
const FULL_TRAVEL = 5;
const LATCH_TRAVEL = FULL_TRAVEL * .6;
const css = `
.ri-key { position:absolute; left:0; top:0; transform-origin:0 0; border:0; border-radius:24px;
  appearance:none; padding:0; margin:0; cursor:pointer; background:transparent !important;
  box-shadow:none !important; color:inherit; outline-offset:5px;
  -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
.ri-key::before { display:none !important; }
.ri-key::after { content:''; position:absolute;
  inset:calc(-1 * var(--ri-hit-padding, 0px)) calc(-1 * var(--ri-hit-padding-x, 0px));
  border-radius:inherit; pointer-events:auto; background:none !important; opacity:1 !important; }
.ri-key:focus-visible { outline:3px solid hsl(var(--surface-page)); }
.ri-key:active { filter:none !important; }
.ri-key-mechanism { display:block; width:100%; height:100%; overflow:visible; pointer-events:none; }
`;
function solve(matrix: number[][], vector: number[]): number[] {
    const a = matrix.map((row, i) => [...row, vector[i]]);
    for (let c = 0; c < vector.length; c++) {
        let pivot = c;
        for (let r = c + 1; r < vector.length; r++)
            if (Math.abs(a[r][c]) > Math.abs(a[pivot][c]))
                pivot = r;
        [a[c], a[pivot]] = [a[pivot], a[c]];
        const divisor = a[c][c];
        for (let k = c; k <= vector.length; k++)
            a[c][k] /= divisor;
        for (let r = 0; r < vector.length; r++)
            if (r !== c) {
                const factor = a[r][c];
                for (let k = c; k <= vector.length; k++)
                    a[r][k] -= factor * a[c][k];
            }
    }
    return a.map(row => row[vector.length]);
}
function homography(region: KeyRegion): number[] {
    const points = [[0, 0], [region.width, 0], [region.width, region.height], [0, region.height]];
    const matrix: number[][] = [], vector: number[] = [];
    points.forEach(([x, y], i) => {
        const [u, v] = region.corners[i];
        matrix.push([x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]);
        vector.push(u, v);
    });
    return solve(matrix, vector);
}
function map(h: number[], x: number, y: number): Point {
    const d = h[6] * x + h[7] * y + 1;
    return [(h[0] * x + h[1] * y + h[2]) / d, (h[3] * x + h[4] * y + h[5]) / d];
}
function calibratedRegion(original: KeyRegion): KeyRegion {
    // The legacy targets enclosed the legends, not the entire photographed cap:
    // their top edge cut 6–8 px through the ivory face. Extend this local plane
    // to its actual perimeter so the photographed bevel cannot remain behind.
    const h = homography(original), left = -2.5, right = original.width + 1;
    const topLeft = original.id === 'story' ? -5.5 : -8;
    const topRight = original.id === 'story' ? -8 : -10;
    const bottom = original.height + 3;
    return { ...original, width: original.width + 3.5, height: bottom - (topLeft + topRight) / 2,
        corners: [map(h, left, topLeft), map(h, right, topRight), map(h, right, bottom), map(h, left, bottom)] };
}
function sourceNormalInPlane(region: KeyRegion, h: number[]) {
    const [x, y] = [region.width / 2, region.height / 2];
    const p = map(h, x, y), px = map(h, x + 1, y), py = map(h, x, y + 1);
    const a = px[0] - p[0], b = py[0] - p[0], c = px[1] - p[1], d = py[1] - p[1];
    const determinant = a * d - b * c;
    // The reference camera shows the case thickness projecting down and right.
    // Invert its local plane projection: local +Y alone would drift leftward.
    const sx = .55, sy = .8;
    return { x: (d * sx - b * sy) / determinant, y: (a * sy - c * sx) / determinant };
}
export function createKeys({ board, plate, geometry, crop, project, el, fontFamily, onMode, getMode, isReducedMotion, isDisposed, preparedMaterials }: KeysOptions) {
    const removeStyle = installScopedStyle(STYLE_ID, css);
    let disposed = false, activeMode = getMode?.() ?? null, powered = true;
    const states: KeyState[] = [];
    const listeners: (() => void)[] = [];
    function cleanup() {
        if (disposed)
            return;
        disposed = true;
        for (const state of states) {
            if (state.frame)
                cancelAnimationFrame(state.frame);
            state.element.remove();
        }
        for (const remove of listeners)
            remove();
        removeStyle();
    }
    try {
        const regions = geometry.keys.map(calibratedRegion);
        // Only these small photographed caps are sampled. Reading the entire
        // plate forces a 6 MB canvas readback for material covering under 3% of it.
        const corners = regions.flatMap(region => region.corners);
        const sourceX = Math.max(0, Math.floor(Math.min(...corners.map(point => point[0]))) - 2);
        const sourceY = Math.max(0, Math.floor(Math.min(...corners.map(point => point[1]))) - 2);
        const sourceRight = Math.min(geometry.sourceWidth, Math.ceil(Math.max(...corners.map(point => point[0]))) + 3);
        const sourceBottom = Math.min(geometry.sourceHeight, Math.ceil(Math.max(...corners.map(point => point[1]))) + 3);
        const source = document.createElement('canvas');
        source.width = sourceRight - sourceX;
        source.height = sourceBottom - sourceY;
        let pixels: ImageData | undefined;
        if (!preparedMaterials) {
            const sourceContext = context2d(source, { willReadFrequently: true });
            sourceContext.drawImage(plate, sourceX, sourceY, source.width, source.height, 0, 0, source.width, source.height);
            pixels = sourceContext.getImageData(0, 0, source.width, source.height);
        }
        const on = <K extends keyof GlobalEventHandlersEventMap>(target: EventTarget, type: K, listener: (event: GlobalEventHandlersEventMap[K]) => void, options?: AddEventListenerOptions) => {
            listeners.push(listen(target, type, listener, options));
        };
        const dead = () => disposed || isDisposed?.();
        const reduced = () => !!isReducedMotion?.();
        function material(region: KeyRegion, h: number[]) {
            const texture = document.createElement('canvas');
            texture.width = region.width * DENSITY;
            texture.height = region.height * DENSITY;
            const ctx = context2d(texture);
            if (preparedMaterials) {
                const prepared = preparedMaterials.regions[region.id];
                ctx.drawImage(preparedMaterials.atlas, prepared.x, prepared.y, prepared.width, prepared.height,
                    0, 0, texture.width, texture.height);
                const path = new Path2D();
                path.moveTo(...prepared.contour[0]);
                for (const point of prepared.contour.slice(1)) path.lineTo(...point);
                path.closePath();
                return { texture, path };
            }
            if (!pixels) throw new Error('Instrument key material unavailable');
            const result = ctx.createImageData(texture.width, texture.height);
            // Sample the entire calibrated cap in its photographed plane, including
            // the rolled highlight. It is one rigid moving material, not a center
            // swatch over a bevel left on the chassis.
            for (let y = 0; y < texture.height; y++)
                for (let x = 0; x < texture.width; x++) {
                    const u = x / DENSITY;
                    const v = y / DENSITY;
                    const denominator = h[6] * u + h[7] * v + 1;
                    let sx = (h[0] * u + h[1] * v + h[2]) / denominator - sourceX;
                    let sy = (h[3] * u + h[4] * v + h[5]) / denominator - sourceY;
                    sx = Math.max(0, Math.min(source.width - 2, sx));
                    sy = Math.max(0, Math.min(source.height - 2, sy));
                    const ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy;
                    const at = (iy * source.width + ix) * 4, output = (y * texture.width + x) * 4;
                    for (let channel = 0; channel < 3; channel++)
                        result.data[output + channel] =
                            pixels.data[at + channel] * (1 - fx) * (1 - fy) + pixels.data[at + 4 + channel] * fx * (1 - fy) +
                                pixels.data[at + source.width * 4 + channel] * (1 - fx) * fy + pixels.data[at + source.width * 4 + 4 + channel] * fx * fy;
                    result.data[output + 3] = 255;
                }
            ctx.putImageData(result, 0, 0);
            return { texture, path: photographedContour(result, region) };
        }
        function photographedContour(image: ImageData, region: KeyRegion): Path2D {
            const { width, height, data } = image, total = width * height;
            const eligible = new Uint8Array(total), visited = new Uint8Array(total), queue = new Int32Array(total);
            for (let i = 0; i < total; i++) {
                const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
                eligible[i] = region.id === 'story' ? Number(r < g * .52 && r < b * .57 && g > 36 && b > 34) : Number(r > g * .98 && (r + g + b) / 3 > 118);
            }
            const seed = Math.floor(height / 2) * width + Math.floor(width / 2);
            let head = 0, tail = 0;
            queue[tail++] = seed;
            visited[seed] = 1;
            while (head < tail) {
                const i = queue[head++], x = i % width, y = Math.floor(i / width);
                for (let direction = 0; direction < 4; direction++) {
                    const next = direction === 0 ? (x > 0 ? i - 1 : -1) :
                        direction === 1 ? (x < width - 1 ? i + 1 : -1) :
                            direction === 2 ? (y > 0 ? i - width : -1) : (y < height - 1 ? i + width : -1);
                    if (next >= 0 && !visited[next] && eligible[next]) {
                        visited[next] = 1;
                        queue[tail++] = next;
                    }
                }
            }
            // The face is a convex manufactured cap. Taking the hull of the connected
            // photographed material removes grain-sized segmentation noise while
            // retaining its actual asymmetric contour and perspective.
            const points: Point[] = [];
            for (let y = 0; y < height; y++) {
                let left = width, right = -1;
                for (let x = 0; x < width; x++)
                    if (visited[y * width + x]) {
                        left = Math.min(left, x);
                        right = Math.max(right, x);
                    }
                if (right >= left) {
                    points.push([left / DENSITY, y / DENSITY], [right / DENSITY, y / DENSITY]);
                }
            }
            points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
            const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
            const lower: Point[] = [], upper: Point[] = [];
            for (const p of points) {
                while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
                    lower.pop();
                lower.push(p);
            }
            for (const p of [...points].reverse()) {
                while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
                    upper.pop();
                upper.push(p);
            }
            const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
            if (hull.length < 6)
                throw new Error('Unable to trace photographed key cap');
            const expansion = region.id === 'story' ? 1.1 : .55;
            const expanded = hull.map((p, i): Point => {
                const previous = hull[(i + hull.length - 1) % hull.length], next = hull[(i + 1) % hull.length];
                const ax = p[0] - previous[0], ay = p[1] - previous[1], al = Math.hypot(ax, ay);
                const bx = next[0] - p[0], by = next[1] - p[1], bl = Math.hypot(bx, by);
                const nx = ay / al + by / bl, ny = -ax / al - bx / bl, nl = Math.hypot(nx, ny);
                const ux = nx / nl, uy = ny / nl, scale = expansion / Math.max(.5, ux * (ay / al) + uy * (-ax / al));
                return [p[0] + ux * scale, p[1] + uy * scale];
            });
            const path = new Path2D();
            path.moveTo(...expanded[0]);
            for (const point of expanded.slice(1))
                path.lineTo(...point);
            path.closePath();
            return path;
        }
        function paint(state: KeyState) {
            const { ctx, region, normal, texture, capPath } = state;
            const { width: w, height: h } = region;
            const q = Math.max(0, Math.min(1, state.depth / FULL_TRAVEL));
            const dx = normal.x * state.depth, dy = normal.y * state.depth, dark = region.id === 'story';
            ctx.setTransform(DENSITY, 0, 0, DENSITY, 0, 0);
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.clip(capPath);
            if (state.depth > .001) {
                // A single photograph-derived silhouette defines both the stationary
                // recess and moving cap. No separately rounded wall can cross its bevel.
                const cavity = ctx.createLinearGradient(0, 0, normal.x * 12, normal.y * 12);
                cavity.addColorStop(0, '#061614');
                cavity.addColorStop(.22, '#0b201d');
                cavity.addColorStop(1, '#1b302a');
                ctx.fillStyle = cavity;
                ctx.fillRect(0, 0, w, h);
                ctx.save();
                ctx.translate(dx, dy);
                ctx.clip(capPath);
                ctx.drawImage(texture, 0, 0, w, h);
                ctx.restore();
                // The real chassis lip remains in the source photograph. Its local inner
                // contact shade strengthens slightly as the cap reaches the bottom stop.
                ctx.strokeStyle = `rgba(0,12,10,${.16 + .2 * q})`;
                ctx.lineWidth = .65 + .5 * q;
                ctx.lineJoin = 'round';
                ctx.shadowColor = 'rgba(0,9,8,.32)';
                ctx.shadowBlur = .6 + .5 * q;
                ctx.stroke(capPath);
                ctx.shadowBlur = 0;
            }
            // At rest the bitmap is intentionally untouched: its exact cap color,
            // silhouette, highlight and single bevel remain the approved photograph.
            const labelX = w / 2 - 2 + dx, labelY = h / 2 - 1 + dy;
            ctx.font = `500 15px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = dark ? 'rgba(1,31,34,.45)' : 'rgba(255,255,245,.5)';
            ctx.fillText(state.label, labelX, labelY + .6);
            ctx.fillStyle = dark ? '#f7f4e9' : '#292b25';
            ctx.fillText(state.label, labelX, labelY);
            ctx.beginPath();
            ctx.arc(w - 11.75 + dx, labelY - .6, 1.65, 0, Math.PI * 2);
            ctx.fillStyle = state.latched && powered ? '#eab272' : dark ? '#315851' : '#9b8e76';
            ctx.fill();
            ctx.lineWidth = .55;
            ctx.strokeStyle = dark ? '#05272b66' : '#6b5c4766';
            ctx.stroke();
            ctx.restore();
            state.element.dataset.depth = state.depth.toFixed(3);
            state.element.dataset.held = String(state.held);
            state.surfaceTransform = `translate3d(${dx.toFixed(3)}px,${dy.toFixed(3)}px,0)`;
        }
        function evaluate(state: KeyState, now: number) {
            if (!state.frame)
                return;
            const t = Math.min(.8, (now - state.start) / 1000), omega = state.omega;
            const decay = Math.exp(-omega * t), b = state.initialVelocity + omega * state.offset;
            let depth = state.target + (state.offset + b * t) * decay;
            let velocity = (state.initialVelocity - omega * b * t) * decay;
            const low = Math.min(state.from, state.target), high = Math.max(state.from, state.target);
            if (depth < low || depth > high) {
                depth = Math.max(low, Math.min(high, depth));
                velocity = 0;
            }
            state.depth = depth;
            state.velocity = velocity;
        }
        function aim(state: KeyState, instant = false) {
            const now = performance.now();
            evaluate(state, now);
            if (state.frame)
                cancelAnimationFrame(state.frame);
            state.frame = 0;
            const target = state.held ? FULL_TRAVEL : (state.latched ? LATCH_TRAVEL : 0);
            state.target = target;
            if (instant || reduced() || Math.abs(target - state.depth) < .004) {
                state.depth = target;
                state.velocity = 0;
                paint(state);
                return;
            }
            state.from = state.depth;
            state.offset = state.depth - target;
            state.start = now;
            // Overdamped-looking motion with a firm stop. Preserve velocity only when
            // it points toward the new target; a returning key cannot spring above rest.
            state.initialVelocity = state.velocity * (target - state.depth) > 0 ? state.velocity : 0;
            state.omega = state.held ? 64 : 38;
            const tick = (time: number) => {
                if (dead())
                    return;
                evaluate(state, time);
                paint(state);
                if (Math.abs(state.depth - state.target) < .006 && Math.abs(state.velocity) < .3) {
                    state.depth = state.target;
                    state.velocity = 0;
                    state.frame = 0;
                    paint(state);
                }
                else
                    state.frame = requestAnimationFrame(tick);
            };
            state.frame = requestAnimationFrame(tick);
        }
        function release(state: KeyState) {
            state.held = false;
            state.pointerId = null;
            aim(state);
        }
        const keys = regions.map(region => {
            const element = el('button', 'ri-key');
            element.type = 'button';
            element.dataset.instrumentMode = region.id;
            project(element, region, crop);
            const canvas = el('canvas', 'ri-key-mechanism');
            canvas.width = region.width * DENSITY;
            canvas.height = region.height * DENSITY;
            canvas.setAttribute('aria-hidden', 'true');
            element.append(canvas);
            const h = homography(region);
            const label = region.label || region.id[0].toUpperCase() + region.id.slice(1);
            const sampled = material(region, h);
            const state: KeyState = { id: region.id, region, element, canvas, label, ctx: context2d(canvas), texture: sampled.texture, capPath: sampled.path, normal: sourceNormalInPlane(region, h),
                depth: 0, target: 0, velocity: 0, frame: 0, held: false, latched: false, pointerId: null, cancelClick: false, surfaceTransform: '', start: 0, omega: 0, initialVelocity: 0, offset: 0, from: 0 };
            states.push(state);
            on(element, 'pointerdown', event => {
                if (event.button !== 0 || dead())
                    return;
                state.held = true;
                state.pointerId = event.pointerId;
                state.cancelClick = false;
                aim(state);
            });
            on(element, 'pointerleave', event => {
                if (event.pointerType === 'mouse' && state.held) {
                    state.cancelClick = true;
                    release(state);
                }
            });
            on(element, 'pointercancel', () => { state.cancelClick = true; release(state); });
            on(element, 'keydown', event => {
                if (event.key !== ' ' && event.key !== 'Enter')
                    return;
                if (event.repeat) {
                    event.preventDefault();
                    return;
                }
                state.held = true;
                aim(state);
            });
            on(element, 'keyup', event => { if (event.key === ' ' || event.key === 'Enter')
                release(state); });
            on(element, 'blur', () => release(state));
            on(element, 'click', event => {
                if (event.detail > 0 && state.cancelClick) {
                    state.cancelClick = false;
                    return;
                }
                if (!dead())
                    onMode?.(region.id);
            });
            board.append(element);
            return { ...region, element };
        });
        on(window, 'pointerup', event => { for (const state of states)
            if (state.pointerId === event.pointerId)
                release(state); });
        on(window, 'pointercancel', event => { for (const state of states)
            if (state.pointerId === event.pointerId) {
                state.cancelClick = true;
                release(state);
            } });
        on(window, 'pointermove', event => {
            for (const state of states)
                if (state.pointerId === event.pointerId && state.held) {
                    const r = state.element.getBoundingClientRect();
                    // The expanded hit area remains forgiving on touch. Once a gesture moves
                    // away from it, releasing the pointer cannot unexpectedly select a key.
                    const pad = event.pointerType === 'touch' ? 16 : 3;
                    if (event.clientX < r.left - pad || event.clientX > r.right + pad || event.clientY < r.top - pad || event.clientY > r.bottom + pad) {
                        state.cancelClick = true;
                        release(state);
                    }
                }
        }, { passive: true });
        const api = {
            keys,
            render(mode: Mode, { instant = false, powered: nextPowered = true }: KeyRenderOptions = {}) {
                if (dead())
                    return;
                activeMode = mode;
                powered = nextPowered;
                for (const state of states) {
                    state.latched = state.id === activeMode;
                    state.element.setAttribute('aria-pressed', String(state.latched));
                    state.element.setAttribute('aria-label', state.label + (powered ? (state.latched ? ': release to Home' : ': choose what to look at') : (state.latched ? ': turn on and restore this view' : ': turn on and select this view')));
                    aim(state, instant);
                }
            },
            finishMotion() { for (const state of states) {
                state.held = false;
                state.pointerId = null;
                aim(state, true);
            } },
            releaseAll() { for (const state of states)
                release(state); },
            getSnapshot() { return states.map(state => ({ id: state.id, depth: state.depth, target: state.target, held: state.held, latched: state.latched, surfaceTransform: state.surfaceTransform, moving: !!state.frame })); },
            dispose: cleanup,
        };
        api.render(activeMode, { instant: true });
        // Font readiness may follow the first image paint; redraw once instead of
        // changing the layout or running an idle animation.
        document.fonts?.ready.then(() => { if (!dead())
            for (const state of states)
                paint(state); });
        return api;
    }
    catch (error) {
        cleanup();
        throw error;
    }
}
