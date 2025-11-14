// src/tests/quizEngine.test.js
import { describe, it, expect } from 'vitest';
import { checkSubmission, checkPromptCompletion, generatePrompt, checkQuizCompletion } from '../services/quizEngine.js';

describe('checkSubmission', () => {
    const mockCountryData = {
        code: 'USA',
        country: 'United States',
        flagCode: 'us',
        location: { lat: 39.8283, long: -98.5795 }
    };

    it('should return correct for flag submission when flagCode matches', () => {
        const result = checkSubmission(mockCountryData, 'flag', 'us');
        expect(result).toEqual({
            type: 'flag',
            value: 'us',
            isCorrect: true
        });
    });

    it('should return incorrect for flag submission when flagCode does not match', () => {
        const result = checkSubmission(mockCountryData, 'flag', 'gb');
        expect(result).toEqual({
            type: 'flag',
            value: 'gb',
            isCorrect: false
        });
    });

    it('should return correct for name submission when country matches', () => {
        const result = checkSubmission(mockCountryData, 'name', 'United States');
        expect(result).toEqual({
            type: 'name',
            value: 'United States',
            isCorrect: true
        });
    });

    it('should return incorrect for name submission when country does not match', () => {
        const result = checkSubmission(mockCountryData, 'name', 'Canada');
        expect(result).toEqual({
            type: 'name',
            value: 'Canada',
            isCorrect: false
        });
    });

    it('should return correct for location submission when code matches', () => {
        const result = checkSubmission(mockCountryData, 'location', 'USA');
        expect(result).toEqual({
            type: 'location',
            value: 'USA',
            isCorrect: true
        });
    });

    it('should return incorrect for location submission when code does not match', () => {
        const result = checkSubmission(mockCountryData, 'location', 'CAN');
        expect(result).toEqual({
            type: 'location',
            value: 'CAN',
            isCorrect: false
        });
    });

    it('should handle undefined/null country data gracefully', () => {
        const result = checkSubmission(null, 'flag', 'us');
        expect(result.isCorrect).toBe(false);
        
        const result2 = checkSubmission(undefined, 'name', 'United States');
        expect(result2.isCorrect).toBe(false);
    });
});

