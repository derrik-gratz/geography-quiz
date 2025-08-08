import { useState, useCallback } from 'react';

/**
 * Custom hook for managing quiz engine state and logic
 * Handles prompt generation and quiz history
 * 
 * @param {string[]} countries - Array of country codes to generate prompts from
 * @returns {Object} Quiz engine state and functions
 */
export function useQuizEngine(countries) {
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [promptHistory, setPromptHistory] = useState([]);

    const generatePrompt = useCallback(() => {
        if (countries.length === 0) {
            console.log('No countries to prompt');
            return;
        }

        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        console.log('Prompting new country: ', randomCountry);
        setCurrentPrompt(randomCountry);
    }, [countries]);

    return { 
        currentPrompt, 
        generatePrompt 
    };
}