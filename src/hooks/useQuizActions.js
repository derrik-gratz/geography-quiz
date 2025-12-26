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

    const handlePromptTypeChange = (type, checked) => {
        if (checked) {
            setSelectedPromptTypes([...state.config.selectedPromptTypes, type]);
        } else {
            setSelectedPromptTypes(state.config.selectedPromptTypes.filter(t => t !== type));
        }
    };

    const setGameMode = useCallback((gameMode) => {
        dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
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

        // Check Daily Challenge guess limit (5 attempts per field)
        if (state.config.quizSet === 'Daily challenge') {
            const guessState = state.quiz.prompt.guesses[submissionType];
            const currentAttempts = guessState?.n_attempts || 0;
            const currentStatus = guessState?.status;
            
            // Block if already at or over 5 attempts (unless already completed or failed)
            if (currentAttempts >= 5 && currentStatus !== 'completed' && currentStatus !== 'failed') {
                console.warn(`Cannot submit answer: 5 guess limit reached for ${submissionType}`);
                return;
            }
        }

        const currentCountryData = state.quizData[state.quiz.prompt.quizDataIndex];
        const evaluation = checkSubmission(currentCountryData, submissionType, submissionValue);
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { type: submissionType, value: submissionValue, isCorrect: evaluation } });
    }, [state.quizData, state.quiz.prompt.quizDataIndex, state.quiz.status, state.config.quizSet, state.quiz.prompt.guesses, dispatch]);

    const giveUpPrompt = useCallback(() => {
        dispatch({ type: 'GIVE_UP'})
    }, [dispatch]);

    const resetQuiz = useCallback(() => {
        dispatch({ type: 'RESET_QUIZ' });
    }, [dispatch]);

    return {
        setQuizSet,
        setSelectedPromptTypes,
        handlePromptTypeChange,
        setGameMode,
        startQuiz,
        submitAnswer,
        giveUpPrompt,
        resetQuiz
    };
}