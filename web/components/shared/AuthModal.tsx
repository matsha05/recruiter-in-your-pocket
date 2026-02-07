"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthFlow } from "@/components/auth/AuthFlow";
import type { AuthContext } from "@/lib/auth/content";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** Context for copy customization. 'report' = gating free report, uses value-first copy */
    context?: AuthContext;
}

export default function AuthModal({ isOpen, onClose, onSuccess, context = "default" }: AuthModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-background border border-border/60 shadow-sm p-8 rounded-lg">
                <AuthFlow
                    variant="modal"
                    context={context}
                    onSuccess={onSuccess}
                    onClose={onClose}
                    isOpen={isOpen}
                />
            </DialogContent>
        </Dialog>
    );
}
