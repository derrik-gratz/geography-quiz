import React, { useState, useMemo, useEffect } from 'react';
import { useQuiz } from '../state/quizProvider.jsx';
import { useQuizActions } from '../hooks/useQuizActions.js';
import countryData from '@/data/country_data.json';
import flagColors from '@/data/flag_colors.json';
import quizSets from '@/data/quiz_sets.json';
import { useModalityState } from '../state/modalityProvider.jsx';
import { syncModalityStateWithQuizState } from '../hooks/useComponentState.js';
import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
import { SubmitButton } from '@/components/SubmitButton.jsx';
import { shuffleArray } from '@/utils/RNG.js';

import './FlagSelect.css';

const availableColors = [
  { name: 'red', color: '#FF0000' },
  { name: 'white', color: '#FFFFFF' },
  { name: 'blue', color: '#0000FF' },
  { name: 'green', color: '#00FF00' },
  { name: 'black', color: '#000000' },
  { name: 'yellow', color: '#FFFF00' },
  { name: 'orange', color: '#ffa500' },
];

export function QuizFlagSelect() {
  const state = useQuiz();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { componentStatus, correctValue, incorrectValues, disabled, collapsed, containerTitle } =
  useModalityState();

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState(null);

  syncModalityStateWithQuizState();

    // Reset when prompt changes or when disabled
  React.useEffect(() => {
    if (state.config.gameMode === 'sandbox') {
      setSelectedFlag(state.quizData[state.quiz.prompt.quizDataIndex].flagCode);
    } else {
      setSelectedFlag(null);
      setSelectedColors([]);
    }
  }, [
    disabled,
    state.config.gameMode,
    state.quizData,
    state.quiz.prompt.quizDataIndex,
  ]);

  const handleFlagClick = (flag) => {
    if (state.config.gameMode === 'sandbox') {
      sandboxSelect({ inputType: 'flag', countryValue: flag });
    } else {
      if (!disabled && !incorrectValues.includes(flag)) {
        setSelectedFlag(flag);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedFlag && !disabled && componentStatus === 'incomplete') {
      submitAnswer('flag', selectedFlag);
      setSelectedFlag(null);
    }
  };

  const handleColorClick = (color) => {
    setSelectedColors((prevColors) => {
      if (prevColors.includes(color)) {
        return prevColors.filter((c) => c !== color);
      }
      return [...prevColors, color];
    });
  };

  // Get all countries with flags as base
  const allCountries = countryData.filter((country) => country.flagCode)
  const filterByQuizSet = (country) => {
    if (state.config.quizSet && state.config.quizSet !== 'all') {
      const quizSetData = quizSets.find((q) => q.name === state.config.quizSet);
      if (quizSetData) {
        return quizSetData.countryCodes.includes(country.code);
      }
    }
    return true;
  };
  const filterByColors = (country) => {
    if (selectedColors.length > 0) {
      return selectedColors.every((color) =>
        flagColors[color].includes(country.flagCode),
      );
    }
    return true;
  };

  const filteredFlags = useMemo(() => {
    let countries = allCountries.filter((country) => {
      if (['reviewing', 'reviewing_success', 'reviewing_failure', 'completed'].includes(componentStatus)) {
        const guessedFlagCodes = incorrectValues || [];
        return (
          country.flagCode === correctValue ||
          guessedFlagCodes.includes(country.flagCode)
        );
      }
      if (componentStatus === 'sandbox') {
        return filterByQuizSet(country) && filterByColors(country);
      } else if (componentStatus === 'prompting') {
        return country.flagCode === correctValue;
      } else if (componentStatus === 'incomplete' && selectedColors.length === 0) {
        return true;
      } else if (componentStatus === 'incomplete') {
        return filterByColors(country);
      }
      return true;
    });

    // Sort so correct flag appears first
    if (componentStatus === 'reviewing' || componentStatus === 'completed') {
      countries.sort((a, b) => {
        if (a.flagCode === correctValue) return -1;
        if (b.flagCode === correctValue) return 1;
        return 0;
      });
    } else {
      countries = shuffleArray(countries, 5324);
    }
    const flags = [...new Set(countries.map((country) => country.flagCode))];
    return flags;
  }, [
    allCountries,
    componentStatus,
    correctValue,
    state.config.quizSet,
    selectedColors,
  ]);

  const getFlagClassName = (country) => {
    const baseClassName = `quiz-flag-select__flag-icon`;
    let className = baseClassName;
    if (componentStatus !== 'incomplete') {
      if (country === correctValue) {
        className += ` ${baseClassName}_correct`;
      }
    }
    if (incorrectValues.includes(country)) {
      className += ` ${baseClassName}_incorrect`;
    } else if ((componentStatus === 'incomplete' || componentStatus === 'sandbox') && selectedFlag === country) {
      className += ` ${baseClassName}_selected`;
    }
    className += ` fi fi-${country.toLowerCase()}`;
    return className;
  };

  const submitButtonStatus = useMemo(() => {
    if (componentStatus === 'completed') return 'completed';
    if (componentStatus === 'failed') return 'incorrect';
    if (selectedFlag && componentStatus === 'incomplete') return 'active';
    return 'disabled';
  }, [selectedFlag, componentStatus, disabled]);

  return (
    <CollapsibleContainer
      defaultCollapsed={collapsed ?? false}
      title={containerTitle}
      classNames={componentStatus}
      content={
        <div className={`quiz-flag-select`}>
          {!disabled && (
            <div
              className="quiz-flag-select__controls"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'nowrap',
              }}
            >
              <SubmitButton
                handleSubmit={handleSubmit}
                status={submitButtonStatus}
              />
              <div
                className="quiz-flag-select__color-filter"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: '1 1 auto',
                  minWidth: 0,
                }}
              >
                <span
                  className="quiz-flag-select__color-filter-label"
                  style={{
                    whiteSpace: 'normal',
                    flexShrink: 0,
                    minWidth: 'fit-content',
                    maxWidth: 'none',
                  }}
                >
                  Filter by colors:
                </span>
                <div
                  className="quiz-flag-select__color-filter-colors"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                    alignItems: 'center',
                  }}
                >
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      className={`quiz-flag-select__color-filter-color ${selectedColors.includes(color.name) ? 'quiz-flag-select__color-filter-color_selected' : ''}`}
                      onClick={() => handleColorClick(color.name)}
                      style={{ backgroundColor: color.color, flexShrink: 0 }}
                      title={color.name}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="quiz-flag-select__flag-grid">
            {filteredFlags.map((flag) => (
              <span
                key={flag}
                className={getFlagClassName(flag)}
                onClick={() => handleFlagClick(flag)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${flag} flag`}
                style={{
                  // opacity: disabled || incorrectValues.includes(country.flagCode) ? 0.6 : 1,
                  cursor:
                    disabled || incorrectValues.includes(flag)
                      ? 'not-allowed'
                      : 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}
