// import { useCollapsible } from '../../hooks/useCollapsible.js';
// import { useState, useEffect } from 'react';

// /**
//  * Hook to manage collapsible panel state
//  * @param {boolean} defaultCollapsed - The default collapsed state (resets to this when it changes)
//  * @returns {{ isCollapsed: boolean, toggleCollapsed: () => void }}
//  */
// export function useCollapsible(defaultCollapsed) {
//     const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

//     // Reset to defaultCollapsed whenever it changes
//     useEffect(() => {
//         setIsCollapsed(defaultCollapsed);
//     }, [defaultCollapsed]);

//     const toggleCollapsed = () => {
//         setIsCollapsed(prev => !prev);
//     };

//     return { isCollapsed, toggleCollapsed };
// }

// const defaultCollapsed = useMemo(() => {
//     if (componentStatus === 'prompting') return true;
//     if ((componentStatus === 'completed' || componentStatus === 'failed') && state.quiz.status === 'active') {
//       return true;
//     }
//     return false;
//   }, [componentStatus, state.quiz.status]);
// const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);

// <div className={`flag-select component-panel status-${componentStatus} ${isCollapsed ? 'collapsed' : ''}`}>
//             <div className="component-panel__title-container">
//                 <button 
//                     className="component-panel__toggle-button" 
//                     onClick={toggleCollapsed}
//                     aria-label={isCollapsed ? 'Expand Flag Selection' : 'Collapse Flag Selection'}
//                 >
//                     {isCollapsed ? '▶ Flag Selection' : '▼ Flag Selection'}
//                 </button>
//             </div>