import React, { useState, useEffect, useMemo } from 'react';
import { BaseMap } from '../base/BaseMap.jsx';
import allCountryData from '../../data/country_data.json';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useQuizActions } from '../../hooks/useQuizActions.js';
import { useCollapsible } from '../../hooks/useCollapsible.js';
import { useComponentState } from '../../hooks/useComponentState.js';

function getCountryViewWindow(countryCode) {
  const countryData = allCountryData.find(country => country.code === countryCode);
  if (countryData?.location) {
    return { 
      coordinates: [countryData.location.long, countryData.location.lat], 
      zoom: 8
    };
  }
  return { coordinates: [0, 0], zoom: 1 };
}

export function WorldMap() {
  const { state } = useQuiz();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } = useComponentState('location');
  const defaultCollapsed = useMemo(() => {
    if (componentStatus === 'prompting') return false;
    if ((componentStatus === 'completed' || componentStatus === 'failed') && state.quiz.status === 'active') {
      return true;
    }
    return false;
  }, [componentStatus, state.quiz.status]);

  const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  
  // color country based on state
  const getCountryStyle = (countryCode) => {
    const isIncorrect = incorrectValues.includes(countryCode);
    const isCorrect = countryCode === correctValue && (componentStatus === 'completed' || componentStatus === 'prompting' || componentStatus === 'reviewing');
    const isSelected = countryCode === selectedCountry;
    const isHovered = countryCode === hoveredCountry;

    const getColor = (isCorrect, isIncorrect, isSelected, isHovered) => {
      return (
        isCorrect ? "var(--input-option-correct)" :
        isIncorrect ? "var(--input-option-incorrect)" :
        isSelected ? "var(--input-option-selected)" :
        isHovered ? "var(--input-option-hover)" : "var(--input-option-neutral)"
      );
    };
    const getStroke = (isCorrect, isIncorrect, isSelected, isHovered) => {
      return (
        isCorrect ? "var(--input-option-correct-stroke)" :
        isIncorrect ? "var(--input-option-incorrect-stroke)" :
        isSelected ? "var(--input-option-selected-stroke)" :
        isHovered ? "var(--input-option-hover-stroke)" : "var(--map-default-outline)"
      );
    }
    return {
      fill: getColor(isCorrect, isIncorrect, isSelected, isHovered),
      stroke: getStroke(isCorrect, isIncorrect, isSelected, isHovered),
      strokeWidth: 0.3,
      cursor: isIncorrect ? "not-allowed" : "pointer",
      outline: "none"
    }
  }
  // Reset selection and view when disabled
  useEffect(() => {
    if (disabled) {
      setSelectedCountry(null);
      // setViewWindow(defaultViewWindow);
    }
  }, [disabled, defaultViewWindow]);

  useEffect(() => {
    if (state.config.gameMode === 'sandbox' && state.quiz.prompt.quizDataIndex !== null) {
      setSelectedCountry(state.quizData[state.quiz.prompt.quizDataIndex].code);
    }
  }, [state.config.gameMode, state.quiz.prompt.quizDataIndex]);

  useEffect(() => {
    let view = { coordinates: [0, 0], zoom: 1 };
    if ((componentStatus === 'reviewing' || componentStatus === 'prompting') && correctValue) {
      view = getCountryViewWindow(correctValue);
    }
    setDefaultViewWindow(view);
  }, [componentStatus, correctValue]);

  const handleCountryClick = (countryCode) => {
    if (disabled) return;
    if (countryCode && !incorrectValues.includes(countryCode) && state.config.gameMode === 'quiz') {
      setSelectedCountry(countryCode);
    } else if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      sandboxSelect({ inputType: 'location', countryValue: countryCode });
    }
  };

  const handleSubmit = () => {
    if (selectedCountry && !disabled) {
      submitAnswer('location', selectedCountry);
    }
  };

  const onMouseEnter = (countryCode) => {
    // Allow hovering on correct country when component is active
    if (!disabled && !incorrectValues.includes(countryCode)) {
      // Only allow hover on correct country if component is active
      if (countryCode === correctValue && componentStatus !== 'active') {
        return; // Don't hover correct country when not active
      }
      setHoveredCountry(countryCode);
    }
  };
  const onMouseLeave = () => {
    if (!disabled) {
      setHoveredCountry(null);
    }
  };

  const getSmallCountryPriority = (countryCode) => {
    if (incorrectValues.includes(countryCode)) {
      return -1;
    } else if (selectedCountry === countryCode) {
      return 1;
    } else if (countryCode === correctValue && (componentStatus === 'completed' || componentStatus === 'prompting' || componentStatus === 'reviewing')) {
      return 1;
    } else {
      return 0;
    }
  };
  
  return (
    <div className={`world-map component-panel status-${componentStatus} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="component-panel__title-container">
        <button 
          className="component-panel__toggle-button" 
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expand World Map' : 'Collapse World Map'}
        >
          {isCollapsed ? '▶ World Map' : '▼ World Map'}
        </button>
      </div>
      <div className="component-panel__content">
      {/* <div style={{
        // position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        gap: '5px',
        zIndex: 1000
      }}> */}
        {componentStatus === 'active' && guesses?.status === 'incomplete' && (
          <button
            onClick={handleSubmit}
            disabled={!selectedCountry || disabled}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '8px 12px',
              fontSize: '14px',
              fontFamily: 'monospace',
              borderRadius: '4px',
              border: `1px solid ${selectedCountry && !disabled ? 'var(--color-submit-button-outline)' : 'var(--color-disabled)'}`,
              backgroundColor: selectedCountry && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)',
              color: selectedCountry && !disabled ? '#fff' : 'var(--text-primary)',
              cursor: selectedCountry && !disabled ? 'pointer' : 'not-allowed'
            }}
            title="Submit map selection"
          >
            Submit Map
          </button>
        )}
        <BaseMap
          onCountryHover={onMouseEnter}
          onCountryHoverLeave={onMouseLeave}
          onCountryClick={handleCountryClick}
          getCountryStyle={getCountryStyle}
          getSmallCountryPriority={getSmallCountryPriority}
          disabled={disabled}
          className="world-map__base-map"
          initialView={defaultViewWindow}
          showGraticule={true}
        />
      </div>
    </div>
  );
}