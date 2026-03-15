import React, { useState, useMemo } from 'react';
import { useQuiz } from '@/features/quiz/state/quizProvider.jsx';
import { useQuizActions } from '@/features/quiz/hooks/useQuizActions.js';
import { useModalityState } from '@/features/quiz/state/modalityProvider.jsx';
import { syncModalityStateWithQuizState } from '@/features/quiz/hooks/useComponentState.js';
import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
import { CountryTextEntry } from '@/components/CountryTextEntry.jsx';
import { SubmitButton } from '@/components/SubmitButton.jsx';
import './TextInput.css';

import countryData from '@/data/country_data.json';
// import './CountryTextEntry.css';
import AutoComplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
// import { createFilterOptions } from '@mui/material/Autocomplete';

export function QuizTextInput() {
  const state = useQuiz();
  syncModalityStateWithQuizState();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { componentStatus, correctValue, incorrectValues, disabled, collapsed, containerTitle } =
    useModalityState();

  // const [input, setInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  // const [allowSuggestions, setAllowSuggestions] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // Compute if the last guess was wrong (active + at least one incorrect attempt)
  React.useEffect(() => {
    if (componentStatus === 'incomplete' && incorrectValues.length > 0) {
      setIsWrong(true);
    }
  }, [componentStatus, incorrectValues.length]);
  React.useEffect(() => {
    if (isWrong) {
      const timeoutId = setTimeout(() => {
          setIsWrong(false);
          // setInput('');
          setSelectedCountry(null);
        }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isWrong]);

  // Reset when prompt changes
  React.useEffect(() => {
    if (componentStatus === 'sandbox') {
      setSelectedCountry(
        state.quizData[state.quiz.prompt.quizDataIndex]?.country,
      );
    } else if (componentStatus === 'completed') {
      setSelectedCountry(getCountryData(correctValue));
    } else if (componentStatus === 'prompting') {
      setSelectedCountry(getCountryData(state.quizData[state.quiz.prompt.quizDataIndex]?.country));
    } else if (componentStatus === 'disabled') {
      setSelectedCountry(null);
    // } else if (componentStatus === 'incomplete') {
    //   setSelectedCountry(null);
    } else if (componentStatus === 'incomplete') {
      setSelectedCountry(null);
    } else {
      setSelectedCountry(null);
    }
  }, [
    componentStatus,
    // state.config.gameMode,
    state.quizData,
    state.quiz.prompt.quizDataIndex,
    correctValue,
  ]);

  // Handle review mode and other status changes
  // React.useEffect(() => {
  //   if (componentStatus === 'reviewing' && correctValue) {
  //     // setInput(correctValue);
  //     setSelectedCountry(correctValue);
  //     // setAllowSuggestions(false);
  //   } else if (componentStatus === 'prompting') {
  //     // setInput(state.quizData[state.quiz.prompt.quizDataIndex]?.country || '');
  //     setSelectedCountry(null);
  //     // setAllowSuggestions(false);
  //   } else if (componentStatus === 'disabled') {
  //     // setInput('');
  //     setSelectedCountry(null);
  //     // setAllowSuggestions(false);
  //   } else if (componentStatus === 'incomplete') {
  //     // setAllowSuggestions(true);
  //   }
  // }, [
  //   componentStatus,
  //   correctValue,
  //   isWrong,
  //   selectedCountry,
  //   state.quizData,
  //   state.quiz.prompt.quizDataIndex,
  // ]);

  const handleCountryChange = (country) => {
    if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      sandboxSelect({ inputType: 'name', countryValue: country.country });
    } else {
      if (!disabled && !incorrectValues.includes(country.country)) {
        // setInput(country.country);
        setSelectedCountry(country.country);
        // setAllowSuggestions(false);
      }
    }
  };

  const normalizeText = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // const handleValueChange = (newValue) => {
  //   setInput(newValue);
  //   setSelectedCountry(null);
  //   setAllowSuggestions(true);
  // };

  const handleSubmit = () => {
    if (selectedCountry && componentStatus === 'incomplete') {
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

  const getCountryData = (country) => {
    return countryData.find((c) => c.country === country);
  };
  // const handleCountryHover = (country) => {};
  // console.log(componentStatus)
  // const handleCountryHoverLeave = () => {};
  React.useEffect(() => {
    console.log(componentStatus)
  }, [componentStatus])


  const value = useMemo(() => {
    if (componentStatus === 'sandbox') {
      return state.quizData[state.quiz.prompt.quizDataIndex]?.country;
    } else if (componentStatus === 'reviewing' && correctValue) {
      return getCountryData(correctValue);
    } else if (componentStatus === 'prompting') {
      return getCountryData(state.quizData[state.quiz.prompt.quizDataIndex]?.country);
    } else if (componentStatus === 'disabled') {
      return null;
    } else if (componentStatus === 'incomplete') {
      return null;
    } else if (componentStatus === 'incomplete' && selectedCountry) {
      return getCountryData(selectedCountry);
    } else if (componentStatus === 'completed') {
      return getCountryData(correctValue);
    } else {
      return null;
    }
  }, [componentStatus, correctValue, selectedCountry, state.quizData, state.quiz.prompt.quizDataIndex]);

  const submitButtonStatus = useMemo(() => {
    if (componentStatus === 'completed') return 'completed';
    if (isWrong) return 'incorrect';
    if (selectedCountry && componentStatus === 'incomplete') return 'active';
    return 'disabled';
  }, [selectedCountry, componentStatus, isWrong, disabled]);

  const customFiler = (options, { inputValue }) => {
    const normalizedInput = normalizeText(inputValue);
    return options.filter((option) => {
      return normalizeText(option.country).includes(normalizedInput) || option.aliases.some((alias) => normalizeText(alias).includes(normalizedInput));
    });
  };
  return (
    <div className="quiz-text-input">
      <CollapsibleContainer
        defaultCollapsed={collapsed ?? false}
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
    <AutoComplete
      value={value}
      options={countryData} //.map((country) => country.country + country.aliases.join(', '))}
      getOptionLabel={(option) => option.country}
      // getOptionKeys={(option) => option.country}
      onChange={(event, value) => {
        handleCountryChange(value);
      }}
      // isOptionEqualToValue={(option, value) => (option.country === value.country || option.aliases.includes(value.country)}
      sx={{
        width: '90%',
        backgroundColor: 'white',
        borderRadius: '4px',
      }}
      filterOptions={customFiler}
      disabled={disabled}
      renderOption={(props, option) => (
        <li {...props}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>{option.country}</div>
          {option.aliases && option.aliases.length > 0 && (
            <div className="country-text-entry__suggestion-aliases" style={{ paddingLeft: '1rem' }}>
              ({Array.isArray(option.aliases) ? option.aliases.join(', ') : option.aliases})
            </div>
          )}
          </div>
        </li>
      )}
      renderInput={(params) => <TextField {...params} placeholder={'Type a country...'} />}
    />
    {/* ) */}
  </div>
        }
      />
    </div>
  )

  return (
    <div className="quiz-text-input">
      <CollapsibleContainer
        defaultCollapsed={collapsed ?? false}
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
              value={value}
              handleChange={handleCountryChange}
              disabled={disabled || isWrong}
              getSuggestionPriority={getSuggestionPriority}
              defaultText="Type a country name..."
            />
          </div>
        }
      />
    </div>
  );
}
