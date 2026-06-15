"use client";

import { m as motion } from "motion/react";
import { FADE_IN_UP } from "@/lib/animation";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={false}
            animate={FADE_IN_UP.animate}
            exit={FADE_IN_UP.exit}
            transition={FADE_IN_UP.transition}
            className="flex flex-col min-h-screen"
        >
            {children}
        </motion.div>
    );
}
