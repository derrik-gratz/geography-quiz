import { useState, useCallback } from 'react';

/**
 * Custom hook for managing quiz engine state and logic
 * Handles prompt generation with different prompt types
 * 
 * @param {string[]} countries - Array of country codes to generate prompts from
 * @param {string[]} promptTypes - Array of prompt types to choose from (default: all types)
 * @returns {Object} Quiz engine state and functions
 */
export function useQuizEngine(countries, promptTypes = ['name', 'flag', 'location']) {
    // Current prompt object: { countryCode: string, promptType: string } or null
    const [currentPrompt, setCurrentPrompt] = useState(null);
    
    // Array of previous prompts (not currently used but available for future features)
    const [promptHistory, setPromptHistory] = useState([]);

    const generatePrompt = useCallback(() => {
        if (countries.length === 0) {
            console.log('No countries to prompt');
            return;
        }

        if (promptTypes.length === 0) {
            console.log('At least one prompt type must be selected!');
            return;
        }

        const country = countries[Math.floor(Math.random() * countries.length)];
        const promptType = promptTypes[Math.floor(Math.random() * promptTypes.length)];
        const prompt = {
            countryCode: country,
            promptType: promptType
        };
        console.log(`Prompting new country: ${promptType} for ${country}`);
        setCurrentPrompt(prompt);
    }, [countries, promptTypes]);

    return { 
        currentPrompt, 
        generatePrompt 
    };
}