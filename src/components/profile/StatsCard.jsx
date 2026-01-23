/**
 * Reusable card component for displaying stat groups
 */
import React from 'react';

export function StatsCard({ title, children, className = '' }) {
  return (
    <div className={`component-panel stats-card ${className}`}>
      <div className="component-panel__title-container">
        <h3 className="component-panel__title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
          {title}
        </h3>
      </div>
      <div className="component-panel__content" style={{ marginTop: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Stat item component for displaying individual statistics
 */
export function StatItem({ label, value, unit = '', className = '' }) {
  return (
    <div className={`stat-item ${className}`} style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {value}{unit}
      </div>
    </div>
  );
}

/**
 * Progress bar component
 */
export function ProgressBar({ value, max = 100, label, showValue = true }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          {showValue && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {value.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--background-tertiary)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--color-correct)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
}
