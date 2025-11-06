import { useState, useMemo } from 'react';
import quizSets from '../data/quiz_sets.json';

// Prompt type constants - defined here since config will control prompt types
export const PROMPT_TYPES = ['name', 'flag', 'location'];

/**
 * Custom hook for managing quiz configuration state
 * Handles quiz set selection and prompt type configuration
 * 
 * @returns {Object} Configuration state and setters
 */
export function useQuizConfig() {
    const availableQuizSets = quizSets;

    const [quizSet, setQuizSet] = useState('Daily challenge');
    
    // State for selected prompt types (defaults to all available types)
    const [selectedPromptTypes, setSelectedPromptTypes] = useState(PROMPT_TYPES);

    return { 
        quizSet, 
        setQuizSet, 
        availableQuizSets, 
        PROMPT_TYPES,
        selectedPromptTypes,
        setSelectedPromptTypes
    };
}