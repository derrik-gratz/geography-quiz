import React, { useState, useEffect } from 'react';
import countryData from '../../data/country_data.json';

export function CountryTextEntry({ 
  value,
  onValueChange,
  onCountryClick,
  onCountryHover,
  onCountryHoverLeave,
  getSuggestionStyle,
  getInputStyle,
  disabled,
  getSuggestionPriority,
  placeholder,
  allowSuggestions
}) {  
  const [internalInput, setInternalInput] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [internalShowSuggestions, setInternalShowSuggestions] = useState(false);

  // Use controlled value if provided, otherwise use internal state
  const inputValue = value ? value : internalInput;
  
  // showSuggestions is true only if allowSuggestions is true AND we have suggestions to show
  const showSuggestions = allowSuggestions && internalShowSuggestions && suggestions.length > 0;

  // Sync internal state with controlled value
  useEffect(() => {
    if (value !== undefined) {
      setInternalInput(value);
    }
  }, [value]);

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setInternalShowSuggestions(false);
    }
  }, [disabled]);

  // Reset internal show state when allowSuggestions becomes false
  useEffect(() => {
    if (!allowSuggestions) {
      setInternalShowSuggestions(false);
    }
  }, [allowSuggestions]);

  const normalizeText = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Update internal state
    setInternalInput(newValue);
    
    // Notify parent of value change
    if (onValueChange) {
      onValueChange(newValue);
    }

    // Filter and show suggestions
    if (newValue.length > 0) {
      const normalizedInput = normalizeText(newValue);
      let filtered = countryData.filter(c => {
        const allAliases = [c.country, ...(Array.isArray(c.aliases) ? c.aliases : [])].filter(Boolean);
        const matches = allAliases.map(name => normalizeText(name)).some(name => name.includes(normalizedInput));
        return matches;
      });
      
      // Apply custom sorting if provided
      if (getSuggestionPriority) {
        filtered = filtered.sort((a, b) => getSuggestionPriority(a, b));
      }
      
      filtered = filtered.slice(0, 10);
      setSuggestions(filtered);
      
      // Only show suggestions if allowed
      if (allowSuggestions) {
        setInternalShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setInternalShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (inputValue.length > 0 && suggestions.length > 0 && allowSuggestions !== false) {
      setInternalShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setInternalShowSuggestions(false);
    }, 100);
  };

//   const handleSuggestionClick = (country) => {
//     if (onCountryClick) {
//       onCountryClick(country);
//     }
//   };

  const defaultInputStyle = {
    width: '95%',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  const inputStyle = getInputStyle ? { ...defaultInputStyle, ...getInputStyle() } : defaultInputStyle;

  const defaultSuggestionStyle = {
    padding: '0.5rem',
    color: 'var(--text-primary)',
    borderBottom: '1px solid #eee',
    minHeight: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    width: '95%'
  };

  return (
    <div 
      className="text-input component-panel__content" 
      style={{ 
        position: 'relative', 
        overflow: 'visible', 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '8px', 
        flex: 1,
        position: 'relative' 
      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder || "Type a country name..."}
        disabled={disabled}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {showSuggestions && (
        <ul style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '100%',
          background: '#fff',
          border: '1px solid #ccc',
          borderTop: 'none',
          minHeight: '40px', // Ensure at least one suggestion is visible
          maxHeight: '120px',
          overflowY: 'auto',
          zIndex: 1000,
          margin: 0,
          padding: 0,
          listStyle: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          {suggestions.map(country => {
            const suggestionStyle = getSuggestionStyle 
              ? { ...defaultSuggestionStyle, ...getSuggestionStyle(country) }
              : defaultSuggestionStyle;
            
            return (
              <li
                key={country.code}
                onMouseDown={() => onCountryClick(country)}
                style={suggestionStyle}
                onMouseEnter={() => onCountryHover(country)}
                onMouseLeave={() => onCountryHoverLeave()}
              >
                <div>{country.country}</div>
                {country.aliases && country.aliases.length > 0 && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)', 
                    fontStyle: 'italic' 
                  }}>
                    Aliases: {Array.isArray(country.aliases) ? country.aliases.join(', ') : country.aliases}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 