"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let mediaQuery: MediaQueryList | undefined;

function getMediaQuery() {
    mediaQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery;
}

function notify() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    const query = getMediaQuery();
    if (listeners.size === 0) query.addEventListener("change", notify);
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) query.removeEventListener("change", notify);
    };
}

function getSnapshot() {
    return getMediaQuery().matches;
}

// Essential content starts in its final state before the browser preference is known.
function getServerSnapshot() {
    return true;
}

/** Subscribe to live preference changes; Motion's installed hook reads only once. */
export function useReducedMotion() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
