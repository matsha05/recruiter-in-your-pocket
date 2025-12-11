"use client";

interface ToggleProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    size?: "sm" | "md";
    className?: string;
}

/**
 * Reusable Toggle/Switch component
 * Uses .toggle CSS class from globals.css
 */
export default function Toggle({
    checked,
    onChange,
    disabled = false,
    size = "md",
    className = ""
}: ToggleProps) {
    const sizeClasses = size === "sm"
        ? "w-9 h-5 after:w-4 after:h-4"
        : "w-11 h-6 after:w-5 after:h-5";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
            className={`
                toggle
                ${checked ? "active" : ""}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${sizeClasses}
                ${className}
            `.trim()}
        />
    );
}
