import materials from './key-materials.json';
import { geometry as approvedGeometry } from './reference-geometry';
import type { InstrumentGeometry, KeyRegion, ModeId } from './types';

interface PreparedKeyMaterial {
    x: number;
    y: number;
    width: number;
    height: number;
    region: KeyRegion;
    contour: [number, number][];
}

export interface PreparedKeyMaterials {
    atlas: HTMLImageElement;
    regions: Record<ModeId, PreparedKeyMaterial>;
}

let prepared: Promise<PreparedKeyMaterials | null> | undefined;

/** Give a ready photograph a short, bounded wait for the optional texture atlas. */
export function waitForKeyMaterials(materials: Promise<PreparedKeyMaterials | null>, signal?: AbortSignal): Promise<PreparedKeyMaterials | null> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException('Instrument loading cancelled', 'AbortError'));
            return;
        }
        let settled = false;
        const deadline = window.setTimeout(() => finish(null), 300);
        function cleanup() {
            window.clearTimeout(deadline);
            signal?.removeEventListener('abort', aborted);
        }
        function finish(value: PreparedKeyMaterials | null) {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(value);
        }
        function aborted() {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new DOMException('Instrument loading cancelled', 'AbortError'));
        }
        signal?.addEventListener('abort', aborted, { once: true });
        // Late completion only warms the shared cache for a future mount. This
        // instance keeps its chosen materials and the user's current state.
        void materials.then(finish, () => finish(null));
    });
}

/** The calibrated photographic materials are baked once, not traced on every visit. */
export function loadKeyMaterials(geometry: InstrumentGeometry): Promise<PreparedKeyMaterials | null> {
    const approvedSource = /^\/assets\/instrument\/clean-plate(?:\.v1)?\.(?:png|webp)$/.test(geometry.source);
    if (!approvedSource || geometry.sourceWidth !== approvedGeometry.sourceWidth ||
        geometry.sourceHeight !== approvedGeometry.sourceHeight ||
        JSON.stringify(geometry.keys) !== JSON.stringify(approvedGeometry.keys))
        return Promise.resolve(null);
    if (!prepared) {
        prepared = new Promise<PreparedKeyMaterials>((resolve, reject) => {
            const atlas = new Image();
            atlas.decoding = 'async';
            atlas.onload = () => {
                atlas.onload = null;
                atlas.onerror = null;
                resolve({ atlas, regions: materials as PreparedKeyMaterials['regions'] });
            };
            atlas.onerror = () => reject(new Error('Instrument key materials unavailable'));
            atlas.src = '/assets/instrument/key-materials.v1.webp';
        }).catch(() => {
            // A missing optimization asset must not disable the real controls.
            // The original photograph remains sufficient to reconstruct them.
            prepared = undefined;
            return null;
        });
    }
    return prepared;
}
