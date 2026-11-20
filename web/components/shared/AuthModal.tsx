"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { getAuthCopy, type AuthContext } from "@/lib/auth/content";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void | Promise<void>;
    /** Context for copy customization. 'report' = gating free report, uses value-first copy */
    context?: AuthContext;
}

export default function AuthModal({ isOpen, onClose, onSuccess, context = "default" }: AuthModalProps) {
    const [finishing, setFinishing] = useState(false);

    async function finishSignIn() {
        setFinishing(true);
        try {
            // Saving the guest report is part of this sign-in. Keep navigation behind the dialog until it settles.
            await onSuccess?.();
        } finally {
            setFinishing(false);
            onClose();
        }
    }

    // Name the dialog after what this sign-in is for, matching its visible headline.
    const { headline } = getAuthCopy(context, {
        billingEnabled: isLaunchFlagEnabled("billingUnlock"),
        extensionEnabled: isLaunchFlagEnabled("extensionSync"),
    });
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !finishing && onClose()}>
            <DialogContent closeDisabled={finishing} className="sm:max-w-md bg-background border border-border/60 shadow-sm p-8 rounded-lg">
                <DialogTitle className="sr-only">{headline}</DialogTitle>
                <DialogDescription className="sr-only">
                    Use your email to receive a secure one-time sign-in code.
                </DialogDescription>
                <AuthFlow
                    variant="modal"
                    context={context}
                    onSuccess={finishSignIn}
                    isCompleting={finishing}
                    isOpen={isOpen}
                />
            </DialogContent>
        </Dialog>
    );
}
