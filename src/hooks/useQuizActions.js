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
        if (!state.quizSet) {
            console.error('Cannot start quiz: quizSet is not selected');
            return;
        }
        
        if (!state.selectedPromptTypes || state.selectedPromptTypes.length === 0) {
            console.error('Cannot start quiz: no prompt types selected');
            return;
        }

        const quizData = filterCountryData(state.quizSet, state.selectedPromptTypes, countryData);
        dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });

        // // State isn't updated yet, have to pass manually
        // const promptContext = {
        //     quizSet: state.quizSet,
        //     selectedPromptTypes: state.selectedPromptTypes,
        //     quizCountryData: quizData,
        //     quizCountryDataIndex: 0
        // };
        
        // const prompt = generatePrompt(promptContext);
        // if (prompt) {
        //     dispatch({ type: 'PROMPT_GENERATED', payload: { prompt } });
        // }
    }, [state.quizSet, state.selectedPromptTypes, dispatch]);

    const submitAnswer = useCallback((submissionType, submissionValue) => {
        if (!state.quizCountryData || state.quizCountryData.length === 0 || state.quizCountryDataIndex >= state.quizCountryData.length) {
            console.error('Cannot submit answer: invalid quiz state');
            return;
        }

        const evaluation = checkSubmission(state.quizCountryData[state.quizCountryDataIndex], submissionType, submissionValue);
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { type: submissionType, value: submissionValue, isCorrect: evaluation } });
    }, [state.quizCountryData, state.quizCountryDataIndex, dispatch]);

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