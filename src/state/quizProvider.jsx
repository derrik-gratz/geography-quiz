import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import { createInitialQuizState, quizReducer } from './QuizContext.js';
import { filterCountryData } from '../services/FilterCountryData.js';
import countryData from '../data/country_data.json';
import { checkSubmission, checkPromptCompletion, checkQuizCompletion, generatePrompt } from '../services/QuizEngine.js';

const QuizContext = createContext();

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());

    const startQuiz = useCallback(() => {
        // dispatch({ type: 'RESET_QUIZ' });
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


    // Only at end of quiz, reverts to initial state
    const resetQuiz = useCallback(() => {
        dispatch({ type: 'RESET_QUIZ' });
    }, [dispatch]);

    // todo: pass reset inputs to children?
    // const resetInputs = () => {
    // }

    const setQuizSet = useCallback((quizSet) => {
        dispatch({ type: 'SET_QUIZ_SET', payload: quizSet });
    }, [dispatch]);

    const setSelectedPromptTypes = useCallback((selectedPromptTypes) => {
        dispatch({ type: 'SET_SELECTED_PROMPT_TYPES', payload: selectedPromptTypes });
    }, [dispatch]);

    const submitAnswer = useCallback((submissionType, submissionValue) => {
        if (!state.quizCountryData || state.quizCountryData.length === 0 || state.quizCountryDataIndex >= state.quizCountryData.length) {
            console.error('Cannot submit answer: invalid quiz state');
            return;
        }

        const evaluation = checkSubmission(state.quizCountryData[state.quizCountryDataIndex], submissionType, submissionValue);
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { type: submissionType, value: submissionValue, isCorrect: evaluation } });
    }, [state.quizCountryData, state.quizCountryDataIndex, dispatch]);

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

        // If quiz not complete and no current prompt, generate one
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
    
    const giveUpPrompt = useCallback(() => {
        dispatch({ type: 'PROMPT_FINISHED'})
    }, [dispatch]);
        

    return (
        <QuizContext.Provider value={{ state, dispatch, submitAnswer, giveUpPrompt, startQuiz, resetQuiz, setQuizSet, setSelectedPromptTypes }}>
            {children}
        </QuizContext.Provider>
    );
};

export function useQuiz() {
    return useContext(QuizContext);
}

