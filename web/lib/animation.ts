import { Variants, Transition, TargetAndTransition } from "framer-motion";

// =============================================================================
// EASING CURVES
// Per design-principles.md: cubic-bezier(0.16, 1, 0.3, 1) — snappy
// =============================================================================

export const TRANSITION_EASE = [0.32, 0.72, 0, 1] as const;
export const EASE_SNAP = [0.16, 1, 0.3, 1] as const;

// =============================================================================
// SPRING CONFIGURATIONS
// Structural UI uses tight, controlled springs. Signature moments may use a
// single low-amplitude overshoot spring (one per screen).
// =============================================================================

/** Signature moment spring - use only for verdict/value/conversion moments */
export const SPRING_SIGNATURE = {
    type: "spring",
    stiffness: 400,
    damping: 30,
} as const;

/** @deprecated Use SPRING_SIGNATURE instead */
export const SPRING_BOUNCE = SPRING_SIGNATURE;

/** Tight spring for structural micro-interactions and quick feedback */
export const SPRING_TIGHT = {
    type: "spring",
    stiffness: 500,
    damping: 30,
} as const;

/** Modal/dialog spring - snappy with no overshoot */
export const SPRING_MODAL = {
    type: "spring",
    stiffness: 500,
    damping: 35,
} as const;

/** Subtle spring for structural hover states - responsive but not distracting */
export const SPRING_SUBTLE = {
    type: "spring",
    stiffness: 300,
    damping: 25,
} as const;

// =============================================================================
// DURATION TOKENS
// Per design-principles.md: Fast 100ms, Normal 200ms, Slow 350ms
// =============================================================================

export const DURATION = {
    fast: 0.1,      // 100ms - micro interactions
    normal: 0.2,    // 200ms - UI transitions
    slow: 0.35,     // 350ms - reveals, entrances
    editorial: 0.6, // 600ms - smooth editorial reveals
} as const;

// =============================================================================
// BUTTON TAP
// Per motion-primitives.md: Scale 0.97 for HUD/Tools
// =============================================================================

export const BUTTON_TAP: TargetAndTransition = {
    scale: 0.97,
    transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
    }
};

// =============================================================================
// PAGE TRANSITIONS
// Per motion-primitives.md: Kinetic Rhythm scroll reveal pattern
// =============================================================================

export const FADE_IN_UP = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: DURATION.slow, ease: TRANSITION_EASE }
} as const;

export const PAGE_VARIANTS: Variants = {
    initial: { opacity: 0, y: 20 },
    enter: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.slow, ease: EASE_SNAP }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: DURATION.normal, ease: EASE_SNAP }
    }
};

// =============================================================================
// SCROLL REVEAL
// Per motion-primitives.md: Initial y: 32, opacity: 0, stagger 75-150ms
// =============================================================================

export const SCROLL_REVEAL_VARIANTS: Variants = {
    hidden: {
        opacity: 0,
        y: 32
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.editorial,
            ease: EASE_SNAP
        }
    }
};

export const SCROLL_REVEAL_FAST: Variants = {
    hidden: {
        opacity: 0,
        y: 16
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE_SNAP
        }
    }
};

// =============================================================================
// STAGGER CHILDREN
// Per motion-primitives.md: 75ms - 150ms stagger per item
// =============================================================================

export const STAGGER_CONTAINER: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.075, // 75ms
            delayChildren: 0.1
        }
    }
};

export const STAGGER_CONTAINER_SLOW: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // 150ms
            delayChildren: 0.1
        }
    }
};

export const STAGGER_ITEM: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE_SNAP
        }
    }
};

// =============================================================================
// MODAL / DIALOG
// Spring physics for enter, quick fade for exit
// =============================================================================

export const MODAL_OVERLAY_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: DURATION.normal }
    },
    exit: {
        opacity: 0,
        transition: { duration: DURATION.fast }
    }
};

export const MODAL_CONTENT_VARIANTS: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        // Note: No y offset - we rely on CSS translate-y-[-50%] for centering
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: SPRING_MODAL
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: DURATION.fast, ease: EASE_SNAP }
    }
};

export const SHEET_VARIANTS = {
    right: {
        hidden: { x: "100%" },
        visible: {
            x: 0,
            transition: SPRING_MODAL
        },
        exit: {
            x: "100%",
            transition: { duration: DURATION.normal, ease: EASE_SNAP }
        }
    },
    left: {
        hidden: { x: "-100%" },
        visible: {
            x: 0,
            transition: SPRING_MODAL
        },
        exit: {
            x: "-100%",
            transition: { duration: DURATION.normal, ease: EASE_SNAP }
        }
    },
    bottom: {
        hidden: { y: "100%" },
        visible: {
            y: 0,
            transition: SPRING_MODAL
        },
        exit: {
            y: "100%",
            transition: { duration: DURATION.normal, ease: EASE_SNAP }
        }
    },
    top: {
        hidden: { y: "-100%" },
        visible: {
            y: 0,
            transition: SPRING_MODAL
        },
        exit: {
            y: "-100%",
            transition: { duration: DURATION.normal, ease: EASE_SNAP }
        }
    }
} as const;

// =============================================================================
// CARD HOVER
// Per motion-primitives.md: -2px lift + shadow on hover
// =============================================================================

export const CARD_HOVER: TargetAndTransition = {
    y: -2,
    transition: SPRING_SUBTLE
};

export const CARD_TAP: TargetAndTransition = {
    y: 0,
    scale: 0.98,
    transition: SPRING_TIGHT
};

// =============================================================================
// LINK ARROW SLIDE
// Per motion-primitives.md: translateX(4px) on parent hover
// =============================================================================

export const ARROW_SLIDE: TargetAndTransition = {
    x: 4,
    transition: { duration: DURATION.normal, ease: EASE_SNAP }
};

// =============================================================================
// ACCESSIBILITY
// Reduced motion detection helper
// =============================================================================

export const reducedMotionVariants = <T extends Variants>(variants: T): T => {
    // This is a marker - actual implementation happens in components
    // using useReducedMotion() from framer-motion
    return variants;
};
