export function context2d(canvas: HTMLCanvasElement, options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D {
    const context = canvas.getContext('2d', options);
    if (!context)
        throw new Error('The instrument requires a 2D canvas context.');
    return context;
}
/** DOM controls share this lifecycle-aware, typed event registration. */
export function listen<K extends keyof GlobalEventHandlersEventMap>(target: EventTarget, type: K, listener: (event: GlobalEventHandlersEventMap[K]) => void, options?: AddEventListenerOptions | boolean): () => void {
    const callback = listener as EventListener;
    target.addEventListener(type, callback, options);
    return () => target.removeEventListener(type, callback, options);
}
/** All injected rules are descendants of the isolated instrument root. */
export function scopeInstrumentCss(css: string): string {
    return css.replace(/(^|[{},])([ \t\n]*)(\.ri-[^{}]+)(?=\{)/g, (_match, boundary: string, whitespace: string, selectors: string) => {
        const scoped = selectors.split(',').map(selector => {
            const trimmed = selector.trim();
            return /^\.ri-art(?:\b|\[)/.test(trimmed) ? trimmed : `.ri-art ${trimmed}`;
        });
        return `${boundary}${whitespace}${scoped.join(', ')}`;
    });
}
/** Shared immutable styles use reference counting for concurrent and StrictMode mounts. */
const styles = new Map<string, {
    element: HTMLStyleElement;
    count: number;
}>();
export function installScopedStyle(id: string, css: string): () => void {
    let record = styles.get(id);
    if (!record) {
        const element = document.createElement('style');
        element.dataset.instrumentStyle = id;
        element.textContent = scopeInstrumentCss(css);
        document.head.append(element);
        record = { element, count: 0 };
        styles.set(id, record);
    }
    record.count += 1;
    let released = false;
    return () => {
        if (released)
            return;
        released = true;
        if (--record.count === 0) {
            record.element.remove();
            styles.delete(id);
        }
    };
}
