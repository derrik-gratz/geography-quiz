import React, { useState } from 'react';
import countries from '../data/country_data.json';

export function TextCountryInput({ onSelect, promptResetKey, disabled = false }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isWrong, setIsWrong] = useState(false);

  React.useEffect(() => {
    if (promptResetKey) {
        setInput('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedCountry(null);
        setIsCorrect(false);
    }
  }, [promptResetKey]);

  // Reset when disabled (new prompt type)
  React.useEffect(() => {
    if (disabled) {
        setSelectedCountry(null);
        setIsCorrect(false);
    }
  }, [disabled]);
  
  React.useEffect(() => {
    setIsWrong(false);
    setIsCorrect(false);
    setSelectedCountry(null);
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, [promptResetKey]);
  
  const handleSelect = (country) => {
    setInput(country.country);
    setSelectedCountry(country);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (selectedCountry && onSelect) {
      const result = onSelect(selectedCountry);
      if (result && result.ok) {
        setIsCorrect(true);
      } else {
        setIsWrong(true);
        // Clear the incorrect state after 2 seconds to allow retry
        setTimeout(() => {
          setIsWrong(false);
          setSelectedCountry(null);
          setInput('');
        }, 1000);
      }
      // if (onAnswerFeedback) {
      //   onAnswerFeedback(result);
      // }
    }
  };

  const normalizeText = (text) => {
    return text
      .normalize('NFD') // Decompose characters with accents
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .toLowerCase();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 0) {
      const normalizedInput = normalizeText(value);
      const filtered = countries.filter(c => {
        const allAliases = [c.country, ...(Array.isArray(c.aliases) ? c.aliases : [])].filter(Boolean);
        const matches = allAliases.map(name => normalizeText(name)).some(name => name.includes(normalizedInput));
        return matches;
      }).slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Type a country name..."
          disabled={disabled || isCorrect}
          style={{ 
            flex: 1,
            padding: '0.5rem', 
            fontSize: '1rem', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            backgroundColor: (disabled || isCorrect || isWrong ) ? '#f5f5f5' : '#fff',
            color: (disabled || isCorrect || isWrong ) ? '#999' : '#333',
            cursor: (disabled || isCorrect || isWrong ) ? 'not-allowed' : 'text'
          }}
          // onFocus: Shows suggestions when user clicks into the input field (if there's already text)
          onFocus={() => input && !isCorrect && setShowSuggestions(true)}
          // onBlur: Hides suggestions when user clicks away from the input field
          // setTimeout prevents suggestions from disappearing immediately when clicking on a suggestion
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
        <button
          onClick={handleSubmit}
          disabled={!selectedCountry || disabled || isCorrect || isWrong }
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            borderRadius: '4px',
            border: '1px solid #007bff',
            backgroundColor: isCorrect ? '#28a745' : isWrong? '#dc3545' : (selectedCountry && !disabled ? '#007bff' : '#f8f9fa'),
            color: isCorrect ? '#fff' : (selectedCountry && !disabled ? '#fff' : '#6c757d'),
            cursor: (selectedCountry && !disabled && !isCorrect && !isWrong) ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap'
          }}
        >
          {isCorrect ? 'Correct!' : isWrong ? 'Incorrect!' : 'Submit'}
        </button>
      </div>
      {showSuggestions && suggestions.length > 0 && !isCorrect && (
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
          zIndex: 10,
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}>
          {suggestions.map(country => (
            <li
              key={country.code}
              onMouseDown={() => handleSelect(country)}
              style={{ 
                padding: '0.5rem', 
                cursor: 'pointer',
                color: 'black',
                borderBottom: '1px solid #eee',
                minHeight: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div>{country.country}</div>
              {country.aliases && country.aliases.length > 0 && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  fontStyle: 'italic' 
                }}>
                  Aliases: {Array.isArray(country.aliases) ? country.aliases.join(', ') : country.aliases}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 