import React, { createContext, useReducer, useContext } from 'react';
import { createInitialQuizState, quizReducer } from '../contexts/QuizContext';

const QuizContext = createContext();

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());

    return (
        <QuizContext.Provider value={{ state, dispatch }}>
            {children}
        </QuizContext.Provider>
    );
};

export function useQuiz() {
    return useContext(QuizContext);
}