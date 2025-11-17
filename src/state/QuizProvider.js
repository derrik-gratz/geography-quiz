import React, { createContext, useReducer, useContext } from 'react';
import { createInitialQuizState, quizReducer } from '../contexts/QuizContext';
import { filterCountryData } from '../services/filterCountryData';
import countryData from '../data/country_data.json';
import { checkSubmission, checkPromptCompletion, checkQuizCompletion, generatePrompt } from '../services/quizEngine';

const QuizContext = createContext();

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());

    const startQuiz = useCallback((quizSet, selectedPromptTypes) => {
        dispatch({ type: 'RESET_QUIZ' });
        dispatch({ type: 'SET_QUIZ_SET', payload: quizSet });
        dispatch({ type: 'SET_SELECTED_PROMPT_TYPES', payload: selectedPromptTypes });

        const quizData = filterCountryData(state, countryData);
        dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
        requestNewPrompt();
    }, [state.isQuizFinished, state.quizSet, state.selectedPromptTypes, dispatch]);

    const resetQuiz = useCallback(() => {
        dispatch({ type: 'RESET_QUIZ' });
    }, [dispatch]);

    // todo: pass reset inputs to children?
    // const resetInputs = () => {
    // }

    const submitAnswer = useCallback((submissionType, submissionValue) => {
        const evaluation = checkSubmission(state.quizCountryData[state.quizCountryDataIndex], submissionType, submissionValue);
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { type: submissionType, value: submissionValue, isCorrect: evaluation } });
        const promptCompleted = checkPromptCompletion(state);
        if (promptCompleted) {
            dispatch({ type: 'PROMPT_FINISHED' });
            requestNewPrompt();
            return;
        }
    }, [state.quizCountryData, state.quizCountryDataIndex, dispatch]);
    
    const requestNewPrompt = useCallback(() => {
        const isQuizCompleted = checkQuizCompletion(state);
        if (isQuizCompleted) {
            dispatch({ type: 'QUIZ_COMPLETED' });
            return;
        }
    
        const prompt = generatePrompt(state);
        dispatch({ type: 'PROMPT_GENERATED', payload: { prompt } });
    }, [state.quizCountryData, state.quizCountryDataIndex, dispatch]);

    return (
        <QuizContext.Provider value={{ state, dispatch, submitAnswer, requestNewPrompt, startQuiz, resetQuiz }}>
            {children}
        </QuizContext.Provider>
    );
};

export function useQuiz() {
    return useContext(QuizContext);
}

