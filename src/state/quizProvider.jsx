import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js'; 
import { checkPromptCompletion, checkQuizCompletion, generatePrompt } from '../services/quizEngine.js';

export const QuizContext = createContext();

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());
    // todo: pass reset inputs to children?
    // const resetInputs = () => {
    // }

    // Monitor for prompt completion
    // const quizCountryData = useMemo(() => {
    //     return getQuizCountryData(state.quizSet);
    // }, [state.quizSet, state.selectedPromptTypes]);

    const currentPromptData = useMemo(() => {
        return state.quizCountryData[state.quizCountryDataIndex];
    }, [state.quizCountryData, state.quizCountryDataIndex]);

    const totalCountries = useMemo(() => {
        return state.quizCountryData.length;
    }, [state.quizCountryData]);

    const promptCompleted = useMemo(() => {
        if (!state.currentPrompt) return false;
        return checkPromptCompletion(state);
    }, [state.currentPrompt, state.currentPromptStatus]);
    useEffect(() => promptCompleted && dispatch({ type: 'PROMPT_FINISHED' }), [promptCompleted]);

    const isQuizFinished = useMemo(() => {
        return checkQuizCompletion(state);
    }, [state.quizCountryDataIndex, state.quizCountryData]);
    useEffect(() => isQuizFinished && dispatch({ type: 'QUIZ_COMPLETED' }), [isQuizFinished]);

    // monitor for prompt generation if there is no current prompt
    useEffect(() => {
        if (isQuizFinished) {
            return;
        }
    
        // Also check bounds to prevent invalid index access
        if (state.quizCountryDataIndex >= state.quizCountryData.length) {
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
        isQuizFinished,  // Derived completion status
        state.currentPrompt,
        state.quizCountryDataIndex,
        state.quizCountryData.length,  // Include length to catch bounds issues
        state.quizSet,
        state.selectedPromptTypes,
        dispatch
    ]);
        

    return (
        <QuizContext.Provider value={{ state, dispatch }}>
            {children}
        </QuizContext.Provider>
    );
};

