// import { useCollapsible } from '../../hooks/useCollapsible.js';
import './CollapsibleContainer.css';
import { useState, useEffect } from 'react';

export function CollapsibleContainer({
  content,
  title,
  classNames = '',
  defaultCollapsed = false,
}) {
  // const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Sync internal state with prop changes
  useEffect(() => {
    setIsCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);
  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };
  return (
    <div
      className={`collapsable-container ${classNames} ${isCollapsed ? 'collapsable-container_collapsed' : ''}`}
    >
      <div className="collapsable-container__title">
        <button
          className="collapsable-container__toggle-button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expand container' : 'Collapse container'}
        >
          {isCollapsed ? `▶ ${title}` : `▼ ${title}`}
        </button>
      </div>
      {!isCollapsed && (
        <div className="collapsable-container__content">{content}</div>
      )}
    </div>
  );
}
