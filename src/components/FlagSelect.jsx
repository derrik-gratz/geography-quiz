import React, { useState, useMemo, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizActions } from '../hooks/useQuizActions.js';
import countryData from '../data/country_data.json';
import quizSets from '../data/quiz_sets.json';
import { usePromptState } from '../hooks/usePromptState.js';

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
    const { submitAnswer } = useQuizActions();
    const { guesses, correctValue, disabled, componentStatus, incorrectValues } = usePromptState('flag');

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    
    const handleFlagClick = (country) => {
        if (!disabled && !incorrectValues.includes(country.flagCode)) {
            setSelectedCountry(country);
        }
    };

    // Reset when prompt changes or when disabled
    React.useEffect(() => {
        // if (disabled) {
        setSelectedCountry(null);
        setSelectedColors([]);
        // }
    }, [disabled, state.quiz.prompt.quizDataIndex]);

    const handleSubmit = () => {
        if (selectedCountry && !disabled) {
            submitAnswer('flag', selectedCountry.flagCode);
            setSelectedCountry(null);
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

    // Single filtering function
    const filteredCountries = useMemo(() => {
        return allCountries.filter(country => {
            // If review mode (disabled), only show guessed + correct flags
            if (disabled) {
                const guessedFlagCodes = guesses?.attempts || [];
                return country.flagCode === correctValue || guessedFlagCodes.includes(country.flagCode);
            }

            // If sandbox mode, filter by quiz set
            if (state.config.gameMode === 'sandbox') {
                if (state.config.quizSet && state.config.quizSet !== 'all') {
                    const quizSetData = quizSets.find(q => q.name === state.config.quizSet);
                    if (quizSetData) {
                        return quizSetData.countryCodes.includes(country.code);
                    }
                }
                return true;
            }
            
            // Active prompt: all flags visible, with optional color filtering
            if (selectedColors.length === 0) {
                return true;
            }
            return selectedColors.every(color => country.colors?.includes(color));
        });
    }, [allCountries, disabled, guesses?.attempts, correctValue, state.config.gameMode, state.config.quizSet, selectedColors]);

    const getFlagClassName = (country) => {
        let className = `flag-icon fi fi-${country.flagCode.toLowerCase()}`;
        if (country.flagCode === correctValue) {
            className += ' correct';
        } else if (incorrectValues.includes(country.flagCode)) {
            className += ' incorrect';
        } else if (selectedCountry?.flagCode === country.flagCode) {
            className += ' selected';
        }
        return className;
    };
    return (
        <div className="flag-select">
            <div className="flag-select__controls">
                <button
                    className="flag-select__submit-button"
                    onClick={handleSubmit}
                    disabled={!selectedCountry || disabled }
                    style={{
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: `1px solid ${selectedCountry && !disabled ? 'var(--color-selected)' : 'var(--color-disabled)'}`,
                        backgroundColor: selectedCountry && !disabled ? 'var(--color-selected)' : 'var(--color-disabled-bg)',
                        color: selectedCountry && !disabled ? '#fff' : 'var(--color-disabled)',
                        cursor: selectedCountry && !disabled ? 'pointer' : 'not-allowed'
                    }}
                >
                    {disabled ? 'Answer:' : <>Submit<br />Flag</>}
                </button>
                <div className="flag-select__color-picker">
                    {!disabled && (
                        <>
                            <span className="color-filter__label">Filter by colors:</span>
                            {availableColors.map(color =>
                                <button 
                                    key={color.name}
                                    className={`flag-select__color-filter-color ${selectedColors.includes(color.name) ? "selected" : ""}`}
                                    onClick={() => handleColorClick(color.name)}
                                    style={{ backgroundColor: color.color }}
                                    title={color.name}
                                ></button>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="flag-select__flag-grid">
                {filteredCountries.map((country) => (
                    <span
                        key={country.code}
                        className={getFlagClassName(country)}
                        onClick={() => handleFlagClick(country)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${country.country || country.code} flag`}
                        style={{
                            opacity: disabled || incorrectValues.includes(country.flagCode) ? 0.6 : 1,
                            cursor: disabled || incorrectValues.includes(country.flagCode) ? 'not-allowed' : 'pointer'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}