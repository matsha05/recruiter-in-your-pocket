/**
 * UndoToast Component
 * 
 * Floating toast with undo action. Auto-dismisses after 5 seconds.
 */

import { useEffect } from 'react';

interface UndoToastProps {
    message: string;
    onUndo: () => void;
    onDismiss: () => void;
    duration?: number;
}

export default function UndoToast({
    message,
    onUndo,
    onDismiss,
    duration = 5000
}: UndoToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    function handleUndo() {
        onUndo();
    }

    return (
        <div className="undo-toast visible">
            <span className="undo-message">{message}</span>
            <button type="button" className="undo-button" onClick={handleUndo}>
                Undo
            </button>
        </div>
    );
}
