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
    <div className="flag-selector">
      {/* Color Filter Bar */}
      <div className="color-filter-bar">
        <div className="color-filter-container">
          <span className="filter-label">
            Filter by color:
          </span>
          {availableColors.map(color => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`color-button ${selectedColor === color.value ? 'selected' : ''}`}
              style={{
                backgroundColor: color.color,
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
      <div className="flag-grid">
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
              className={`fi fi-${code} flag-icon${isSelected ? ' selected' : ''}${isHighlighted ? ' highlighted' : ''}`}
              style={{
                border: borderStyle,
                boxShadow: boxShadow,
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
        <div className="no-flags-message">
          No flags found with the selected color.
        </div>
      )}
    </div>
  );
}

export default FlagSelector;
