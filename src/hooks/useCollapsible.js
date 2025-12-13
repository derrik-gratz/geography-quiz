import { useState, useEffect } from 'react';

/**
 * Hook to manage collapsible panel state
 * @param {boolean} defaultCollapsed - The default collapsed state (resets to this when it changes)
 * @returns {{ isCollapsed: boolean, toggleCollapsed: () => void }}
 */
export function useCollapsible(defaultCollapsed) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    // Reset to defaultCollapsed whenever it changes
    useEffect(() => {
        setIsCollapsed(defaultCollapsed);
    }, [defaultCollapsed]);

    const toggleCollapsed = () => {
        setIsCollapsed(prev => !prev);
    };

    return { isCollapsed, toggleCollapsed };
}
