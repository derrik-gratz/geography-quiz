// src/hooks/useQuizActions.js
import { useCallback } from 'react';
import { useQuiz } from './useQuiz.js';
import { filterCountryData } from '../services/filterCountryData.js';
import { checkSubmission } from '../services/quizEngine.js';
import countryData from '../data/country_data.json';

export function useQuizActions() {
    const { dispatch, state } = useQuiz();

    const setQuizSet = useCallback((quizSet) => {
        dispatch({ type: 'SET_QUIZ_SET', payload: quizSet });
    }, [dispatch]);

    const setSelectedPromptTypes = useCallback((selectedPromptTypes) => {
        dispatch({ type: 'SET_SELECTED_PROMPT_TYPES', payload: selectedPromptTypes });
    }, [dispatch]);

    const startQuiz = useCallback(() => {
        if (!state.config.quizSet) {
            console.error('Cannot start quiz: quizSet is not selected');
            return;
        }
        
        if (!state.config.selectedPromptTypes || state.config.selectedPromptTypes.length === 0) {
            console.error('Cannot start quiz: no prompt types selected');
            return;
        }

        const quizData = filterCountryData(state.config.quizSet, state.config.selectedPromptTypes, countryData);
        dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
        dispatch({ type: 'START_QUIZ' });
    }, [state.config.quizSet, state.config.selectedPromptTypes, dispatch]);

    const submitAnswer = useCallback((submissionType, submissionValue) => {
        // Only allow submission in active mode
        if (state.quiz.status !== 'active') {
            console.warn('Cannot submit answer: not in active mode');
            return;
        }
        
        if (!state.quizData || state.quizData.length === 0 || 
            state.quiz.prompt.quizDataIndex >= state.quizData.length) {
            console.error('Cannot submit answer: invalid quiz state');
            return;
        }

        const currentCountryData = state.quizData[state.quiz.prompt.quizDataIndex];
        const evaluation = checkSubmission(currentCountryData, submissionType, submissionValue);
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { type: submissionType, value: submissionValue, isCorrect: evaluation } });
    }, [state.quizData, state.quiz.prompt.quizDataIndex, state.quiz.status, dispatch]);

    const giveUpPrompt = useCallback(() => {
        dispatch({ type: 'PROMPT_FINISHED'})
    }, [dispatch]);

    const resetQuiz = useCallback(() => {
        dispatch({ type: 'RESET_QUIZ' });
    }, [dispatch]);

    return {
        setQuizSet,
        setSelectedPromptTypes,
        startQuiz,
        submitAnswer,
        giveUpPrompt,
        resetQuiz
    };
}