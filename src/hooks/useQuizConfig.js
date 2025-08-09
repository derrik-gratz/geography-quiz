import { useState, useMemo } from 'react';
import quizSets from '../data/quiz_sets.json';
import countryData from '../data/country_data.json';

// Prompt type constants - defined here since config will control prompt types
export const PROMPT_TYPES = ['name', 'flag', 'location'];

/**
 * Custom hook for managing quiz configuration state
 * Handles quiz set selection, prompt types, and available countries filtering
 * 
 * @returns {Object} Configuration state and setters
 */
export function useQuizConfig() {
    const availableQuizSets = quizSets;
    const allCountryCodes = countryData.map(country => country.code);

    // State for quiz set selection (null = no selection, 'all' = all countries)
    const [quizSet, setQuizSet] = useState(null);
    const [selectedPromptTypes, setSelectedPromptTypes] = useState(PROMPT_TYPES);

    // Memoized current quiz set data to avoid unnecessary recalculations
    const currentQuizSetData = useMemo(() => {
        return quizSet && quizSet !== 'all' 
            ? availableQuizSets.find(set => set.name === quizSet) 
            : null;
    }, [quizSet, availableQuizSets]);
    
    // Memoized available countries based on selected quiz set
    const availableCountries = useMemo(() => {
        if (quizSet === 'all' || !quizSet) {
            return allCountryCodes;
        }
        return currentQuizSetData?.country_codes || [];
    }, [quizSet, currentQuizSetData, allCountryCodes]);

    return { 
        quizSet, 
        setQuizSet, 
        availableQuizSets, 
        availableCountries,
        PROMPT_TYPES,
        selectedPromptTypes,
        setSelectedPromptTypes
    };
}