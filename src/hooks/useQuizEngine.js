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

    // Per-question state
    const [answers, setAnswers] = useState({}); // { map?: code, text?: code, flag?: code }
    const [attempts, setAttempts] = useState({ map: 0, text: 0, flag: 0 });

    /**
     * Reset quiz state when countryData changes (e.g., when switching quiz sets)
     */
    useEffect(() => {
        setPromptHistory([]);
        setCurrentPrompt(null);
        setIsQuizFinished(false);
        setAnswers({});
        setAttempts({ map: 0, text: 0, flag: 0 });
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
            // reset per-question state
            setAnswers({});
            setAttempts({ map: 0, text: 0, flag: 0 });
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
        setAnswers({});
        setAttempts({ map: 0, text: 0, flag: 0 });
    }, []);

    // Required answer types: user must answer non-prompted types; configurable later
    const requiredAnswerTypes = (() => {
        if (!currentPrompt) return [];
        const all = ['name', 'flag', 'location'];
        return all.filter(t => t !== currentPrompt.promptType);
    })();

    const isComplete = useCallback(() => {
        if (!currentPrompt) return false;
        const answered = {
            name: Boolean(answers.text || answers.name),
            flag: Boolean(answers.flag),
            location: Boolean(answers.map || answers.location),
        };
        return requiredAnswerTypes.every(t => answered[t]);
    }, [answers, requiredAnswerTypes, currentPrompt]);

    // Normalize input to ISO code
    const normalize = (type, value) => {
        if (!value) return null;
        switch (type) {
            case 'text':
                return typeof value === 'object' && value.code ? value.code : null;
            case 'flag':
                return typeof value === 'object' && value.code ? value.code : (typeof value === 'string' ? value : null);
            case 'map':
                return value; // already ISO code
            default:
                return null;
        }
    };

    // Unified submission API
    const submitAnswer = useCallback(({ type, value }) => {
        if (!currentPrompt) return { ok: false, reason: 'no_prompt' };
        const code = normalize(type, value);
        const correct = code && code === currentPrompt.countryCode;
        setAttempts(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
        if (correct) {
            setAnswers(prev => ({ ...prev, [type]: code }));
        }
        const done = correct ? (requiredAnswerTypes.length === 1 ? true : isComplete()) : false;
        return { ok: correct, correctCode: currentPrompt.countryCode, complete: done };
    }, [currentPrompt, isComplete, requiredAnswerTypes]);

    return { 
        currentPrompt, 
        generatePrompt,
        promptHistory,
        isQuizFinished,
        resetQuiz,
        totalCountries: countryData?.length || 0,
        submitAnswer,
        attempts,
        answers,
        requiredAnswerTypes,
        isComplete
    };
}