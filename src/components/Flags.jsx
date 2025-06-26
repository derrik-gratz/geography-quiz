import React, { useState } from 'react';
import countries from '../data/countries.json';

// Get all country codes from countries.json
const countryCodes = countries.map(country => country.Code.toLowerCase());

function FlagSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
      gap: '1rem',
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      background: '#f9f9f9',
      maxWidth: '100%',
      minHeight: '200px',
      maxHeight: '320px',
      overflowY: 'auto',
    }}>
      {countryCodes.map(code => (
        <span
          key={code}
          className={`fi fi-${code} flag-icon${selected === code ? ' selected' : ''}`}
          style={{
            fontSize: '2.5rem',
            cursor: 'pointer',
            border: selected === code ? '2px solid #646cff' : '2px solid transparent',
            borderRadius: '4px',
            padding: '0.2rem',
            boxShadow: selected === code ? '0 0 0 4px #646cff' : undefined,
            transition: 'border 0.2s, background 0.2s',
          }}
          onClick={() => {
            setSelected(code);
            if (onSelect) onSelect(code);
          }}
          title={code.toUpperCase()}
        />
      ))}
    </div>
  );
}

export default FlagSelector;
