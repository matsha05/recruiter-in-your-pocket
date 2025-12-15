export const TRANSITION_EASE = [0.32, 0.72, 0, 1] as const;

export const SPRING_BOUNCE = {
    type: "spring",
    stiffness: 400,
    damping: 30,
} as const;

export const SPRING_TIGHT = {
    type: "spring",
    stiffness: 500,
    damping: 30,
} as const;

export const BUTTON_TAP = {
    scale: 0.97,
    transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
    }
} as const;

export const FADE_IN_UP = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.4, ease: TRANSITION_EASE }
} as const;
