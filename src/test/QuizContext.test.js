// quizContext.test.js - Pure reducer tests
import { describe, it, expect } from 'vitest';
import { createInitialQuizState, quizReducer } from '../contexts/QuizContext.js';

describe('quizReducer', () => {
    it('should initialize with correct default state', () => {
        const state = createInitialQuizState();
        expect(state.quizSet).toBeNull();
        expect(state.quizCountryData).toEqual([]);
        expect(state.promptHistory).toEqual([]);
        expect(state.selectedPromptTypes).toEqual(['location', 'name', 'flag']);
    });

    it('should handle SET_QUIZ_SET action', () => {
        const state = createInitialQuizState();
        const newState = quizReducer(state, { type: 'SET_QUIZ_SET', payload: 'Europe' });
        expect(newState.quizSet).toBe('Europe');
        expect(newState.quizCountryData).toEqual([]);
        expect(newState.totalCountries).toBe(0);
        expect(newState.quizCountryDataIndex).toBe(0);
    });

    it('should handle SET_QUIZ_DATA and reset index to 0', () => {
        const state = createInitialQuizState();
        const quizData = [{ country: 'USA' }, { country: 'CAN' }];
        const newState = quizReducer(state, { 
            type: 'SET_QUIZ_DATA', 
            payload: quizData 
        });
        expect(newState.quizCountryData).toEqual(quizData);
        expect(newState.totalCountries).toBe(2);
        expect(newState.quizCountryDataIndex).toBe(0);
    });

    it('should handle PROMPT_GENERATED and set appropriate status', () => {
        const state = createInitialQuizState();
        const prompt = { type: 'name', value: 'USA' };
        const newState = quizReducer(state, { 
            type: 'PROMPT_GENERATED', 
            payload: { prompt } 
        });
        expect(newState.currentPrompt).toEqual(prompt);
        expect(newState.currentPromptStatus.name.status).toBe('prompted');
        expect(newState.currentPromptStatus.location.status).toBeNull();
    });

    it('should handle ANSWER_SUBMITTED and update status', () => {
        const state = {
            ...createInitialQuizState(),
            currentPromptStatus: {
                location: { status: null, n_attempts: 0, attempts: [] },
                name: { status: 'prompted', n_attempts: 0, attempts: [] },
                flag: { status: null, n_attempts: 0, attempts: [] }
            }
        };
        
        const newState = quizReducer(state, {
            type: 'ANSWER_SUBMITTED',
            payload: { type: 'flag', value: 'US', isCorrect: true }
        });
        
        expect(newState.currentPromptStatus.flag.status).toBe('correct');
        expect(newState.currentPromptStatus.flag.n_attempts).toBe(1);
        expect(newState.currentPromptStatus.flag.attempts).toHaveLength(1);
    });

    it('should handle PROMPT_FINISHED and add to history', () => {
        const state = {
            ...createInitialQuizState(),
            quizCountryData: [{ country: 'USA', code: 'USA' }],
            quizCountryDataIndex: 0,
            currentPromptStatus: {
                location: { status: 'prompted', n_attempts: 0, attempts: ['USA'] },
                name: { status: 'correct', n_attempts: 1, attempts: ['United States'] },
                flag: { status: 'correct', n_attempts: 1, attempts: ['US'] }
            }
        };
        
        const newState = quizReducer(state, { type: 'PROMPT_FINISHED' });
        
        expect(newState.quizCountryDataIndex).toBe(1);
        expect(newState.promptHistory).toHaveLength(1);
        expect(newState.promptHistory[0].country).toBe('USA');
        expect(newState.currentPrompt).toBeNull();
    });

    it('should handle QUIZ_COMPLETED', () => {
        const state = {
            ...createInitialQuizState(),
            quizCountryData: [{ country: 'USA', code: 'USA' }],
            quizCountryDataIndex: 1,
            currentPromptStatus: {
                location: { status: 'prompted', n_attempts: 0, attempts: ['USA'] },
                name: { status: 'correct', n_attempts: 1, attempts: ['United States'] },
                flag: { status: 'correct', n_attempts: 1, attempts: ['US'] }
            }
        };
        const newState = quizReducer(state, { type: 'QUIZ_COMPLETED' });
        expect(newState.isQuizFinished).toBe(true);
    });

    it('should handle RESET_QUIZ and return initial state', () => {
        const state = {
            ...createInitialQuizState(),
            quizSet: 'Europe',
            quizCountryData: [{ country: 'France' }],
            isQuizFinished: true
        };
        const newState = quizReducer(state, { type: 'RESET_QUIZ' });
        expect(newState).toEqual(createInitialQuizState());
    });
});