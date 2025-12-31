/**
 * UndoToast Component
 * 
 * Floating toast with undo action. Auto-dismisses after 5 seconds.
 */

import { useEffect, useState } from 'react';

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
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 200); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    function handleUndo() {
        setIsVisible(false);
        onUndo();
    }

    return (
        <div className={`undo-toast ${isVisible ? 'visible' : ''}`}>
            <span className="undo-message">{message}</span>
            <button className="undo-button" onClick={handleUndo}>
                Undo
            </button>
        </div>
    );
}
