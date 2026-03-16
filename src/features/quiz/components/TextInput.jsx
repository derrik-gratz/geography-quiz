import React, { useState, useMemo, useRef } from 'react';
import { useQuiz } from '@/features/quiz/state/quizProvider.jsx';
import { useQuizActions } from '@/features/quiz/hooks/useQuizActions.js';
import { useModalityState } from '@/features/quiz/state/modalityProvider.jsx';
import { syncModalityStateWithQuizState } from '@/features/quiz/hooks/useComponentState.js';
import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
import { SubmitButton } from '@/components/SubmitButton.jsx';
import './TextInput.css';
import countryData from '@/data/country_data.json';
import AutoComplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export function QuizTextInput() {
  const state = useQuiz();
  syncModalityStateWithQuizState();
  const { submitAnswer, sandboxSelect } = useQuizActions();
  const { componentStatus, correctValue, incorrectValues, disabled, collapsed, containerTitle } =
    useModalityState();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isWrong, setIsWrong] = useState(false);
  const prevIncorrectLengthRef = useRef(0);

  const getCountryData = (country) => {
    return countryData.find((c) => c.country === country);
  };

  const normalizeText = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Compute if the last guess was wrong
  React.useEffect(() => {
    if (componentStatus !== 'incomplete') {
      prevIncorrectLengthRef.current = incorrectValues.length;
      return;
    }
    if (incorrectValues.length < prevIncorrectLengthRef.current) {
      prevIncorrectLengthRef.current = incorrectValues.length;
      return;
    }
    if (incorrectValues.length > prevIncorrectLengthRef.current) {
      prevIncorrectLengthRef.current = incorrectValues.length;
      setIsWrong(true);
      const id = setTimeout(() => {
        setIsWrong(false);
        setSelectedCountry(null);
      }, 1000);
      return () => clearTimeout(id);
    }
  }, [componentStatus, incorrectValues.length]);

  // Reset when prompt changes
  React.useEffect(() => {
    if (componentStatus === 'sandbox') {
      const country = state.quizData[state.quiz.prompt.quizDataIndex]?.country;
      setSelectedCountry(
        getCountryData(country),
      );
      sandboxSelect({ inputType: 'name', countryValue: country });
    } else if (componentStatus === 'completed') {
      setSelectedCountry(getCountryData(correctValue));
    } else if (componentStatus === 'prompting') {
      setSelectedCountry(getCountryData(state.quizData[state.quiz.prompt.quizDataIndex]?.country));
    } else if (componentStatus === 'disabled') {
      setSelectedCountry(null);
    } else if (componentStatus === 'incomplete') {
      setSelectedCountry(null);
    } else {
      setSelectedCountry(null);
    }
  }, [
    componentStatus,
    state.quizData,
    state.quiz.prompt.quizDataIndex,
    correctValue,
  ]);

  // Display value for autocomplete
  const value = useMemo(() => {
    if (componentStatus === 'sandbox') {
      // console.log('sandbox', state.quizData[state.quiz.prompt.quizDataIndex]?.country);
      return getCountryData(state.quizData[state.quiz.prompt.quizDataIndex]?.country);
    } else if (componentStatus === 'reviewing' && correctValue) {
      return getCountryData(correctValue);
    } else if (componentStatus === 'prompting') {
      return getCountryData(state.quizData[state.quiz.prompt.quizDataIndex]?.country);
    } else if (componentStatus === 'disabled') {
      return null;
    } else if (componentStatus === 'incomplete' && selectedCountry) {
      return getCountryData(selectedCountry);
    } else if (componentStatus === 'incomplete' && !selectedCountry) {
      return null;
    } else if (componentStatus === 'completed') {
      return getCountryData(correctValue);
    } else {
      return null;
    }
  }, [componentStatus, correctValue, selectedCountry, state.quizData, state.quiz.prompt.quizDataIndex]);

  // Status/class for submit button
  const submitButtonStatus = useMemo(() => {
    if (componentStatus === 'completed') return 'completed';
    if (isWrong) return 'incorrect';
    if (selectedCountry && componentStatus === 'incomplete') return 'active';
    return 'disabled';
  }, [selectedCountry, componentStatus, isWrong, disabled]);

  const handleCountryChange = (country) => {
    if (country === null) {
      setSelectedCountry(null);
      return;
    }
    if (state.config.gameMode === 'sandbox' && state.quizData.length > 0) {
      sandboxSelect({ inputType: 'name', countryValue: country.country });
    } else {
      if (!disabled && !incorrectValues.includes(country.country)) {
        setSelectedCountry(country.country);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedCountry && componentStatus === 'incomplete') {
      submitAnswer('name', selectedCountry);
    }
  };

  const customFilter = (options, { inputValue }) => {
    const normalizedInput = normalizeText(inputValue);
    return options.filter((option) => {
      return normalizeText(option.country).includes(normalizedInput) || option.aliases.some((alias) => normalizeText(alias).includes(normalizedInput));
    });
  };

  // const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({

  // const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  //   padding: theme.spacing(2),
  //   borderTop: '1px solid rgba(0, 0, 0, .125)',
  //   backgroundColor: 'var(--background-dark)',
  // }));

  
  return (
    // <div className="quiz-text-input">
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
          {/* <> */}
            {(componentStatus === 'incomplete' || componentStatus === 'sandbox') &&
            <SubmitButton
              handleSubmit={handleSubmit}
              status={submitButtonStatus}
            />}
            <AutoComplete
              // classes={{}}
              value={value}
              options={countryData}
              getOptionLabel={(option) => option.country}
              // getOptionKeys={(option) => option.country}
              onChange={(event, value) => {
                handleCountryChange(value);
              }}
              // isOptionEqualToValue={(option, value) => (option.country === value.country || option.aliases.includes(value.country)}
              sx={{
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '4px',
              }}
              getOptionDisabled={(option) => incorrectValues.includes(option.country)}
              filterOptions={customFilter}
              disabled={disabled}
              renderOption={(props, option) => {
                const { key, ...other } = props;
                  return (
                  <li key={key} {...other}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>{option.country}</div>
                    {option.aliases && option.aliases.length > 0 && (
                      <div className="country-text-entry__suggestion-aliases" style={{ paddingLeft: '1rem' }}>
                        ({Array.isArray(option.aliases) ? option.aliases.join(', ') : option.aliases})
                      </div>
                    )}
                    </div>
                  </li>
                );
              }}
              renderInput={(params) => <TextField {...params} placeholder={'Type a country...'} />}
            />
            </div>
            }
            />
  // </div>
  );
}
