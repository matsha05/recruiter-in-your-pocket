"use client"

import * as React from "react"

/**
 * useSelection - Unified selection system for lists
 * Per design-principles.md: "Selection is a first-class state"
 * 
 * Features:
 * - click = select single
 * - cmd/ctrl+click = toggle selection
 * - shift+click = range select
 * - Arrow up/down = move active
 * - Enter = trigger onActivate callback (open Peek)
 * - Esc = clear selection
 * - Type = filter (type-to-search)
 */

interface UseSelectionOptions<T> {
    /** Array of items to select from */
    items: T[]
    /** Get unique ID for an item */
    getItemId: (item: T) => string
    /** Callback when Enter is pressed on active item */
    onActivate?: (item: T) => void
    /** Callback when selection changes */
    onSelectionChange?: (selectedIds: Set<string>) => void
    /** Enable type-to-filter */
    enableTypeToFilter?: boolean
    /** Filter function for type-to-filter */
    filterItem?: (item: T, query: string) => boolean
}

interface UseSelectionReturn<T> {
    /** Currently selected item IDs */
    selectedIds: Set<string>
    /** Currently active (keyboard focused) item ID */
    activeId: string | null
    /** Filter query (for type-to-filter) */
    filterQuery: string
    /** Filtered items (after type-to-filter) */
    filteredItems: T[]
    /** Check if an item is selected */
    isSelected: (id: string) => boolean
    /** Check if an item is active */
    isActive: (id: string) => boolean
    /** Handle click on an item */
    handleClick: (id: string, event: React.MouseEvent) => void
    /** Handle keyboard events (attach to list container) */
    handleKeyDown: (event: React.KeyboardEvent) => void
    /** Clear all selections */
    clearSelection: () => void
    /** Select all items */
    selectAll: () => void
    /** Props to spread on the list container */
    containerProps: {
        tabIndex: number
        onKeyDown: (event: React.KeyboardEvent) => void
        role: string
        "aria-multiselectable": boolean
    }
    /** Get props for an individual item */
    getItemProps: (id: string) => {
        onClick: (e: React.MouseEvent) => void
        "aria-selected": boolean
        "data-active": boolean
        role: string
    }
}

export function useSelection<T>({
    items,
    getItemId,
    onActivate,
    onSelectionChange,
    enableTypeToFilter = true,
    filterItem,
}: UseSelectionOptions<T>): UseSelectionReturn<T> {
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
    const [activeId, setActiveId] = React.useState<string | null>(null)
    const [filterQuery, setFilterQuery] = React.useState("")
    const [lastSelectedId, setLastSelectedId] = React.useState<string | null>(null)

    // Clear filter after 1.5s of no typing
    const filterTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    // Filter items based on query
    const filteredItems = React.useMemo(() => {
        if (!filterQuery || !filterItem) return items
        return items.filter((item) => filterItem(item, filterQuery.toLowerCase()))
    }, [items, filterQuery, filterItem])

    // Get ordered IDs for keyboard navigation
    const itemIds = React.useMemo(
        () => filteredItems.map(getItemId),
        [filteredItems, getItemId]
    )

    // Notify parent of selection changes
    React.useEffect(() => {
        onSelectionChange?.(selectedIds)
    }, [selectedIds, onSelectionChange])

    // Helper to check if item is selected
    const isSelected = React.useCallback(
        (id: string) => selectedIds.has(id),
        [selectedIds]
    )

    // Helper to check if item is active
    const isActive = React.useCallback(
        (id: string) => activeId === id,
        [activeId]
    )

    // Handle click with modifier keys
    const handleClick = React.useCallback(
        (id: string, event: React.MouseEvent) => {
            const isMeta = event.metaKey || event.ctrlKey
            const isShift = event.shiftKey

            if (isShift && lastSelectedId) {
                // Range select
                const startIdx = itemIds.indexOf(lastSelectedId)
                const endIdx = itemIds.indexOf(id)
                if (startIdx !== -1 && endIdx !== -1) {
                    const [start, end] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
                    const rangeIds = itemIds.slice(start, end + 1)
                    setSelectedIds(new Set([...selectedIds, ...rangeIds]))
                }
            } else if (isMeta) {
                // Toggle selection
                const newSelected = new Set(selectedIds)
                if (newSelected.has(id)) {
                    newSelected.delete(id)
                } else {
                    newSelected.add(id)
                }
                setSelectedIds(newSelected)
                setLastSelectedId(id)
            } else {
                // Single select
                setSelectedIds(new Set([id]))
                setLastSelectedId(id)
            }
            setActiveId(id)
        },
        [itemIds, lastSelectedId, selectedIds]
    )

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent) => {
            const currentIdx = activeId ? itemIds.indexOf(activeId) : -1

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault()
                    if (currentIdx < itemIds.length - 1) {
                        const newId = itemIds[currentIdx + 1]
                        setActiveId(newId)
                        if (!event.shiftKey) {
                            setSelectedIds(new Set([newId]))
                            setLastSelectedId(newId)
                        } else {
                            // Extend selection
                            setSelectedIds((prev) => new Set([...prev, newId]))
                        }
                    }
                    break

                case "ArrowUp":
                    event.preventDefault()
                    if (currentIdx > 0) {
                        const newId = itemIds[currentIdx - 1]
                        setActiveId(newId)
                        if (!event.shiftKey) {
                            setSelectedIds(new Set([newId]))
                            setLastSelectedId(newId)
                        } else {
                            setSelectedIds((prev) => new Set([...prev, newId]))
                        }
                    }
                    break

                case "Enter":
                    event.preventDefault()
                    if (activeId) {
                        const item = filteredItems.find((i) => getItemId(i) === activeId)
                        if (item) onActivate?.(item)
                    }
                    break

                case "Escape":
                    event.preventDefault()
                    setSelectedIds(new Set())
                    setActiveId(null)
                    setFilterQuery("")
                    break

                case "a":
                    if (event.metaKey || event.ctrlKey) {
                        event.preventDefault()
                        setSelectedIds(new Set(itemIds))
                    }
                    break

                default:
                    // Type-to-filter
                    if (enableTypeToFilter && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
                        setFilterQuery((prev) => prev + event.key)

                        // Clear filter after timeout
                        if (filterTimeoutRef.current) {
                            clearTimeout(filterTimeoutRef.current)
                        }
                        filterTimeoutRef.current = setTimeout(() => {
                            setFilterQuery("")
                        }, 1500)
                    }
                    break
            }
        },
        [activeId, itemIds, filteredItems, getItemId, onActivate, enableTypeToFilter]
    )

    // Clear selection
    const clearSelection = React.useCallback(() => {
        setSelectedIds(new Set())
        setActiveId(null)
    }, [])

    // Select all
    const selectAll = React.useCallback(() => {
        setSelectedIds(new Set(itemIds))
    }, [itemIds])

    // Container props
    const containerProps = React.useMemo(
        () => ({
            tabIndex: 0,
            onKeyDown: handleKeyDown,
            role: "listbox" as const,
            "aria-multiselectable": true as const,
        }),
        [handleKeyDown]
    )

    // Get props for individual items
    const getItemProps = React.useCallback(
        (id: string) => ({
            onClick: (e: React.MouseEvent) => handleClick(id, e),
            "aria-selected": isSelected(id),
            "data-active": isActive(id),
            role: "option" as const,
        }),
        [handleClick, isSelected, isActive]
    )

    return {
        selectedIds,
        activeId,
        filterQuery,
        filteredItems,
        isSelected,
        isActive,
        handleClick,
        handleKeyDown,
        clearSelection,
        selectAll,
        containerProps,
        getItemProps,
    }
}
