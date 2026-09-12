import { context2d, listen as addListener } from './dom';
import type { Crop, InstrumentGeometry } from './types';
interface DialOptions {
    board: HTMLElement;
    plate: CanvasImageSource;
    geometry: InstrumentGeometry;
    crop?: Crop;
    onStage?: (index: number) => void;
    initialStage?: number;
    stageLabels?: readonly string[];
    fontFamily: string;
}
interface PointerState {
    id: number;
    type: string;
    startX: number;
    startY: number;
    startBoardX: number;
    startAngle: number;
    lastPointerAngle: number;
    travel: number;
    dragging: boolean;
    strategy: 'horizontal' | 'angular';
}
type PointEvent = Pick<MouseEvent, 'clientX' | 'clientY'>;
type EndPointerEvent = Pick<Event, 'type'> & Partial<Pick<PointerEvent, 'pointerId'>>;
// A photographed rotary switch: the illumination and knurled sidewall stay
// anchored while its inset index and the fine machined grain follow the hand.
const STOPS = [-38, 0, 38];
const INDEX_BEARING = -81;
const radians = (degrees: number) => degrees * Math.PI / 180;
const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));
const nearestStop = (angle: number) => clamp(Math.round(angle / 38) + 1, 0, 2);
const wrapDelta = (angle: number) => ((angle + 540) % 360) - 180;
export function createDial({ board, plate, geometry, crop = geometry.crop, onStage, initialStage = 1, stageLabels = ['On paper', 'Recruiter’s read', 'Next move'], fontFamily }: DialOptions) {
    const { dial } = geometry;
    const sourceRadiusX = dial.radiusX - 3;
    const sourceRadiusY = dial.radiusY - 3;
    const center = { x: dial.x - crop.x, y: dial.y - crop.y };
    let index = clamp(initialStage, 0, 2);
    let angle = STOPS[index], target = angle, velocity = 0;
    let frame = 0, lastFrame = 0, disposed = false, enabled = true, directMarks = true;
    let pointer: PointerState | null = null;
    let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ignorePointerClickUntil = 0;
    const listeners: Array<() => void> = [];
    const diameter = 248, density = 3;
    const face = document.createElement('canvas');
    face.className = 'ri-dial-face';
    face.setAttribute('aria-hidden', 'true');
    face.width = diameter * density;
    face.height = diameter * density;
    Object.assign(face.style, {
        position: 'absolute', pointerEvents: 'none', left: (center.x - diameter / 2) + 'px', top: (center.y - diameter / 2) + 'px',
        width: diameter + 'px', height: diameter + 'px',
    });
    const grainFace = face.cloneNode(false) as HTMLCanvasElement;
    grainFace.className = 'ri-dial-machining';
    grainFace.style.mixBlendMode = 'soft-light';
    grainFace.style.opacity = '.27';
    const engraving = document.createElement('div');
    engraving.className = 'ri-engraving';
    engraving.textContent = 'A closer look';
    Object.assign(engraving.style, { left: (1170 - crop.x) + 'px', top: (763 - crop.y) + 'px', fontSize: '8px', letterSpacing: '1.6px' });
    const control = document.createElement('button');
    control.className = 'ri-dial';
    control.type = 'button';
    Object.assign(control.style, {
        position: 'absolute', left: (center.x - 56) + 'px', top: (center.y - 64) + 'px', width: '112px', height: '128px',
        touchAction: 'pan-y', cursor: 'grab', background: 'transparent', border: '0', borderRadius: '50%', padding: '0',
    });
    control.dataset.rotary = 'true';
    control.setAttribute('role', 'slider');
    control.setAttribute('aria-roledescription', 'rotary selector');
    control.setAttribute('aria-valuemin', '1');
    control.setAttribute('aria-valuemax', '3');
    control.setAttribute('aria-description', 'Three positions: 01 On paper, 02 Recruiter’s read, 03 Next move. Drag around the dial or left and right. Choose a numbered position directly, or use arrow keys, Home, and End.');
    board.append(grainFace, face, engraving, control);
    const markPositions = [
        { paint: [1115, 694], hit: [1129, 699] },
        { paint: [1121, 613], hit: [1129, 615] },
        { paint: [1177, 574], hit: [1177, 563] },
    ];
    const marks = markPositions.map((position, markIndex) => {
        const button = document.createElement('button');
        button.className = 'ri-dial-detent';
        button.type = 'button';
        button.dataset.stageIndex = String(markIndex);
        button.setAttribute('aria-label', `${String(markIndex + 1).padStart(2, '0')}: ${stageLabels[markIndex]}`);
        Object.assign(button.style, { position: 'absolute', width: '44px', height: '44px', border: 0, background: 'transparent',
            borderRadius: '12px', padding: 0, cursor: 'pointer', touchAction: 'manipulation', outlineOffset: '1px',
            left: (position.hit[0] - crop.x - 22) + 'px', top: (position.hit[1] - crop.y - 22) + 'px' });
        board.append(button);
        return button;
    });
    // Extract only high-frequency machining detail. Rotating the complete
    // photograph would rotate the light source and make this solid knob look flat.
    const grain = document.createElement('canvas');
    const grainSize = 256;
    grain.width = grainSize;
    grain.height = grainSize;
    const grainContext = context2d(grain);
    const texture = document.createElement('canvas');
    texture.width = grainSize;
    texture.height = grainSize;
    const textureContext = context2d(texture);
    textureContext.translate(grainSize / 2, grainSize / 2);
    textureContext.scale(grainSize / (sourceRadiusX * 2), grainSize / (sourceRadiusY * 2));
    textureContext.rotate(-radians(dial.rotation));
    textureContext.drawImage(plate, -dial.x, -dial.y, geometry.sourceWidth, geometry.sourceHeight);
    const blurred = document.createElement('canvas');
    blurred.width = grainSize;
    blurred.height = grainSize;
    const blurContext = context2d(blurred);
    blurContext.filter = 'blur(3px)';
    blurContext.drawImage(texture, 0, 0);
    const original = textureContext.getImageData(0, 0, grainSize, grainSize);
    const lowFrequency = blurContext.getImageData(0, 0, grainSize, grainSize);
    const detail = grainContext.createImageData(grainSize, grainSize);
    for (let y = 0; y < grainSize; y++)
        for (let x = 0; x < grainSize; x++) {
            const at = (y * grainSize + x) * 4;
            const radius = Math.hypot((x - grainSize / 2) / (grainSize / 2), (y - grainSize / 2) / (grainSize / 2));
            for (let c = 0; c < 3; c++)
                detail.data[at + c] = clamp(128 + (original.data[at + c] - lowFrequency.data[at + c]) * 1.1, 0, 255);
            detail.data[at + 3] = clamp((.96 - radius) * 30, 0, 1) * 255;
        }
    grainContext.putImageData(detail, 0, 0);
    function listen<K extends keyof GlobalEventHandlersEventMap>(element: EventTarget, type: K, callback: (event: GlobalEventHandlersEventMap[K]) => void, options?: AddEventListenerOptions | boolean) {
        listeners.push(addListener(element, type, callback, options));
    }
    function label() {
        control.setAttribute('aria-label', enabled ? 'A closer look' : 'A closer look. Choose Story, Impact, or Fit to use the dial.');
        control.setAttribute('aria-valuenow', String(index + 1));
        control.setAttribute('aria-valuetext', stageLabels[index]);
        control.setAttribute('aria-disabled', String(!enabled));
        control.tabIndex = enabled ? 0 : -1;
        control.dataset.stageIndex = String(index);
        control.dataset.enabled = String(enabled);
        control.style.cursor = enabled ? 'grab' : 'default';
        marks.forEach((mark, markIndex) => {
            mark.setAttribute('aria-pressed', String(enabled && index === markIndex));
            mark.setAttribute('aria-disabled', String(!enabled));
            mark.tabIndex = enabled && directMarks ? 0 : -1;
            mark.style.pointerEvents = enabled && directMarks ? 'auto' : 'none';
            mark.style.visibility = directMarks ? 'visible' : 'hidden';
        });
    }
    function draw() {
        if (disposed)
            return;
        const ctx = context2d(face);
        ctx.setTransform(density, 0, 0, density, 0, 0);
        ctx.clearRect(0, 0, diameter, diameter);
        const detailContext = context2d(grainFace);
        detailContext.setTransform(density, 0, 0, density, 0, 0);
        detailContext.clearRect(0, 0, diameter, diameter);
        detailContext.save();
        detailContext.translate(diameter / 2, diameter / 2);
        detailContext.rotate(radians(dial.rotation));
        detailContext.scale(sourceRadiusX, sourceRadiusY);
        detailContext.rotate(radians(angle));
        detailContext.drawImage(grain, -1, -1, 2, 2);
        detailContext.restore();
        ctx.save();
        ctx.translate(diameter / 2, diameter / 2);
        ctx.rotate(radians(dial.rotation));
        ctx.scale(sourceRadiusX, sourceRadiusY);
        for (const stop of STOPS) {
            ctx.save();
            ctx.rotate(radians(INDEX_BEARING + stop));
            ctx.strokeStyle = '#152d2c';
            ctx.lineWidth = .022;
            ctx.beginPath();
            ctx.moveTo(.006, -1.13);
            ctx.lineTo(.006, -1.235);
            ctx.stroke();
            ctx.strokeStyle = '#ddd2b9b8';
            ctx.lineWidth = .012;
            ctx.beginPath();
            ctx.moveTo(0, -1.13);
            ctx.lineTo(0, -1.235);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        ctx.save();
        ctx.translate(diameter / 2 - center.x, diameter / 2 - center.y);
        ctx.font = `500 9px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        markPositions.forEach((position, markIndex) => {
            const [x, y] = position.paint;
            ctx.save();
            ctx.translate(x - crop.x, y - crop.y);
            ctx.rotate(radians(7));
            ctx.fillStyle = '#082e32aa';
            ctx.fillText(String(markIndex + 1).padStart(2, '0'), .25, .8);
            ctx.fillStyle = enabled ? '#e2d9c4c9' : '#c5c3ad80';
            ctx.fillText(String(markIndex + 1).padStart(2, '0'), 0, 0);
            ctx.restore();
        });
        ctx.restore();
        ctx.save();
        ctx.translate(diameter / 2, diameter / 2);
        ctx.rotate(radians(dial.rotation));
        ctx.scale(sourceRadiusX, sourceRadiusY);
        ctx.beginPath();
        ctx.arc(0, 0, .995, 0, Math.PI * 2);
        ctx.clip();
        // Perspective is applied outside the rotation so the mark travels around
        // the photographed ellipse, rather than an arbitrary screen-space circle.
        ctx.rotate(radians(INDEX_BEARING + angle));
        // An incised witness mark, the color of shaded brass. Its pale lip and
        // narrow inner shadow sit in the face instead of reading as an applied bar.
        const slotY = -.91, slotLength = .235;
        ctx.globalAlpha = enabled ? 1 : .65;
        ctx.strokeStyle = '#fff0c3b0';
        ctx.lineWidth = .027;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(.005, slotY + .004);
        ctx.lineTo(.005, slotY + slotLength + .004);
        ctx.stroke();
        ctx.strokeStyle = '#514638b8';
        ctx.lineWidth = .021;
        ctx.beginPath();
        ctx.moveTo(0, slotY);
        ctx.lineTo(0, slotY + slotLength);
        ctx.stroke();
        ctx.strokeStyle = '#71624bae';
        ctx.lineWidth = .009;
        ctx.beginPath();
        ctx.moveTo(-.003, slotY + .008);
        ctx.lineTo(-.003, slotY + slotLength - .007);
        ctx.stroke();
        ctx.restore();
        control.dataset.angle = angle.toFixed(3);
        control.dataset.dragging = String(Boolean(pointer?.dragging));
    }
    function stopAnimation() {
        if (frame)
            cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        velocity = 0;
    }
    function settle(next: number, instant = false) {
        target = STOPS[clamp(next, 0, 2)];
        if (disposed)
            return;
        if (reducedMotion || instant || document.hidden) {
            stopAnimation();
            angle = target;
            draw();
            return;
        }
        if (Math.abs(target - angle) < .015 && Math.abs(velocity) < .03) {
            stopAnimation();
            angle = target;
            draw();
            return;
        }
        if (frame)
            return;
        const started = performance.now();
        const tick = (now: number) => {
            if (disposed)
                return;
            const dt = Math.min((now - (lastFrame || now - 16.67)) / 1000, .032);
            lastFrame = now;
            // A well-damped torsion spring. There is one soft mechanical catch,
            // never a wobbling or continuously running decorative animation.
            velocity += (target - angle) * 520 * dt;
            velocity *= Math.exp(-32 * dt);
            angle += velocity * dt;
            if ((Math.abs(target - angle) < .018 && Math.abs(velocity) < .12) || now - started > 750) {
                angle = target;
                velocity = 0;
                frame = 0;
                lastFrame = 0;
                draw();
                return;
            }
            draw();
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
    }
    function emit(next: number) {
        if (!enabled)
            return;
        const picked = clamp(next, 0, 2);
        if (picked === index)
            return;
        index = picked;
        target = STOPS[index];
        label();
        onStage?.(index);
    }
    function localPoint(event: PointEvent) {
        const rect = board.getBoundingClientRect();
        const scale = rect.width / geometry.crop.width;
        const dx = (event.clientX - rect.left) / scale - center.x;
        const dy = (event.clientY - rect.top) / scale - center.y;
        const c = Math.cos(radians(dial.rotation)), s = Math.sin(radians(dial.rotation));
        const x = (dx * c + dy * s) / sourceRadiusX, y = (-dx * s + dy * c) / sourceRadiusY;
        return { x, y, radius: Math.hypot(x, y), angle: Math.atan2(x, -y) * 180 / Math.PI, boardX: dx, scale };
    }
    function resisted(raw: number) {
        if (raw < STOPS[0])
            return STOPS[0] - 6 * (1 - Math.exp((raw - STOPS[0]) / 13));
        if (raw > STOPS[2])
            return STOPS[2] + 6 * (1 - Math.exp(-(raw - STOPS[2]) / 13));
        const closest = STOPS[nearestStop(raw)], distance = raw - closest;
        return raw - distance * .24 * Math.exp(-(distance * distance) / 45);
    }
    function selectFromDrag() {
        // The small dead band prevents a resting hand chattering between states.
        if (index < 2 && angle > (STOPS[index] + STOPS[index + 1]) / 2 + 1.5)
            emit(nearestStop(angle));
        else if (index > 0 && angle < (STOPS[index] + STOPS[index - 1]) / 2 - 1.5)
            emit(nearestStop(angle));
    }
    function startPointer(event: PointerEvent) {
        if (disposed || !enabled || pointer || event.button !== 0)
            return;
        ignorePointerClickUntil = 0;
        const point = localPoint(event);
        stopAnimation();
        pointer = { id: event.pointerId, type: event.pointerType, startX: event.clientX, startY: event.clientY, startBoardX: point.boardX,
            startAngle: angle, lastPointerAngle: point.angle, travel: 0, dragging: false, strategy: point.radius < .42 ? 'horizontal' : 'angular' };
        control.style.cursor = 'grabbing';
        if (event.pointerType !== 'touch')
            control.setPointerCapture(event.pointerId);
    }
    function movePointer(event: PointerEvent) {
        if (!pointer || event.pointerId !== pointer.id || disposed)
            return;
        const dx = event.clientX - pointer.startX, dy = event.clientY - pointer.startY;
        if (!pointer.dragging) {
            if (pointer.type === 'touch') {
                // Leave vertical travel to browser page scrolling. Only a deliberate
                // horizontal gesture claims the dial; pointercancel remains native.
                if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * 1.2)
                    return;
                pointer.strategy = 'horizontal';
                control.setPointerCapture(event.pointerId);
            }
            else if (Math.hypot(dx, dy) < 4)
                return;
            pointer.dragging = true;
            control.classList.add('ri-dial-grab');
        }
        const point = localPoint(event);
        if (pointer.strategy === 'angular') {
            if (point.radius < .2)
                return;
            pointer.travel += wrapDelta(point.angle - pointer.lastPointerAngle);
            pointer.lastPointerAngle = point.angle;
        }
        else
            pointer.travel = (point.boardX - pointer.startBoardX) * .82;
        angle = resisted(pointer.startAngle + pointer.travel);
        draw();
        selectFromDrag();
    }
    function endPointer(event: EndPointerEvent) {
        if (!pointer || (event.pointerId !== undefined && event.pointerId !== pointer.id))
            return;
        const ended = pointer;
        pointer = null;
        control.classList.remove('ri-dial-grab');
        control.style.cursor = enabled ? 'grab' : 'default';
        if (control.hasPointerCapture(ended.id))
            control.releasePointerCapture(ended.id);
        const cancelled = event.type !== 'pointerup';
        if (ended.dragging || cancelled)
            ignorePointerClickUntil = performance.now() + 400;
        if (ended.dragging && !cancelled)
            emit(nearestStop(angle));
        settle(index);
        draw();
    }
    function click(event: MouseEvent) {
        if (disposed || !enabled || event.detail === 0)
            return;
        if (event.detail !== 0 && performance.now() < ignorePointerClickUntil)
            return;
        const point = localPoint(event);
        // The center is a grip, not a fourth button. Only a deliberate tap toward
        // the labeled left arc chooses a position; clicks never cycle or wrap.
        const bearing = wrapDelta(point.angle - INDEX_BEARING);
        if (point.radius < .62 || Math.abs(bearing) > 62)
            return;
        emit(nearestStop(bearing));
        settle(index);
    }
    function keyDown(event: KeyboardEvent) {
        if (!enabled)
            return;
        const keys: Record<string, number> = { ArrowRight: index + 1, ArrowUp: index + 1, ArrowLeft: index - 1, ArrowDown: index - 1, Home: 0, End: 2 };
        if (!(event.key in keys))
            return;
        event.preventDefault();
        emit(keys[event.key]);
        settle(index);
    }
    function finishMotion() {
        if (pointer)
            endPointer({ type: 'cancel' });
        stopAnimation();
        angle = STOPS[index];
        target = angle;
        draw();
    }
    listen(control, 'pointerdown', startPointer);
    listen(control, 'pointermove', movePointer);
    listen(control, 'pointerup', endPointer);
    listen(control, 'pointercancel', endPointer);
    listen(control, 'lostpointercapture', endPointer);
    listen(control, 'click', click);
    listen(control, 'keydown', keyDown);
    marks.forEach((mark, markIndex) => listen(mark, 'click', () => { if (enabled) {
        emit(markIndex);
        settle(index);
    } }));
    listen(window, 'blur', () => { if (pointer)
        endPointer({ type: 'blur' }); });
    const onVisibilityChange = () => { if (document.hidden)
        finishMotion(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    listeners.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));
    function resizeTargets() {
        if (disposed)
            return;
        const rect = board.getBoundingClientRect(), scale = rect.width / geometry.crop.width || 1;
        directMarks = scale >= .86;
        marks.forEach((mark, markIndex) => {
            const size = 44.5 / scale, position = markPositions[markIndex].hit;
            Object.assign(mark.style, { width: size + 'px', height: size + 'px', left: (position[0] - crop.x - size / 2) + 'px', top: (position[1] - crop.y - size / 2) + 'px' });
        });
        const width = Math.max(112, 44.5 / scale), height = Math.max(128, 44.5 / scale);
        Object.assign(control.style, { width: width + 'px', height: height + 'px', left: (center.x - width / 2) + 'px', top: (center.y - height / 2) + 'px' });
        label();
    }
    // The parent scales the board with a transform after its own container resize
    // callback. A board ResizeObserver cannot see that transform-only change.
    // Observe that specific style mutation and measure after it has been applied.
    let targetsFrame = 0;
    function scheduleTargets() {
        if (disposed)
            return;
        if (targetsFrame)
            cancelAnimationFrame(targetsFrame);
        targetsFrame = requestAnimationFrame(() => { targetsFrame = 0; resizeTargets(); });
    }
    const resizeObserver = new ResizeObserver(scheduleTargets);
    resizeObserver.observe(board);
    const transformObserver = new MutationObserver(scheduleTargets);
    transformObserver.observe(board, { attributes: true, attributeFilter: ['style'] });
    listen(window, 'resize', scheduleTargets);
    const attachFrame = requestAnimationFrame(() => {
        if (disposed)
            return;
        if (board.parentElement)
            resizeObserver.observe(board.parentElement);
        scheduleTargets();
    });
    resizeTargets();
    label();
    draw();
    // A font download must not delay interaction; repaint engraving once it
    // settles. draw() guards disposal and preserves the current dial angle.
    void document.fonts?.ready.then(draw);
    return {
        element: control,
        setStage(next: number) {
            if (disposed)
                return;
            index = enabled ? clamp(next, 0, 2) : 1;
            target = STOPS[index];
            label();
            // The callback may synchronously repaint the report while a hand is
            // between stops. Updating content must never pull the knob from the hand.
            if (!pointer?.dragging)
                settle(index);
        },
        setEnabled(value: boolean, { park = true } = {}) {
            const next = Boolean(value);
            if (disposed || enabled === next)
                return;
            enabled = next;
            if (!enabled) {
                if (pointer)
                    endPointer({ type: 'cancel' });
                stopAnimation();
                if (park) {
                    index = 1;
                    target = 0;
                    angle = 0;
                }
                else {
                    angle = target;
                }
            }
            label();
            draw();
        },
        setReducedMotion(value: boolean) { reducedMotion = Boolean(value); if (reducedMotion)
            finishMotion(); },
        finishMotion,
        getSnapshot() {
            const rect = control.getBoundingClientRect();
            return { angle, target, index, enabled, directMarks, moving: Boolean(frame), dragging: Boolean(pointer?.dragging), strategy: pointer?.strategy || null,
                control: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
                detents: marks.map((mark, markIndex) => { const r = mark.getBoundingClientRect(); return { index: markIndex, x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height, interactive: enabled && directMarks }; }),
                projection: { center: localPoint({ clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 }),
                    radiusX: sourceRadiusX, radiusY: sourceRadiusY, rotation: dial.rotation, indexBearing: INDEX_BEARING, stops: [...STOPS] },
            };
        },
        dispose() {
            if (disposed)
                return;
            finishMotion();
            disposed = true;
            cancelAnimationFrame(attachFrame);
            if (targetsFrame)
                cancelAnimationFrame(targetsFrame);
            resizeObserver.disconnect();
            transformObserver.disconnect();
            listeners.forEach(remove => remove());
            marks.forEach(mark => mark.remove());
            grainFace.remove();
            face.remove();
            engraving.remove();
            control.remove();
        },
    };
}
