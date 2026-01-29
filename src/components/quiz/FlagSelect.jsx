import React, { useState, useMemo, useEffect } from 'react';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useQuizActions } from '../../hooks/useQuizActions.js';
// import { useCollapsible } from '../../../hooks/useCollapsible.js';
import countryData from '../../data/country_data.json';
import quizSets from '../../data/quiz_sets.json';
import { useComponentState } from '../../hooks/useComponentState.js';
import { CollapsibleContainer } from '../base/CollapsibleContainer/CollapsibleContainer.jsx';
import { SubmitButton } from '../base/SubmitButton/SubmitButton.jsx';
import { shuffleArray } from '../../services/filterCountryData.js';
import flagColors from '../../data/flag_colors.json';
import './FlagSelect.css';

const availableColors = [
    { name: "red"   , color: "#FF0000" },
    { name: "white" , color: "#FFFFFF" },
    { name: "blue"  , color: "#0000FF" },
    { name: "green" , color: "#00FF00" },
    { name: "black" , color: "#000000" },
    { name: "yellow", color: "#FFFF00" },
    { name: "orange", color: "#ffa500" }
]

export function QuizFlagSelect() {
    const { state } = useQuiz();
    const { submitAnswer, sandboxSelect } = useQuizActions();
    const { guesses, correctValue, disabled, componentStatus, incorrectValues } = useComponentState('flag');
    // Collapse when flag is prompted (componentStatus === 'prompting')
    const defaultCollapsed = useMemo(() => {
        if (componentStatus === 'prompting') return true;
        if ((componentStatus === 'completed' || componentStatus === 'failed') && state.quiz.status === 'active') {
          return true;
        }
        return false;
      }, [componentStatus, state.quiz.status]);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedFlag, setSelectedFlag] = useState(null);

    
    const handleFlagClick = (flag) => {
        if (state.config.gameMode === 'sandbox') {
            sandboxSelect({ inputType: 'flag', countryValue: flag });
        } else {
            if (!disabled && !incorrectValues.includes(flag)) {
                setSelectedFlag(flag);
            }
        }
    };

    // Reset when prompt changes or when disabled
    React.useEffect(() => {
        if (state.config.gameMode === 'sandbox') {
            setSelectedFlag(state.quizData[state.quiz.prompt.quizDataIndex].flagCode);
        } else {
            setSelectedFlag(null);
            setSelectedColors([]);
        }
    }, [disabled, state.config.gameMode, state.quizData, state.quiz.prompt.quizDataIndex]);

    const handleSubmit = () => {
        if (selectedFlag && !disabled) {
            submitAnswer('flag', selectedFlag);
            setSelectedFlag(null);
        }
    };

    const handleColorClick = (color) => {
        setSelectedColors(prevColors => {
            if (prevColors.includes(color)) {
                return prevColors.filter(c => c !== color);
            }
            return [...prevColors, color];
        })
    }

    // Get all countries with flags as base
    const allCountries = useMemo(() => {
        return countryData.filter(country => country.flagCode);
    }, []);

    // const buttonText = useMemo(() => {
    //     if (componentStatus === 'reviewing') {
    //         return 'Answer:';
    //     }
    //     if (componentStatus === 'sandbox') {
    //         return 'Submit Flag';
    //     }
    //     return 'Submit Flag';
    // }, [componentStatus]);

    const filterByQuizSet = (country) => {
        if (state.config.quizSet && state.config.quizSet !== 'all') {
            const quizSetData = quizSets.find(q => q.name === state.config.quizSet);
            if (quizSetData) {
                return quizSetData.countryCodes.includes(country.code);
            }
        }
        return true;
    }
    const filterByColors = (country) => {
        if (selectedColors.length > 0) {
            return selectedColors.every(color => flagColors[color].includes(country.flagCode));
        }
        return true;
    }

    const filteredFlags = useMemo(() => {
        let countries = allCountries.filter(country => {
            if (componentStatus === 'reviewing' || componentStatus === 'completed') {
                const guessedFlagCodes = guesses?.attempts || [];
                return country.flagCode === correctValue || guessedFlagCodes.includes(country.flagCode);
            }

            // If sandbox mode, filter by quiz set
            if (componentStatus === 'sandbox') {
                return filterByQuizSet(country) && filterByColors(country);
            }
            if (componentStatus === 'prompting') {
                return country.flagCode === correctValue;
            }
            // Active prompt: all flags visible, with optional color filtering
            if (selectedColors.length === 0) {
                return true;
            }
            if (componentStatus === 'active') {
                return filterByColors(country);
                // return selectedColors.every(color => country.colors?.includes(color));
            }
            return false;
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
        const flags = [...new Set(countries.map(country => country.flagCode))];
        return flags;
    }, [allCountries, componentStatus, correctValue, state.config.quizSet, selectedColors]);

    const getFlagClassName = (country) => {
        const baseClassName = `quiz-flag-select__flag-icon`;
        let className = baseClassName;
        if (componentStatus !== 'active') {
            if (country === correctValue) {
                className += ` ${baseClassName}_correct`;
            }
        } if (incorrectValues.includes(country)) {
            className += ` ${baseClassName}_incorrect`;
        } else if (selectedFlag === country) {
            // const isSandbox = state.config.gameMode === 'sandbox';
            // className += isSandbox ? `${baseClassName}_selected` : `${baseClassName}_selected`;
            className += ` ${baseClassName}_selected`;
        }
        className += ` fi fi-${country.toLowerCase()}`;
        return className;
    };

    const submitButtonStatus = useMemo(() => {
        if (guesses?.status === 'completed') return 'completed';
        if (guesses?.status === 'incorrect') return 'incorrect';
        if (selectedFlag && componentStatus === 'active') return 'active';
        return 'disabled';
      }, [selectedFlag, guesses?.status, componentStatus, disabled]);

    const containerTitle = useMemo(() => {
        return `Flag Selection${componentStatus==='completed' ? '  ✓' : componentStatus==='failed' ? '  ✗' : ''}`;
    }, [componentStatus]);
    return (
        <CollapsibleContainer defaultCollapsed={defaultCollapsed} title={containerTitle} classNames={componentStatus} content={
        <div className={`quiz-flag-select`}>
            {!disabled && (
            <div className="quiz-flag-select__controls" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', flexWrap: 'nowrap' }}>
                <SubmitButton handleSubmit={handleSubmit} status={submitButtonStatus} />
                <div className="quiz-flag-select__color-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', minWidth: 0 }}>
                    <span className="quiz-flag-select__color-filter-label" style={{ whiteSpace: 'normal', flexShrink: 0, minWidth: 'fit-content', maxWidth: 'none' }}>Filter by colors:</span>
                    <div className="quiz-flag-select__color-filter-colors" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                        {availableColors.map(color =>
                            <button 
                                key={color.name}
                                className={`quiz-flag-select__color-filter-color ${selectedColors.includes(color.name) ? "quiz-flag-select__color-filter-color_selected" : ""}`}
                                onClick={() => handleColorClick(color.name)}
                                style={{ backgroundColor: color.color, flexShrink: 0 }}
                                title={color.name}
                            ></button>
                        )}
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
                            cursor: disabled || incorrectValues.includes(flag) ? 'not-allowed' : 'pointer'
                        }}
                    />
                ))}
            </div>
            </div>
        }/>
    );
}