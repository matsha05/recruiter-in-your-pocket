import type { Variants, Transition, TargetAndTransition } from "motion/react";

/** Keep these values in sync with the canonical CSS tokens in globals.css. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
    press: 0.14,
    hoverIn: 0.14,
    hoverOut: 0.14,
    select: 0.14,
    swap: 0.18,
    reveal: 0.18,
    hero: 0.18,
    fast: 0.14,
    normal: 0.18,
    slow: 0.18,
    editorial: 0.18,
} as const;

export const UI_TRANSITION = {
    duration: DURATION.normal,
    ease: EASE,
} as const satisfies Transition;

export const UI_TRANSITION_FAST = {
    duration: DURATION.fast,
    ease: EASE,
} as const satisfies Transition;

/** Explicitly use this for state changes when reduced motion is requested. */
export const INSTANT_TRANSITION = { duration: 0, delay: 0 } as const;

export const BUTTON_TAP: TargetAndTransition = {
    scale: 0.99,
    transition: UI_TRANSITION_FAST,
};

export const FADE_IN_UP = {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
    transition: UI_TRANSITION,
} as const;

/** Legacy reveal consumers retain their API without hiding or delaying content. */
export const SCROLL_REVEAL_VARIANTS: Variants = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
};

export const SCROLL_REVEAL_FAST = SCROLL_REVEAL_VARIANTS;

/** Reading content appears together; staggered arrival must never gate it. */
export const STAGGER_CONTAINER: Variants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
};

export const STAGGER_ITEM = SCROLL_REVEAL_VARIANTS;

export const MODAL_OVERLAY_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: UI_TRANSITION },
    exit: { opacity: 0, transition: UI_TRANSITION_FAST },
};

export const MODAL_CONTENT_VARIANTS: Variants = {
    hidden: { opacity: 0, scale: 0.985 },
    visible: { opacity: 1, scale: 1, transition: UI_TRANSITION },
    exit: { opacity: 0, scale: 0.985, transition: UI_TRANSITION_FAST },
};

export const SHEET_VARIANTS = {
    right: {
        hidden: { x: "100%" },
        visible: { x: 0, transition: UI_TRANSITION },
        exit: { x: "100%", transition: UI_TRANSITION_FAST },
    },
    left: {
        hidden: { x: "-100%" },
        visible: { x: 0, transition: UI_TRANSITION },
        exit: { x: "-100%", transition: UI_TRANSITION_FAST },
    },
    bottom: {
        hidden: { y: "100%" },
        visible: { y: 0, transition: UI_TRANSITION },
        exit: { y: "100%", transition: UI_TRANSITION_FAST },
    },
    top: {
        hidden: { y: "-100%" },
        visible: { y: 0, transition: UI_TRANSITION },
        exit: { y: "-100%", transition: UI_TRANSITION_FAST },
    },
} as const;

export const CARD_HOVER: TargetAndTransition = {
    y: -1,
    transition: UI_TRANSITION_FAST,
};

export const CARD_TAP: TargetAndTransition = {
    y: 0,
    transition: UI_TRANSITION_FAST,
};
