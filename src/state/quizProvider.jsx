import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js'; 
import { checkPromptCompletion, checkQuizCompletion, generatePromptType, derivePromptValue } from '../services/quizEngine.js';

export const QuizContext = createContext();

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        if (!state.quizData || state.quiz.prompt.quizDataIndex >= state.quizData.length) {
            return null;
        }
        return state.quizData[state.quiz.prompt.quizDataIndex];
    }, [state.quizData, state.quiz.prompt.quizDataIndex]);

    const totalCountries = useMemo(() => {
        return state.quizData.length;
    }, [state.quizData]);

    const promptCompleted = useMemo(() => {
        if (!state.quiz.prompt.type || state.quiz.prompt.status !== 'in_progress') {
            return false;
        }
        return checkPromptCompletion(state);
    }, [state.quiz.prompt.type, state.quiz.prompt.status, state.quiz.prompt.guesses]);
    useEffect(() => {
        if (promptCompleted && state.quiz.status === 'active') {
            dispatch({ type: 'PROMPT_FINISHED' });
        }
    }, [promptCompleted, state.quiz.status]);
    console.log(state.config.quizSet);
    useEffect(() => {
        if (state.quiz.status === 'reviewing' && state.quiz.reviewType === 'auto') {
            // Calculate delay: 1s for success, 3s for failure/give-up
            // Check the most recent history entry to determine success
            const lastHistoryEntry = state.quiz.history[state.quiz.history.length - 1];
            const wasSuccessful = lastHistoryEntry && 
                Object.values(lastHistoryEntry).every(entry => 
                    entry.status === 'prompted' || entry.status === 'complete'
                );
            
            const delay = wasSuccessful ? 1000 : 3000;
            
            const handleAutoReview = async () => {
                await sleep(delay);
                dispatch({ type: 'REVIEW_COMPLETED' });
            };
            
            handleAutoReview();
        }
    }, [state.quiz.status, state.quiz.reviewType, state.quiz.history]);

    const isQuizFinished = useMemo(() => {
        if (state.quiz.status === 'active') {
            return checkQuizCompletion(state);
        }
        return false;
    }, [state.quiz.status, state.quiz.prompt.quizDataIndex, state.quizData]);
    
    useEffect(() => {
        if (isQuizFinished) {
            dispatch({ type: 'QUIZ_COMPLETED' });
        }
    }, [isQuizFinished]);

    // monitor for prompt generation if there is no current prompt
    useEffect(() => {
        if (isQuizFinished) {
            return;
        }
        if (state.quiz.prompt.quizDataIndex >= state.quizData.length) {
            return;
        }
        
        // Only generate if in active mode, no current prompt, and quiz is in progress
        if (!state.quiz.prompt.type && 
            state.quiz.status === 'active' && 
            state.quiz.reviewType === null &&
            state.quiz.prompt.quizDataIndex < state.quizData.length) {
            const promptType = generatePromptType(state);
            if (promptType && currentPromptData) {
                dispatch({ type: 'PROMPT_GENERATED', payload: { promptType } });
            }
        }
    }, [
        isQuizFinished,
        // autoReviewCompleted,
        state.quiz.status,
        state.quiz.prompt.type,
        state.quiz.prompt.quizDataIndex,
        state.quizData,
        currentPromptData,
        dispatch
    ]);
        

    return (
        <QuizContext.Provider value={{ state, currentPromptData, totalCountries, promptCompleted, isQuizFinished, dispatch }}>
            {children}
        </QuizContext.Provider>
    );
};

