import type { Crop, ElementFactory, Project } from './types';
import { context2d, installScopedStyle, listen as registerListener } from './dom';
interface PowerOptions {
    board: HTMLElement;
    plate: HTMLImageElement;
    crop: Crop;
    project: Project;
    el: ElementFactory;
    onToggle: () => void;
}
// The existing brass side control becomes a momentary power switch. The
// photograph supplies its material; the case and the receiving slot stay fixed.
export function createPower({ board, plate, crop, project, el, onToggle }: PowerOptions) {
    const removeStyle = installScopedStyle('instrument-power-styles', `
  .ri-power { position:absolute; border:0; background:none; padding:0; cursor:pointer; z-index:4;
    -webkit-tap-highlight-color:transparent; touch-action:pan-y; border-radius:12px; }
  .ri-power:active { transform:none; }
  .ri-power:focus-visible { outline:2px solid hsl(var(--surface-page)); outline-offset:3px; }
  .ri-power-well { position:absolute; width:38px; height:96px; left:50%; top:50%; margin:-48px 0 0 -19px;
    clip-path:polygon(38% 7%,75% 5%,91% 12%,66% 87%,46% 94%,13% 91%,11% 79%); }
  .ri-power-slot { position:absolute; inset:0; background:#51391f; opacity:0; }
  .ri-power-cap { position:absolute; inset:0; background-repeat:no-repeat; will-change:transform;
    transition:transform 110ms cubic-bezier(.2,.8,.2,1); }
  .ri-power-material { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
  .ri-power[data-held=true] .ri-power-cap { transform:translate(-2.2px,.6px); }
  .ri-power[data-held=true] .ri-power-slot { opacity:1; }
  .ri-power-symbol { position:absolute; left:49%; top:35%; width:9px; height:12px;
    border:1px solid #492c17; border-top-color:transparent; border-radius:50%; transform:rotate(13deg);
    box-shadow:.5px .5px .5px #f6d5a74d; pointer-events:none; }
  .ri-power-symbol:before { content:''; position:absolute; width:1px;height:6px;background:#492c17;
    left:3px;top:-3px;box-shadow:.5px .5px .5px #f6d5a74d; }
  .ri-sleep-glass { position:absolute; left:0;top:0;transform-origin:0 0;border-radius:25px;overflow:hidden;
    background:linear-gradient(136deg,#25342f 0%,#17231f 38%,#101b18 100%);
    box-shadow:inset 4px 5px 9px #0009,inset -1px -2px 2px #82918330;
    opacity:0;pointer-events:none;transition:opacity 200ms ease; }
  .ri-sleep-glass:after { content:'';position:absolute;inset:0;
    background:linear-gradient(130deg,#dbe4cb14,transparent 45%,#f4ecd403 73%,transparent); }
  .ri-art[data-powered=false] .ri-sleep-glass { opacity:1; }
  .ri-art[data-powered=false] .ri-paper { opacity:0; }
  .ri-power-lamp { position:absolute;width:10px;height:10px;border-radius:50%;pointer-events:none;
    background:#edb66a;box-shadow:0 0 5px #f5c67985,inset .8px .8px 2px #fff9;
    transition:background 160ms,box-shadow 160ms; }
  .ri-art[data-powered=false] .ri-power-lamp { background:#6b563f;box-shadow:inset 1px 1px 2px #302518aa; }
  @media(prefers-reduced-motion:reduce) { .ri-power-cap,.ri-sleep-glass,.ri-power-lamp { transition:none; } }
  `);
    const glass = el('div', 'ri-sleep-glass');
    glass.setAttribute('aria-hidden', 'true');
    // Inset to the photographed sheet's boundary, leaving the bezel untouched.
    project(glass, { width: 520, height: 365, corners: [[891, 180], [1416, 215], [1341, 584], [791, 521]] }, crop);
    const button = el('button', 'ri-power');
    button.type = 'button';
    button.setAttribute('role', 'switch');
    button.setAttribute('aria-label', 'Instrument power');
    button.setAttribute('aria-checked', 'true');
    button.title = 'Turn instrument off';
    button.dataset.held = 'false';
    const well = el('span', 'ri-power-well'), slot = el('span', 'ri-power-slot'), cap = el('span', 'ri-power-cap');
    // Reuse the already decoded plate. A CSS background starts another image
    // request when the cold-load browser cache is disabled or revalidating.
    const material = el('canvas', 'ri-power-material');
    material.width = 38;
    material.height = 96;
    context2d(material).drawImage(plate, 1444, 312, 38, 96, 0, 0, 38, 96);
    const symbol = el('span', 'ri-power-symbol');
    cap.append(material, symbol);
    well.append(slot, cap);
    button.append(well);
    const lamp = el('span', 'ri-power-lamp');
    Object.assign(lamp.style, { left: (1399 - crop.x - 5) + 'px', top: (188 - crop.y - 5) + 'px' });
    board.append(glass, lamp, button);
    let held: number | null = null;
    let cancelled = false;
    const listeners: (() => void)[] = [];
    const listen = <K extends keyof GlobalEventHandlersEventMap>(node: EventTarget, type: K, fn: (event: GlobalEventHandlersEventMap[K]) => void) => { listeners.push(registerListener(node, type, fn)); };
    function release() { held = null; button.dataset.held = 'false'; }
    listen(button, 'pointerdown', event => { if (event.button !== 0)
        return; held = event.pointerId; cancelled = false; button.dataset.held = 'true'; });
    listen(button, 'pointerleave', event => { if (event.pointerType === 'mouse' && held !== null) {
        cancelled = true;
        release();
    } });
    listen(button, 'pointercancel', () => { cancelled = true; release(); });
    listen(window, 'pointerup', event => { if (event.pointerId === held)
        release(); });
    listen(window, 'pointercancel', event => { if (event.pointerId === held) {
        cancelled = true;
        release();
    } });
    listen(button, 'keydown', event => { if (event.key === ' ' || event.key === 'Enter') {
        if (event.repeat) {
            event.preventDefault();
            return;
        }
        button.dataset.held = 'true';
    } });
    listen(button, 'keyup', event => { if (event.key === ' ' || event.key === 'Enter')
        release(); });
    listen(button, 'blur', release);
    listen(window, 'blur', release);
    listen(button, 'click', event => { if (event.detail > 0 && cancelled) {
        cancelled = false;
        return;
    } onToggle(); });
    return {
        element: button,
        setPowered(value: boolean) { button.setAttribute('aria-checked', String(value)); button.title = value ? 'Turn instrument off' : 'Turn instrument on'; },
        resize(scale: number) {
            const w = Math.max(48 / scale, 44), h = Math.max(48 / scale, 100);
            Object.assign(button.style, { left: (1463 - crop.x - w / 2) + 'px', top: (360 - crop.y - h / 2) + 'px', width: w + 'px', height: h + 'px' });
        },
        finishMotion: release,
        dispose() { listeners.forEach(fn => fn()); removeStyle(); glass.remove(); lamp.remove(); button.remove(); },
    };
}
