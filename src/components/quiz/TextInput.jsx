import React, { useState, useMemo } from 'react';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useQuizActions } from '../../hooks/useQuizActions.js';
import { useCollapsible } from '../../hooks/useCollapsible.js';
import { CountryTextEntry } from '../base/CountryTextEntry.jsx';
import { useComponentState } from '../../hooks/useComponentState.js';

export function TextInput() {
  const { state } = useQuiz();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } = useComponentState('name');
  
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
  const [allowSuggestions, setAllowSuggestions] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // Compute if the last guess was wrong
  React.useEffect(() => {
    if (componentStatus === 'active') {
      if (guesses.attempts?.length > 0 && guesses.status === 'incomplete') {
        setIsWrong(true);
      }
    }
  }, [componentStatus, guesses?.attempts, guesses?.status]);

  // Handle wrong guess timeout
  React.useEffect(() => {
    if (isWrong) {
      const timeoutId = setTimeout(() => {
        setIsWrong(false);
        setInput('');
        setSelectedCountry(null);
      }, 1000);
      return () => clearTimeout(timeoutId);
    } 
  }, [isWrong]);

  // Reset when prompt changes
  React.useEffect(() => {
    if (state.config.gameMode === 'sandbox') {
      setSelectedCountry(state.quizData[state.quiz.prompt.quizDataIndex]?.country);
      setInput(state.quizData[state.quiz.prompt.quizDataIndex]?.country || '');
      setAllowSuggestions(true);
    } else {  
      setSelectedCountry(null);
      setInput('');
      setAllowSuggestions(true);
      setIsWrong(false);
    }
  }, [state.config.gameMode, state.quizData, state.quiz.prompt.quizDataIndex, state.quiz.status]);

  // Handle review mode and other status changes
  React.useEffect(() => {
    if (componentStatus === 'reviewing' && correctValue) {
      setInput(correctValue);
      setSelectedCountry(correctValue);
      setAllowSuggestions(false);
    } else if (componentStatus === 'prompting') {
      setInput(state.quizData[state.quiz.prompt.quizDataIndex]?.country || '');
      setSelectedCountry(null);
      setAllowSuggestions(false);
    } else if (componentStatus === 'active' && isWrong && selectedCountry) {
      setInput(selectedCountry);
      setAllowSuggestions(false);
    } else if (componentStatus === 'disabled') {
      setInput('');
      setSelectedCountry(null);
      setAllowSuggestions(false);
    } else if (componentStatus === 'active') {
      // Allow suggestions when component is active and not in wrong state
      setAllowSuggestions(true);
    }
  }, [componentStatus, correctValue, isWrong, selectedCountry, state.quizData, state.quiz.prompt.quizDataIndex]);

  const handleCountryClick = (country) => {
    if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      sandboxSelect({ inputType: 'name', countryValue: country.country });
    } else if (state.config.gameMode === 'quiz') {
      if (!disabled && !incorrectValues.includes(country.country)) {
        setInput(country.country);
        setSelectedCountry(country.country);
        setAllowSuggestions(false);
      }
    }
  };

  const handleValueChange = (newValue) => {
    setInput(newValue);
    setSelectedCountry(null);
    setAllowSuggestions(true);
  };

  const handleSubmit = () => {
    if (selectedCountry && componentStatus === 'active') {
      submitAnswer('name', selectedCountry);
    }
  };

  const getSuggestionStyle = (country) => {
    const isIncorrect = incorrectValues.includes(country.country);
    return {
      cursor: isIncorrect ? 'not-allowed' : 'pointer',
      color: isIncorrect ? '#999' : 'black',
      opacity: isIncorrect ? 0.5 : 1,
      textDecoration: isIncorrect ? 'line-through' : 'none'
    };
  };

  const getInputStyle = () => {
    return {
      backgroundColor: isWrong ? '#fee' : (disabled ? '#f5f5f5' : '#fff'),
      color: isWrong ? '#c33' : (disabled ? '#999' : '#333'),
      cursor: (disabled || isWrong) ? 'not-allowed' : 'text'
    };
  };

  const getSuggestionPriority = (a, b) => {
    const aIsIncorrect = incorrectValues.includes(a.country);
    const bIsIncorrect = incorrectValues.includes(b.country);
    
    // If one is incorrect and the other isn't, put the correct one first
    if (aIsIncorrect && !bIsIncorrect) return 1;
    if (!aIsIncorrect && bIsIncorrect) return -1;
    return 0;
  };

  const handleCountryHover = (country) => {
  };

  const handleCountryHoverLeave = () => {
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
          <CountryTextEntry
            value={input}
            onValueChange={handleValueChange}
            onCountryClick={handleCountryClick}
            onCountryHover={handleCountryHover}
            onCountryHoverLeave={handleCountryHoverLeave}
            getSuggestionStyle={getSuggestionStyle}
            getInputStyle={getInputStyle}
            disabled={disabled || isWrong}
            getSuggestionPriority={getSuggestionPriority}
            placeholder="Type a country name..."
            allowSuggestions={allowSuggestions && guesses?.status !== 'completed'}
          />
        </div>
      </div>
    </div>
  );
} 