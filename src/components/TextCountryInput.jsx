import React, { useState } from 'react';
import countries from '../data/countries.json';

function TextCountryInput({ onSelect, clearInputsRef }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Function to normalize text by removing accents and converting to lowercase
  const normalizeText = (text) => {
    return text
      .normalize('NFD') // Decompose characters with accents
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .toLowerCase();
  };

  // Function to clear the input
  const clearInput = () => {
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Set the clear function in the ref so parent can call it
  React.useEffect(() => {
    if (clearInputsRef) {
      // Store the current clear function
      const currentClear = clearInputsRef.current;
      clearInputsRef.current = () => {
        clearInput();
        // Call any existing clear function
        if (currentClear) {
          currentClear();
        }
      };
    }
  }, [clearInputsRef]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 0) {
      const normalizedInput = normalizeText(value);
      const filtered = countries.filter(c => {
        const normalizedName = normalizeText(c.Name);
        const nameMatch = normalizedName.includes(normalizedInput);
        
        // Also check aliases if they exist
        let aliasMatch = false;
        let matchedAlias = null;
        if (c.Aliases && Array.isArray(c.Aliases)) {
          matchedAlias = c.Aliases.find(alias => 
            normalizeText(alias).includes(normalizedInput)
          );
          aliasMatch = !!matchedAlias;
        }
        
        // Store the matched alias for display purposes
        if (aliasMatch) {
          c.matchedAlias = matchedAlias;
        }
        
        return nameMatch || aliasMatch;
      }).slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (country) => {
    setInput(country.Name);
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSelect) onSelect(country);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Type a country name..."
        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
        // onFocus: Shows suggestions when user clicks into the input field (if there's already text)
        onFocus={() => input && setShowSuggestions(true)}
        // onBlur: Hides suggestions when user clicks away from the input field
        // setTimeout prevents suggestions from disappearing immediately when clicking on a suggestion
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '100%',
          background: '#fff',
          border: '1px solid #ccc',
          borderTop: 'none',
          minHeight: '40px', // Ensure at least one suggestion is visible
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10,
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}>
          {suggestions.map(country => (
            <li
              key={country.Code}
              onMouseDown={() => handleSelect(country)}
              style={{ 
                padding: '0.5rem', 
                cursor: 'pointer',
                color: '#333',
                borderBottom: '1px solid #eee',
                minHeight: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <div>{country.Name}</div>
              {country.matchedAlias && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  fontStyle: 'italic' 
                }}>
                  Matched: {country.matchedAlias}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TextCountryInput; 