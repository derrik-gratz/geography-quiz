import React, { useState, useMemo, useRef } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizActions } from '../hooks/useQuizActions.js';
import { useCollapsible } from '../hooks/useCollapsible.js';
import countryData from '../data/country_data.json';
import { useComponentState } from '../hooks/useComponentState.js';

export function TextInput() {
  const { state } = useQuiz();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } = useComponentState('name');
  // Collapse when name is prompted, or when completed/failed while prompt is still active
  const defaultCollapsed = useMemo(() => {
    if (componentStatus === 'prompting') return true;
    if ((componentStatus === 'completed' || componentStatus === 'failed') && state.quiz.status === 'active') {
      return true;
    }
    return false;
  }, [componentStatus, state.quiz.status]);
  const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);

  
  const [input, setInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // Compute if the last guess was wrong
  React.useEffect(() => {
    if (componentStatus === 'active') {
      if (guesses.attempts?.length > 0 && guesses.status === 'incomplete') {
        setIsWrong(true);
      }
    }
  }, [componentStatus, guesses?.attempts, guesses?.status]);

  // Handle wrong guess timeout - show incorrect guess for 1 second
  React.useEffect(() => {
    if (isWrong) {
      const timeoutId = setTimeout(() => {
        setIsWrong(false);
        setInput('');
        setSelectedCountry(null);
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    } 
  }, [isWrong]);

  const handleCountryClick = (country) => {
    if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      // setInput(country.country);
      // setSelectedCountry(country.country);
      // setSuggestions([]);
      // setShowSuggestions(false);
      sandboxSelect({ inputType: 'name', countryValue: country.country });
    } else if (state.config.gameMode === 'quiz') {
      if (!disabled && !incorrectValues.includes(country)) {
        setInput(country.country);
        setSelectedCountry(country.country);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  }

  // Reset when prompt changes
  React.useEffect(() => {
    if (state.config.gameMode === 'sandbox') {
      setSelectedCountry(state.quizData[state.quiz.prompt.quizDataIndex].country);
      setInput(state.quizData[state.quiz.prompt.quizDataIndex].country);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {  
      setSelectedCountry(null);
      setInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsWrong(false);
    }
  }, [state.config.gameMode, state.quizData, state.quiz.prompt.quizDataIndex, state.quiz.status]);

  
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

  React.useEffect(() => {
    // Disabled with correct answer shown (review mode)
    if (componentStatus === 'reviewing' && correctValue) {
      setInput(correctValue);
      setSelectedCountry(correctValue);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    else if (componentStatus === 'active' && isWrong && selectedCountry) {
      //Temporarily timed out, displaying incorrect guess
      setInput(selectedCountry);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    else if (componentStatus === 'disabled') {
      setInput('');
      setSelectedCountry(null);
      setSuggestions([]);
      setShowSuggestions(false);
    } //else if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
    //   setInput(state.quizData[state.quiz.prompt.quizDataIndex].country);
    //   setSelectedCountry(state.quizData[state.quiz.prompt.quizDataIndex].country);
    //   setSuggestions([]);
    //   setShowSuggestions(false);
    // }
    // State 3: Enabled - don't override user input, let handleChange manage it
    // No action needed, user can type freely
  }, [componentStatus, correctValue, isWrong, selectedCountry, state.config.gameMode, state.quizData, state.quiz.prompt.quizDataIndex]);



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
    <div className={`text-input component-panel status-${componentStatus} ${isCollapsed ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
      <div className="component-panel__title-container">
        <button 
          className="component-panel__toggle-button" 
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expand Country Name' : 'Collapse Country Name'}
        >
          {isCollapsed ? '▶ Country Name' : '▼ Country Name'}
        </button>
      </div>
      <div className="component-panel__content" style={{ position: 'relative', overflow: 'visible' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', position: 'relative' }}>
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
        <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Type a country name..."
          disabled={disabled || isWrong}
          style={{ 
            width: '95%',
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
          zIndex: 1000,
          margin: 0,
          padding: 0,
          listStyle: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
      </div>
      </div>
    </div>
  );
} 