import React, { createContext, useReducer, useEffect } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js'; 
import { checkPromptCompletion, checkQuizCompletion, generatePrompt } from '../services/quizEngine.js';

export const QuizContext = createContext();

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());
    // todo: pass reset inputs to children?
    // const resetInputs = () => {
    // }

    // Monitor for prompt completion
    useEffect(() => {
        if (!state.currentPrompt) {
            return;
        }
        const promptCompleted = checkPromptCompletion(state);
        if (promptCompleted) {
            dispatch({ type: 'PROMPT_FINISHED' });
        }
    }, [
        state.currentPromptStatus.location.status, 
        state.currentPromptStatus.name.status, 
        state.currentPromptStatus.flag.status, 
        state.currentPrompt,
        dispatch
    ]);

    // monitor for prompt generation if there is no current prompt
    useEffect(() => {
        if (!state.quizCountryData || state.quizCountryData.length === 0) {
            return;
        }

        const quizCompleted = checkQuizCompletion(state);
        if (quizCompleted) {
            dispatch({ type: 'QUIZ_COMPLETED' });
            return;
        }

        // If quiz not complete and no current prompt and countryData exists (meaning quiz has started)
        if (!state.currentPrompt && !state.isQuizFinished && state.quizCountryDataIndex < state.quizCountryData.length) {
            const prompt = generatePrompt(state);
            if (prompt) {
                dispatch({ type: 'PROMPT_GENERATED', payload: { prompt } });
            }
        }
    }, [
        state.quizCountryData.length,     // ✅ Checks if quiz data exists
        state.promptHistory.length,       // ✅ For checkQuizCompletion
        state.totalCountries,             // ✅ For checkQuizCompletion
        state.currentPrompt,              // ✅ Checks if prompt is null
        state.isQuizFinished,             // ✅ Prevents generation if finished
        state.quizCountryDataIndex,       // ✅ Checks if more prompts available
        state.quizSet,                    // ✅ For generatePrompt
        state.selectedPromptTypes,        // ✅ For generatePrompt
        dispatch  
    ]);
        

    return (
        <QuizContext.Provider value={{ state, dispatch }}>
            {children}
        </QuizContext.Provider>
    );
};