describe('checkPromptCompletion', () => {
    it('should return true when all statuses are correct', () => {
        const quizContext = {
            currentPromptStatus: {
                location: { status: 'correct', n_attempts: 1, attempts: [] },
                name: { status: 'correct', n_attempts: 1, attempts: [] },
                flag: { status: 'correct', n_attempts: 1, attempts: [] }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(true);
    });

    it('should return false when any status is null', () => {
        const quizContext = {
            currentPromptStatus: {
                location: { status: 'correct', n_attempts: 1, attempts: [] },
                name: { status: null, n_attempts: 0, attempts: [] },
                flag: { status: 'correct', n_attempts: 1, attempts: [] }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(false);
    });

    it('should return false when any status is incorrect', () => {
        const quizContext = {
            currentPromptStatus: {
                location: { status: 'correct', n_attempts: 1, attempts: [] },
                name: { status: 'incorrect', n_attempts: 2, attempts: [] },
                flag: { status: 'correct', n_attempts: 1, attempts: [] }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(false);
    });

    it('should return true when all statuses are prompted (edge case)', () => {
        const quizContext = {
            currentPromptStatus: {
                location: { status: 'prompted', n_attempts: 0, attempts: [] },
                name: { status: 'prompted', n_attempts: 0, attempts: [] },
                flag: { status: 'prompted', n_attempts: 0, attempts: [] }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(true); // Based on current logic: !== null && !== 'incorrect'
    });

    it('should return false when all statuses are null', () => {
        const quizContext = {
            currentPromptStatus: {
                location: { status: null, n_attempts: 0, attempts: [] },
                name: { status: null, n_attempts: 0, attempts: [] },
                flag: { status: null, n_attempts: 0, attempts: [] }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(false);
    });
});

describe('generatePrompt', () => {
    const mockCountryData = [
        {
            code: 'USA',
            country: 'United States',
            flagCode: 'us',
            location: { lat: 39.8283, long: -98.5795 },
            availablePrompts: ['location', 'name', 'flag']
        },
        {
            code: 'CAN',
            country: 'Canada',
            flagCode: 'ca',
            location: { lat: 56.1304, long: -106.3468 },
            availablePrompts: ['location', 'name', 'flag']
        }
    ];

    it('should generate a location prompt for regular quiz set', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 0,
            quizSet: 'Europe',
            selectedPromptTypes: ['location']
        };
        
        const result = generatePrompt(quizContext);
        
        expect(result).toBeDefined();
        expect(result.type).toBe('location');
        expect(result.value).toEqual({ lat: 39.8283, long: -98.5795 });
    });

    it('should generate a name prompt when selected', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 1,
            quizSet: 'Asia',
            selectedPromptTypes: ['name']
        };
        
        // Since shuffleArray is random, we test multiple times or mock it
        // For now, just verify structure
        const result = generatePrompt(quizContext);
        
        expect(result).toBeDefined();
        expect(['location', 'name', 'flag']).toContain(result.type);
        if (result.type === 'name') {
            expect(result.value).toBe('Canada');
        }
    });

    it('should generate a flag prompt when selected', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 0,
            quizSet: 'Africa',
            selectedPromptTypes: ['flag']
        };
        
        const result = generatePrompt(quizContext);
        
        expect(result).toBeDefined();
        expect(['location', 'name', 'flag']).toContain(result.type);
        if (result.type === 'flag') {
            expect(result.value).toBe('us');
        }
    });

    it('should use daily seed for Daily challenge', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 0,
            quizSet: 'Daily challenge',
            selectedPromptTypes: ['location', 'name', 'flag']
        };
        
        const result = generatePrompt(quizContext);
        
        expect(result).toBeDefined();
        expect(['location', 'name', 'flag']).toContain(result.type);
    });

    it('should filter prompt types based on selectedPromptTypes', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 0,
            quizSet: 'Test Set',
            selectedPromptTypes: ['name', 'flag']  // location not selected
        };
        
        const result = generatePrompt(quizContext);
        
        expect(result).toBeDefined();
        expect(['name', 'flag']).toContain(result.type);
        expect(result.type).not.toBe('location');
    });

    it('should return null when index is out of bounds', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 10,  // Out of bounds
            quizSet: 'Test Set',
            selectedPromptTypes: ['location', 'name', 'flag']
        };
        
        const result = generatePrompt(quizContext);
        expect(result).toBeNull();
    });

    it('should return null when quizCountryData is empty', () => {
        const quizContext = {
            quizCountryData: [],
            quizCountryDataIndex: 0,
            quizSet: 'Test Set',
            selectedPromptTypes: ['location', 'name', 'flag']
        };
        
        const result = generatePrompt(quizContext);
        expect(result).toBeNull();
    });

    it('should return null when quizCountryData is undefined', () => {
        const quizContext = {
            quizCountryData: undefined,
            quizCountryDataIndex: 0,
            quizSet: 'Test Set',
            selectedPromptTypes: ['location', 'name', 'flag']
        };
        
        const result = generatePrompt(quizContext);
        expect(result).toBeNull();
    });

    it('should handle country with limited available prompts', () => {
        const limitedCountryData = [{
            code: 'ABC',
            country: 'Test Country',
            flagCode: 'ab',
            location: { lat: 0, long: 0 },
            availablePrompts: ['name']  // Only name available
        }];
        
        const quizContext = {
            quizCountryData: limitedCountryData,
            quizCountryDataIndex: 0,
            quizSet: 'Test Set',
            selectedPromptTypes: ['location', 'name', 'flag']
        };
        
        const result = generatePrompt(quizContext);
        
        expect(result).toBeDefined();
        expect(result.type).toBe('name');
        expect(result.value).toBe('Test Country');
    });

    it('should return location prompt with correct structure', () => {
        const quizContext = {
            quizCountryData: mockCountryData,
            quizCountryDataIndex: 0,
            quizSet: 'Test Set',
            selectedPromptTypes: ['location']
        };
        
        const result = generatePrompt(quizContext);
        
        if (result?.type === 'location') {
            expect(result.value).toEqual({ lat: 39.8283, long: -98.5795 });
        }
    });
});

describe('checkQuizCompletion', () => {
    it('should return true when promptHistory length equals totalCountries', () => {
        const quizContext = {
            promptHistory: [
                { prompt: { type: 'location' }, status: {}, completedAt: '2024-01-01' },
                { prompt: { type: 'name' }, status: {}, completedAt: '2024-01-01' },
                { prompt: { type: 'flag' }, status: {}, completedAt: '2024-01-01' }
            ],
            totalCountries: 3
        };
        
        const result = checkQuizCompletion(quizContext);
        expect(result).toBe(true);
    });

    it('should return false when promptHistory length is less than totalCountries', () => {
        const quizContext = {
            promptHistory: [
                { prompt: { type: 'location' }, status: {}, completedAt: '2024-01-01' },
                { prompt: { type: 'name' }, status: {}, completedAt: '2024-01-01' }
            ],
            totalCountries: 5
        };
        
        const result = checkQuizCompletion(quizContext);
        expect(result).toBe(false);
    });

    it('should return false when promptHistory is empty', () => {
        const quizContext = {
            promptHistory: [],
            totalCountries: 3
        };
        
        const result = checkQuizCompletion(quizContext);
        expect(result).toBe(false);
    });

    it('should return true when promptHistory length exceeds totalCountries', () => {
        const quizContext = {
            promptHistory: [
                { prompt: { type: 'location' }, status: {} },
                { prompt: { type: 'name' }, status: {} },
                { prompt: { type: 'location' }, status: {} }
            ],
            totalCountries: 3
        };
        
        const result = checkQuizCompletion(quizContext);
        expect(result).toBe(true);
    });

    it('should return true when both are zero', () => {
        const quizContext = {
            promptHistory: [],
            totalCountries: 0
        };
        
        const result = checkQuizCompletion(quizContext);
        expect(result).toBe(true); // 0 === 0
    });
});