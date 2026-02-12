import React, { useState, useMemo } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizActions } from '../hooks/useQuizActions.js';
// import { useCollapsible } from '../../hooks/useCollapsible.js';
import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
import { CountryTextEntry } from '@/components/CountryTextEntry.jsx';
import { useComponentState } from '../hooks/useComponentState.js';
import { SubmitButton } from '@/components/SubmitButton.jsx';
import './TextInput.css';

export function QuizTextInput() {
  const { state } = useQuiz();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } =
    useComponentState('name');

  const isCollapsed = useMemo(() => {
    if (componentStatus === 'prompting') return true;
    if (
      (componentStatus === 'completed' || componentStatus === 'failed') &&
      state.quiz.status === 'active'
    ) {
      return true;
    }
    return false;
  }, [componentStatus, state.quiz.status]);

  // const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);

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
      setSelectedCountry(
        state.quizData[state.quiz.prompt.quizDataIndex]?.country,
      );
      setInput(state.quizData[state.quiz.prompt.quizDataIndex]?.country || '');
      setAllowSuggestions(true);
    } else {
      setSelectedCountry(null);
      setInput('');
      setAllowSuggestions(true);
      setIsWrong(false);
    }
  }, [
    state.config.gameMode,
    state.quizData,
    state.quiz.prompt.quizDataIndex,
    state.quiz.status,
  ]);

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
  }, [
    componentStatus,
    correctValue,
    isWrong,
    selectedCountry,
    state.quizData,
    state.quiz.prompt.quizDataIndex,
  ]);

  const handleCountryClick = (country) => {
    if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      sandboxSelect({ inputType: 'name', countryValue: country.country });
    } else {
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

  // Get className for suggestions based on state
  const getSuggestionClassName = (country) => {
    const isIncorrect = incorrectValues.includes(country.country);
    return isIncorrect ? 'quiz-text-input__suggestion--incorrect' : '';
  };

  const getSuggestionPriority = (a, b) => {
    const aIsIncorrect = incorrectValues.includes(a.country);
    const bIsIncorrect = incorrectValues.includes(b.country);

    // If one is incorrect and the other isn't, put the correct one first
    if (aIsIncorrect && !bIsIncorrect) return 1;
    if (!aIsIncorrect && bIsIncorrect) return -1;
    return 0;
  };

  const handleCountryHover = (country) => {};

  const handleCountryHoverLeave = () => {};

  const submitButtonStatus = useMemo(() => {
    if (guesses?.status === 'completed') return 'completed';
    if (isWrong) return 'incorrect';
    if (selectedCountry && componentStatus === 'active') return 'active';
    return 'disabled';
  }, [selectedCountry, guesses?.status, isWrong, disabled, componentStatus]);

  const containerTitle = useMemo(() => {
    return `Country Name ${componentStatus === 'completed' ? '✓' : componentStatus === 'incorrect' ? '✗' : ''}`;
  }, [componentStatus]);
  return (
    <div className="quiz-text-input">
      <CollapsibleContainer
        defaultCollapsed={isCollapsed}
        title={containerTitle}
        classNames={componentStatus}
        content={
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '8px',
              position: 'relative',
              overflow: 'visible',
              alignItems: 'center',
            }}
          >
            <SubmitButton
              handleSubmit={handleSubmit}
              status={submitButtonStatus}
            />
            <CountryTextEntry
              value={input}
              onValueChange={handleValueChange}
              onCountryClick={handleCountryClick}
              onCountryHover={handleCountryHover}
              onCountryHoverLeave={handleCountryHoverLeave}
              getSuggestionClassName={getSuggestionClassName}
              disabled={disabled || isWrong}
              getSuggestionPriority={getSuggestionPriority}
              placeholder="Type a country name..."
              allowSuggestions={
                allowSuggestions && guesses?.status !== 'completed'
              }
            />
          </div>
        }
      />
    </div>
  );
}
