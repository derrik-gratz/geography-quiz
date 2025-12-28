import React, { useState, useMemo, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizActions } from '../hooks/useQuizActions.js';
import { useCollapsible } from '../hooks/useCollapsible.js';
import countryData from '../data/country_data.json';
import quizSets from '../data/quiz_sets.json';
import { useComponentState } from '../hooks/useComponentState.js';
import { shuffleArray } from '../services/filterCountryData.js';

const availableColors = [
    { name: "red"   , color: "#FF0000" },
    { name: "white" , color: "#FFFFFF" },
    { name: "blue"  , color: "#0000FF" },
    { name: "green" , color: "#00FF00" },
    { name: "black" , color: "#000000" },
    { name: "yellow", color: "#FFFF00" },
    { name: "orange", color: "#ffa500" }
]

export function FlagSelect() {
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
    const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);

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

    const filteredFlags = useMemo(() => {
        let countries = allCountries.filter(country => {
            if (componentStatus === 'reviewing' || componentStatus === 'completed') {
                const guessedFlagCodes = guesses?.attempts || [];
                return country.flagCode === correctValue || guessedFlagCodes.includes(country.flagCode);
            }

            // If sandbox mode, filter by quiz set
            if (componentStatus === 'sandbox') {
                if (state.config.quizSet && state.config.quizSet !== 'all') {
                    const quizSetData = quizSets.find(q => q.name === state.config.quizSet);
                    if (quizSetData) {
                        return quizSetData.countryCodes.includes(country.code);
                    }
                }
                return true;
            }
            if (componentStatus === 'prompting') {
                return country.flagCode === correctValue;
            }
            // Active prompt: all flags visible, with optional color filtering
            if (selectedColors.length === 0) {
                return true;
            }
            if (componentStatus === 'active') {
                return selectedColors.every(color => country.colors?.includes(color));
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
        let className = `flag-icon fi fi-${country.toLowerCase()}`;
        if (componentStatus !== 'active') {
            if (country === correctValue) {
                className += ' correct';
            }
        } if (incorrectValues.includes(country)) {
            className += ' incorrect';
        } else if (selectedFlag === country) {
            className += ' selected';
        }
        return className;
    };
    return (
        <div className={`flag-select component-panel status-${componentStatus} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="component-panel__title-container">
                <button 
                    className="component-panel__toggle-button" 
                    onClick={toggleCollapsed}
                    aria-label={isCollapsed ? 'Expand Flag Selection' : 'Collapse Flag Selection'}
                >
                    {isCollapsed ? '▶ Flag Selection' : '▼ Flag Selection'}
                </button>
            </div>
            <div className="component-panel__content">
            <div className="flag-select__controls" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', flexWrap: 'nowrap' }}>
                <button
                    className="flag-select__submit-button"
                    onClick={handleSubmit}
                    disabled={!selectedFlag || disabled}
                    style={{
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: `1px solid ${selectedFlag && !disabled ? 'var(--color-submit-button-outline)' : 'var(--color-disabled)'}`,
                        backgroundColor: selectedFlag && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)',
                        color: selectedFlag && !disabled ? '#fff' : 'var(--text-primary)',
                        cursor: selectedFlag && !disabled ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <>Submit<br />Flag</>
                </button>
                <div className="flag-select__color-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', minWidth: 0 }}>
                    {!disabled && (
                        <>
                            <span className="color-filter__label" style={{ whiteSpace: 'normal', flexShrink: 0, minWidth: 'fit-content', maxWidth: 'none' }}>Filter by colors:</span>
                            <div className="color-filter__colors" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                                {availableColors.map(color =>
                                    <button 
                                        key={color.name}
                                        className={`flag-select__color-filter-color ${selectedColors.includes(color.name) ? "selected" : ""}`}
                                        onClick={() => handleColorClick(color.name)}
                                        style={{ backgroundColor: color.color, flexShrink: 0 }}
                                        title={color.name}
                                    ></button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flag-select__flag-grid">
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
        </div>
    );
}