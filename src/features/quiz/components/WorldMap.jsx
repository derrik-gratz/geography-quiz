import React, { useState, useEffect, useMemo } from 'react';
import { BaseMap } from '@/components/BaseMap.jsx';
import allCountryData from '@/data/country_data.json';
import { useQuiz } from '../state/quizProvider.jsx';
import { useQuizActions } from '../hooks/useQuizActions.js';
// import { useCollapsible } from '../../../hooks/useCollapsible.js';
import { useComponentState } from '../hooks/useComponentState.js';
import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
import { SubmitButton } from '@/components/SubmitButton.jsx';
import './WorldMap.css';

function getCountryViewWindow(countryCode) {
  const countryData = allCountryData.find(
    (country) => country.code === countryCode,
  );
  if (countryData?.location) {
    return {
      coordinates: [countryData.location.long, countryData.location.lat],
      zoom: 8,
    };
  }
  return { coordinates: [0, 0], zoom: 1 };
}

export function QuizWorldMap() {
  const state = useQuiz();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } =
    useComponentState('location');
  const defaultCollapsed = useMemo(() => {
    if (componentStatus === 'prompting') return false;
    if (
      (componentStatus === 'completed' || componentStatus === 'failed') &&
      state.quiz.status === 'active'
    ) {
      return true;
    }
    return false;
  }, [componentStatus, state.quiz.status]);

  // const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({
    coordinates: [0, 0],
    zoom: 1,
  });

  // Get country state (used for both className and style)
  const getCountryState = (countryCode) => {
    const isIncorrect = incorrectValues.includes(countryCode);
    const isCorrect =
      countryCode === correctValue &&
      (componentStatus === 'completed' ||
        componentStatus === 'prompting' ||
        componentStatus === 'reviewing');
    const isSelected = countryCode === selectedCountry;
    const isHovered = countryCode === hoveredCountry;

    if (isCorrect) return 'correct';
    if (isIncorrect) return 'incorrect';
    if (isSelected) return 'selected';
    if (isHovered) return 'hovered';
    return 'neutral';
  };

  const getCountryClassName = (countryCode) => {
    const state = getCountryState(countryCode);
    return `quiz-world-map__country--${state}`;
  };

  // Reset selection and view when disabled
  useEffect(() => {
    if (disabled) {
      setSelectedCountry(null);
      // setViewWindow(defaultViewWindow);
    }
  }, [disabled, defaultViewWindow]);

  useEffect(() => {
    if (
      state.config.gameMode === 'sandbox' &&
      state.quiz.prompt.quizDataIndex !== null
    ) {
      setSelectedCountry(state.quizData[state.quiz.prompt.quizDataIndex].code);
    } else {
      setSelectedCountry(null);
      setHoveredCountry(null);
    }
  }, [state.config.gameMode, state.quiz.prompt.quizDataIndex]);

  useEffect(() => {
    let view = { coordinates: [0, 0], zoom: 1 };
    if (
      (componentStatus === 'reviewing' || componentStatus === 'prompting') &&
      correctValue
    ) {
      view = getCountryViewWindow(correctValue);
    }
    setDefaultViewWindow(view);
  }, [componentStatus, correctValue]);

  const handleCountryClick = (countryCode) => {
    if (disabled) return;
    if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      sandboxSelect({ inputType: 'location', countryValue: countryCode });
    } else {
      countryCode &&
        !incorrectValues.includes(countryCode) &&
        setSelectedCountry(countryCode);
    }
  };

  const handleSubmit = () => {
    if (selectedCountry && !disabled) {
      submitAnswer('location', selectedCountry);
      setSelectedCountry(null);
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
    } else if (
      countryCode === correctValue &&
      (componentStatus === 'completed' ||
        componentStatus === 'prompting' ||
        componentStatus === 'reviewing')
    ) {
      return 1;
    } else {
      return 0;
    }
  };

  const submitButtonStatus = useMemo(() => {
    if (guesses?.status === 'completed') return 'completed';
    if (selectedCountry && componentStatus === 'active') return 'active';
    return 'disabled';
  }, [selectedCountry, guesses?.status, disabled, componentStatus]);

  const containerTitle = useMemo(() => {
    return `World Map ${componentStatus === 'completed' ? '✓' : componentStatus === 'incorrect' ? '✗' : ''}`;
  }, [componentStatus]);
  return (
    <CollapsibleContainer
      title={containerTitle}
      defaultCollapsed={defaultCollapsed}
      classNames={componentStatus}
      content={
        <div className="quiz-world-map">
          <BaseMap
            onCountryHover={onMouseEnter}
            onCountryHoverLeave={onMouseLeave}
            onCountryClick={handleCountryClick}
            getCountryClassName={getCountryClassName}
            getSmallCountryPriority={getSmallCountryPriority}
            disabled={disabled}
            className="world-map__base-map"
            initialView={defaultViewWindow}
            additionalControls={[
              <SubmitButton
                handleSubmit={handleSubmit}
                status={submitButtonStatus}
              />,
            ]}
            showGraticule={true}
          />
        </div>
      }
    />
  );
}
