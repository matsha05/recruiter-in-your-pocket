"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { useSelection } from "@/hooks/useSelection"
import { DURATION } from "@/lib/animation"

/**
 * SelectableList - A list component with built-in selection system
 * Per design-principles.md: Three-State List Selection (Raycast Pattern)
 * 
 * Features:
 * - Click = select single
 * - Cmd/Ctrl+Click = toggle
 * - Shift+Click = range select
 * - Arrow keys = navigate
 * - Enter = activate (trigger onItemActivate)
 * - Esc = clear selection
 * - Type-to-filter when focused
 */

interface SelectableListItem {
    id: string
    [key: string]: any
}

interface SelectableListProps<T extends SelectableListItem> {
    /** Array of items */
    items: T[]
    /** Render function for each item */
    renderItem: (item: T, state: { isSelected: boolean; isActive: boolean }) => React.ReactNode
    /** Called when Enter is pressed on active item */
    onItemActivate?: (item: T) => void
    /** Called when selection changes */
    onSelectionChange?: (selectedIds: Set<string>) => void
    /** Optional filter function for type-to-filter */
    filterItem?: (item: T, query: string) => boolean
    /** Empty state content */
    emptyState?: React.ReactNode
    /** Additional className */
    className?: string
    /** Label for accessibility */
    ariaLabel?: string
}

export function SelectableList<T extends SelectableListItem>({
    items,
    renderItem,
    onItemActivate,
    onSelectionChange,
    filterItem,
    emptyState,
    className,
    ariaLabel = "Selectable list",
}: SelectableListProps<T>) {
    const {
        filteredItems,
        filterQuery,
        isSelected,
        isActive,
        containerProps,
        getItemProps,
    } = useSelection({
        items,
        getItemId: (item) => item.id,
        onActivate: onItemActivate,
        onSelectionChange,
        enableTypeToFilter: !!filterItem,
        filterItem,
    })

    return (
        <div
            {...containerProps}
            className={cn("outline-none", className)}
            aria-label={ariaLabel}
        >
            {/* Filter indicator */}
            {filterQuery && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: DURATION.select }}
                    className="mb-2 px-2 py-1 text-xs text-muted-foreground bg-muted/40 rounded-md inline-flex items-center gap-1"
                >
                    <span>Filtering:</span>
                    <span className="font-mono">{filterQuery}</span>
                </motion.div>
            )}

            {/* Items */}
            {filteredItems.length === 0 ? (
                emptyState || (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No items
                    </div>
                )
            ) : (
                <div className="space-y-1">
                    {filteredItems.map((item) => {
                        const itemProps = getItemProps(item.id)
                        const selected = isSelected(item.id)
                        const active = isActive(item.id)

                        return (
                            <motion.div
                                key={item.id}
                                {...itemProps}
                                className={cn(
                                    // Base
                                    "relative rounded-md px-3 py-2 cursor-pointer select-none",
                                    "transition-colors duration-[90ms]",
                                    // Hover: bg-muted/40
                                    "hover:bg-muted/40",
                                    // Selected: bg-muted/60 + left hairline
                                    selected && "bg-muted/60",
                                    // Active (keyboard): outline
                                    active && "ring-1 ring-border/35",
                                )}
                                style={{
                                    // Left hairline for selected
                                    boxShadow: selected
                                        ? "inset 2px 0 0 0 hsl(var(--brand) / 0.7)"
                                        : undefined,
                                }}
                                whileTap={{ backgroundColor: "hsl(var(--muted) / 0.7)" }}
                                transition={{ duration: DURATION.press }}
                            >
                                {renderItem(item, { isSelected: selected, isActive: active })}
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/**
 * Convenience hook to get selection for external use
 */
export function useListSelection<T extends SelectableListItem>(
    items: T[],
    onActivate?: (item: T) => void
) {
    return useSelection({
        items,
        getItemId: (item) => item.id,
        onActivate,
    })
}
