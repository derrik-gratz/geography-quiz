import React, { useState, useMemo, useRef } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizActions } from '../hooks/useQuizActions.js';
import countryData from '../data/country_data.json';
import { usePromptState } from '../hooks/usePromptState.js';

export function TextInput() {
  const { state } = useQuiz();
  const { submitAnswer } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } = usePromptState('name');

  
  const [input, setInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // Compute if the last guess was wrong
  const isWrongGuess = useMemo(() => {
    if (componentStatus === 'active') {
      if (!guesses.attempts || guesses.attempts.length === 0) return false;
      if (guesses.attempts.length > 0 && guesses.status === 'incomplete') {
        return true;
      }
    }
    return false;
  }, [componentStatus, guesses?.attempts, guesses?.status, correctValue, guesses?.attempts.length]);

  // Handle wrong guess timeout - show incorrect guess for 1 second
  React.useEffect(() => {
    if (isWrongGuess) {
      setIsWrong(true);
      const timeoutId = setTimeout(() => {
        setIsWrong(false);
        setInput('');
        setSelectedCountry(null);
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // If guess becomes correct or status changes, clear immediately
      setIsWrong(false);
    }
  }, [isWrongGuess]);


  
  const handleCountryClick = (country) => {
    if (!disabled && !incorrectValues.includes(country)) {
      setInput(country.country);
      setSelectedCountry(country.country);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  // Reset when prompt changes
  React.useEffect(() => {
    setSelectedCountry(null);
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsWrong(false);
  }, [state.quiz.prompt.quizDataIndex, state.quiz.status]);

  
  const handleSubmit = () => {
    if (selectedCountry && componentStatus === 'active') {
      submitAnswer('name', selectedCountry);
      // Don't clear selectedCountry here - let it persist to show wrong guess during timeout
    }
  };

  // Get all countries with flags as base
  const allCountries = useMemo(() => {
    return countryData.filter(country => country.country);
  }, []);

  // Handle the 4 input states:
  // 1. Disabled with correct answer shown (review mode)
  // 2. Disabled with nothing highlighted (initial/other disabled states)
  // 3. Enabled for user input (active quiz)
  // 4. Temporarily timed out, displaying incorrect guess
  // 5. sandbox
  React.useEffect(() => {
    if (componentStatus === 'reviewing' && correctValue) {
      setInput(correctValue);
      setSelectedCountry(correctValue);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    else if (componentStatus === 'active' && isWrong && selectedCountry) {
      setInput(selectedCountry);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    else if (componentStatus === 'disabled') {
      setInput('');
      setSelectedCountry(null);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    // State 3: Enabled - don't override user input, let handleChange manage it
    // No action needed, user can type freely
  }, [componentStatus, correctValue, isWrong, selectedCountry]);

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
      const filtered = allCountries.filter(c => {
        const allAliases = [c.country, ...(Array.isArray(c.aliases) ? c.aliases : [])].filter(Boolean);
        const matches = allAliases.map(name => normalizeText(name)).some(name => name.includes(normalizedInput));
        return matches;
      });
      
      // Sort suggestions: correct countries first, then incorrect countries at the bottom
      const sortedSuggestions = filtered.sort((a, b) => {
        const aIsIncorrect = incorrectValues.includes(a.country);
        const bIsIncorrect = incorrectValues.includes(b.country);
        
        // If one is incorrect and the other isn't, put the correct one first
        if (aIsIncorrect && !bIsIncorrect) return 1;
        if (!aIsIncorrect && bIsIncorrect) return -1;
        
        // If both are the same type (both correct or both incorrect), maintain original order
        return 0;
      }).slice(0, 10);
      
      setSuggestions(sortedSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
      <button
          onClick={handleSubmit}
          disabled={!selectedCountry || disabled}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            borderRadius: '4px',
            border: guesses?.status === 'completed' ? '1px solid var(--input-option-correct)' : 
                    isWrong ? '1px solid var(--input-option-incorrect)' :
                    `1px solid ${selectedCountry && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)'}`,
            backgroundColor: guesses?.status === 'completed' ? 'var(--input-option-correct)' : 
                            isWrong ? 'var(--input-option-incorrect)' : 
                            (selectedCountry && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)'),
            color: guesses?.status === 'completed' || isWrong ? '#fff' : 
                   (selectedCountry && !disabled ? '#fff' : 'var(--text-primary)'),
            cursor: (selectedCountry && componentStatus === 'active') ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap'
          }}
        >
          {state.quiz.status === 'reviewing' ? 'Answer:' : guesses?.status === 'completed' ? 'Correct!' : isWrong ? 'Incorrect!' : 'Submit'}
        </button>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Type a country name..."
          disabled={disabled || isWrong}
          style={{ 
            flex: 1,
            padding: '0.5rem', 
            fontSize: '1rem', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            // State 4: Temporarily wrong - red background
            // State 1: Review mode - neutral/gray background
            // State 2: Disabled - neutral/gray background  
            // State 3: Enabled - white background
            backgroundColor: isWrong ? '#fee' : (disabled ? '#f5f5f5' : '#fff'),
            color: isWrong ? '#c33' : (disabled ? '#999' : '#333'),
            cursor: (disabled || isWrong) ? 'not-allowed' : 'text'
          }}
          // onFocus: Shows suggestions when user clicks into the input field (if there's already text)
          // Only allow focus in enabled state (not disabled, not wrong, not complete)
          onFocus={() => {
            if (componentStatus === 'active' && input) {
              setShowSuggestions(true);
            }
          }}
          // onBlur: Hides suggestions when user clicks away from the input field
          // setTimeout prevents suggestions from disappearing immediately when clicking on a suggestion
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
        
      </div>
      {showSuggestions && suggestions.length > 0 && guesses?.status !== 'completed' && (
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
          {suggestions.map(country => {
            const isIncorrect = incorrectValues.includes(country.country);
            return (
              <li
                key={country.code}
                onMouseDown={() => handleCountryClick(country)}
                style={{ 
                  padding: '0.5rem', 
                  cursor: isIncorrect ? 'not-allowed' : 'pointer',
                  color: isIncorrect ? '#999' : 'black',
                  borderBottom: '1px solid #eee',
                  minHeight: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  backgroundColor: 'transparent',
                  opacity: isIncorrect ? 0.5 : 1,
                  textDecoration: isIncorrect ? 'line-through' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isIncorrect) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div>{country.country}</div>
                {country.aliases && country.aliases.length > 0 && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: isIncorrect ? '#bbb' : '#666', 
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