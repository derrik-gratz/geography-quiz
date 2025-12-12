// quizContext.test.js - Pure reducer tests
import { describe, it, expect } from 'vitest';
import { createInitialQuizState, quizReducer } from '../state/quizContext.js';


const exampleQuizData = [{
    "country": "Mexico",
    "aliases": [
      "United Mexican States"
    ],
    "code": "MEX",
    "capital": "Mexico City",
    "location": {
      "lat": 23,
      "long": -102
    },
    "flagCode": "MX",
    "colors": [
      "green",
      "red",
      "white"
    ],
    "availablePrompts": ["name", "flag", "location"]
  }]

describe('quizReducer', () => {
    it('should initialize with correct default state', () => {
        const state = createInitialQuizState();
        expect(state.config.quizSet).toBeNull();
        expect(state.quizData).toEqual([]);
        expect(state.quiz.history).toEqual([]);
        expect(state.config.selectedPromptTypes).toEqual(['location', 'name', 'flag']);
        expect(state.quiz.status).toBe('not_started');
    });

    it('should handle SET_QUIZ_SET action', () => {
        const state = createInitialQuizState();
        const newState = quizReducer(state, { type: 'SET_QUIZ_SET', payload: 'Europe' });
        expect(newState.config.quizSet).toBe('Europe');
        expect(newState.quizData).toEqual([]);
        expect(newState.quiz.prompt.quizDataIndex).toBe(0);
    });

    it('should handle SET_QUIZ_DATA and reset index to 0', () => {
        const state = createInitialQuizState();
        const quizData = [{ country: 'USA' }, { country: 'CAN' }];
        const newState = quizReducer(state, { 
            type: 'SET_QUIZ_DATA', 
            payload: quizData 
        });
        expect(newState.quizData).toEqual(quizData);
        expect(newState.quiz.prompt.quizDataIndex).toBe(0);
    });

    it('should handle PROMPT_GENERATED and set appropriate status', () => {
        const state = createInitialQuizState();
        const promptType = 'name';
        const newState = quizReducer(state, { 
            type: 'PROMPT_GENERATED', 
            payload: { promptType } 
        });
        expect(newState.quiz.prompt.type).toBe('name');
        expect(newState.quiz.prompt.status).toBe('in_progress');
        expect(newState.quiz.status).toBe('active');
        expect(newState.quiz.prompt.guesses.name.status).toBe('prompted');
        expect(newState.quiz.prompt.guesses.location.status).toBe('incomplete');
    });

    it('should handle ANSWER_SUBMITTED and update status', () => {
        const state = {
            ...createInitialQuizState(),
            quizData: exampleQuizData,
            quiz: {
                ...createInitialQuizState().quiz,
                prompt: {
                    status: 'in_progress',
                    type: 'name',
                    quizDataIndex: 0,
                    guesses: {
                        location: { status: null, n_attempts: 0, attempts: [] },
                        name: { status: 'prompted', n_attempts: 0, attempts: [] },
                        flag: { status: null, n_attempts: 0, attempts: [] }
                    }
                }
            }
        };
        
        const newState = quizReducer(state, {
            type: 'ANSWER_SUBMITTED',
            payload: { type: 'flag', value: 'MX', isCorrect: true }
        });
        
        expect(newState.quiz.prompt.guesses.flag.status).toBe('completed');
        expect(newState.quiz.prompt.guesses.flag.n_attempts).toBe(1);
        expect(newState.quiz.prompt.guesses.flag.attempts).toHaveLength(1);
        expect(newState.quiz.prompt.guesses.flag.attempts[0]).toBe('MX');
    });

    it('should handle PROMPT_FINISHED and add to history', () => {
        const state = {
            ...createInitialQuizState(),
            quizData: exampleQuizData,
            quiz: {
                ...createInitialQuizState().quiz,
                prompt: {
                    status: 'in_progress',
                    type: 'name',
                    quizDataIndex: 0,
                    guesses: {
                        location: { status: 'prompted', n_attempts: 0, attempts: [] },
                        name: { status: 'completed', n_attempts: 1, attempts: ['Mexico'] },
                        flag: { status: 'completed', n_attempts: 1, attempts: ['MX'] }
                    }
                }
            }
        };
        
        const newState = quizReducer(state, { type: 'PROMPT_FINISHED' });
        
        expect(newState.quiz.prompt.quizDataIndex).toBe(1);
        expect(newState.quiz.history).toHaveLength(1);
        expect(newState.quiz.history[0].quizDataIndex).toBe(0);
        expect(newState.quiz.history[0].name.status).toBe('completed');
        expect(newState.quiz.prompt.status).toBeNull();
        expect(newState.quiz.status).toBe('reviewing');
        expect(newState.quiz.reviewType).toBe('auto');
    });

    it('should handle QUIZ_COMPLETED', () => {
        const state = {
            ...createInitialQuizState(),
            quizData: exampleQuizData,
            quiz: {
                ...createInitialQuizState().quiz,
                prompt: {
                    status: 'in_progress',
                    type: 'name',
                    quizDataIndex: 1,
                    guesses: {
                        location: { status: 'prompted', n_attempts: 0, attempts: [] },
                        name: { status: 'completed', n_attempts: 1, attempts: ['Mexico'] },
                        flag: { status: 'completed', n_attempts: 1, attempts: ['MX'] }
                    }
                }
            }
        };
        const newState = quizReducer(state, { type: 'QUIZ_COMPLETED' });
        expect(newState.quiz.status).toBe('completed');
        expect(newState.quiz.reviewType).toBeNull();
    });

    it('should handle RESET_QUIZ and return initial state', () => {
        const state = {
            ...createInitialQuizState(),
            config: {
                ...createInitialQuizState().config,
                quizSet: 'Europe'
            },
            quizData: [{ country: 'France' }],
            quiz: {
                ...createInitialQuizState().quiz,
                status: 'completed'
            }
        };
        const newState = quizReducer(state, { type: 'RESET_QUIZ' });
        expect(newState).toEqual(createInitialQuizState());
    });
});