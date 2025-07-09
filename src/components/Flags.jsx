import React, { useState } from 'react';
import countries from '../data/countries.json';

// Get all country codes from countries.json
const countryCodes = countries.map(country => country.Code.toLowerCase());

function FlagSelector({ onSelect, highlightedCountry, clearInputsRef }) {
  const [selected, setSelected] = useState(null);

  // Function to clear the selection
  const clearSelection = () => {
    setSelected(null);
  };

  // Set the clear function in the ref so parent can call it
  React.useEffect(() => {
    if (clearInputsRef) {
      // Store the current clear function
      const currentClear = clearInputsRef.current;
      clearInputsRef.current = () => {
        clearSelection();
        // Call any existing clear function
        if (currentClear) {
          currentClear();
        }
      };
    }
  }, [clearInputsRef]);

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
      {countryCodes.map(code => {
        const isSelected = selected === code;
        const isHighlighted = highlightedCountry && highlightedCountry.Code.toLowerCase() === code;
        
        // Determine border style based on state
        let borderStyle = '2px solid transparent';
        let boxShadow = undefined;
        
        if (isHighlighted) {
          borderStyle = '3px solid #ff6b6b';
          boxShadow = '0 0 0 4px #ff6b6b';
        } else if (isSelected) {
          borderStyle = '2px solid #646cff';
          boxShadow = '0 0 0 4px #646cff';
        }
        
        return (
          <span
            key={code}
            className={`fi fi-${code} flag-icon${isSelected ? ' selected' : ''}`}
            style={{
              fontSize: '2.5rem',
              cursor: 'pointer',
              border: borderStyle,
              borderRadius: '4px',
              padding: '0.2rem',
              boxShadow: boxShadow,
              transition: 'border 0.2s, background 0.2s',
              transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={() => {
              setSelected(code);
              if (onSelect) onSelect(code);
            }}
            title={code.toUpperCase()}
          />
        );
      })}
    </div>
  );
}

export default FlagSelector;
