import React, { useState } from 'react';
import countries from '../data/countries.json';
import comprehensiveCountries from '../data/comprehensiveCountries.json';

// Get all country codes from countries.json
const countryCodes = countries.map(country => country.Code.toLowerCase());

// Create a mapping from country codes to their primary colors
const countryColorMap = {};
comprehensiveCountries.forEach(country => {
  if (country.primaryColor) {
    countryColorMap[country.code.toLowerCase()] = country.primaryColor;
  }
});

// Define available colors for filtering
const availableColors = [
  { name: 'All', value: 'all', color: '#666' },
  { name: 'Red', value: 'red', color: '#ff0000' },
  { name: 'Blue', value: 'blue', color: '#0000ff' },
  { name: 'Green', value: 'green', color: '#00ff00' },
  { name: 'Yellow', value: 'yellow', color: '#ffff00' },
  { name: 'White', value: 'white', color: '#ffffff' },
  { name: 'Black', value: 'black', color: '#000000' },
  { name: 'Orange', value: 'orange', color: '#ffa500' },
];

function FlagSelector({ onSelect, highlightedCountry, clearInputsRef, guesses = [], currentPrompt = null }) {
  const [selected, setSelected] = useState(null);
  const [selectedColor, setSelectedColor] = useState('all');

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

  // Filter flags based on selected color
  const filteredCountryCodes = countryCodes.filter(code => {
    if (selectedColor === 'all') return true;
    const primaryColor = countryColorMap[code];
    return primaryColor === selectedColor;
  });

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      background: '#f9f9f9',
      maxWidth: '100%',
    }}>
      {/* Color Filter Bar */}
      <div style={{
        padding: '0.5rem',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#fff',
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.9rem', color: '#666', marginRight: '0.5rem' }}>
            Filter by color:
          </span>
          {availableColors.map(color => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              style={{
                backgroundColor: color.color,
                border: selectedColor === color.value ? '3px solid #333' : '2px solid #ccc',
                borderRadius: '4px',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                color: color.value === 'white' || color.value === 'yellow' ? '#000' : '#fff',
              }}
              title={color.name}
            >
              {color.value === 'all' ? 'A' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Flag Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: '1rem',
        padding: '1rem',
        minHeight: '200px',
        maxHeight: '320px',
        overflowY: 'auto',
      }}>
        {filteredCountryCodes.map(code => {
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
      
      {/* Show message if no flags match the filter */}
      {filteredCountryCodes.length === 0 && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
        }}>
          No flags found with the selected color.
        </div>
      )}
    </div>
  );
}

export default FlagSelector;
