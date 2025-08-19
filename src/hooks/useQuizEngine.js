import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing quiz engine state and logic
 * Goes through countries sequentially until all are used, then triggers quiz end
 * 
 * @param {Array} countryData - Pre-processed country data from CountryDataService
 * @returns {Object} Quiz engine state and functions
 */
export function useQuizEngine(countryData) {
    // Current prompt object: { countryCode: string, promptType: string, countryData: Object } or null
    const [currentPrompt, setCurrentPrompt] = useState(null);
    
    // Array of previous prompts (not currently used but available for future features)
    const [promptHistory, setPromptHistory] = useState([]);
    
    // Track if the quiz has ended
    const [isQuizFinished, setIsQuizFinished] = useState(false);

    /**
     * Reset quiz state when countryData changes (e.g., when switching quiz sets)
     */
    useEffect(() => {
        setPromptHistory([]);
        setCurrentPrompt(null);
        setIsQuizFinished(false);
    }, [countryData]);

    /**
     * Generates a new prompt from the next available country
     * Goes through countries sequentially until all are used
     */
    const generatePrompt = useCallback(() => {
        if (!countryData || countryData.length === 0) {
            return;
        }

        try {
            // Use promptHistory.length as the current index
            const currentIndex = promptHistory.length;
            
            // Check if we've reached the end of the country list
            if (currentIndex >= countryData.length) {
                setIsQuizFinished(true);
                setCurrentPrompt(null);
                return;
            }
            
            // Get the country at the current index
            const selectedCountry = countryData[currentIndex];
            
            // Randomly select prompt type for variety
            const availableTypes = selectedCountry.availablePromptTypes || ['name', 'flag', 'location'];
            const typeIndex = Math.floor(Math.random() * availableTypes.length);
            const promptType = availableTypes[typeIndex];
            
            // Create prompt object
            const prompt = {
                countryCode: selectedCountry.code,
                promptType: promptType,
                countryData: selectedCountry
            };
            
            setCurrentPrompt(prompt);
            setPromptHistory(prev => [...prev, prompt]);
            
        } catch (error) {
            console.error('Error generating prompt:', error);
        }
    }, [countryData, promptHistory.length]);

    /**
     * Resets the quiz to start over with all countries available
     */
    const resetQuiz = useCallback(() => {
        setPromptHistory([]);
        setCurrentPrompt(null);
        setIsQuizFinished(false);
    }, []);

    return { 
        currentPrompt, 
        generatePrompt,
        promptHistory,
        isQuizFinished,
        resetQuiz,
        totalCountries: countryData?.length || 0
    };
}