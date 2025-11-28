// src/tests/quizEngine.test.js
import { describe, it, expect } from 'vitest';
import { checkSubmission, checkPromptCompletion, generatePromptType, derivePromptValue, checkQuizCompletion } from '../services/quizEngine.js';

const mockCountryData = [{
    "country": "United States of America",
    "aliases": [
      "USA"
    ],
    "code": "USA",
    "capital": "Washington, D.C.",
    "location": {
      "lat": 40,
      "long": -100
    },
    "flagCode": "US",
    "colors": [
      "red",
      "white",
      "blue"
    ],
    "availablePrompts": ["name", "flag", "location"]
  },
{
    "country": "Uzbekistan",
    "aliases": [
    "Republic of Uzbekistan"
    ],
    "code": "UZB",
    "capital": "Tashkent",
    "location": {
    "lat": 42,
    "long": 64
    },
    "flagCode": "UZ",
    "colors": [
    "blue",
    "white",
    "green"
    ],
    "availablePrompts": ["name", "flag", "location"]
}];
const mockQuizContext = {
    config: {
        quizSet: "Test Set",
        selectedPromptTypes: ['location', 'name', 'flag'],
        gameMode: 'quiz'
    },
    quizData: mockCountryData,
    quiz: {
        status: 'active',
        reviewType: null,
        reviewIndex: null,
        prompt: {
            status: 'in_progress',
            type: 'name',
            quizDataIndex: 0,
            guesses: {
                location: { status: null, n_attempts: 0, attempts: [] },
                name: { status: 'prompted', n_attempts: 0, attempts: [] },
                flag: { status: null, n_attempts: 0, attempts: [] }
            }
        },
        history: []
    }
}

const currentPromptData = mockQuizContext.quizData[mockQuizContext.quiz.prompt.quizDataIndex];

describe('checkSubmission', () => {

    it('return correct for flag submission when flagCode matches', () => {
        const result = checkSubmission(currentPromptData, 'flag', 'US');
        expect(result).toBe(true);
    });

    it('return incorrect for flag submission when flagCode does not match', () => {
        const result = checkSubmission(currentPromptData, 'flag', 'GB');
        expect(result).toBe(false);
    });

    it('should return correct for name submission when country matches', () => {
        const result = checkSubmission(currentPromptData, 'name', 'United States of America');
        expect(result).toBe(true);
    });

    it('should return incorrect for name submission when country does not match', () => {
        const result = checkSubmission(currentPromptData, 'name', 'Canada');
        expect(result).toBe(false);
    });

    it('should return correct for location submission when code matches', () => {
        const result = checkSubmission(currentPromptData, 'location', 'USA');
        expect(result).toBe(true);
    });

    it('should return incorrect for location submission when code does not match', () => {
        const result = checkSubmission(currentPromptData, 'location', 'CAN');
        expect(result).toBe(false);
    });

    // it('should handle undefined/null country data gracefully', () => {
    //     const result = checkSubmission(null, 'flag', 'us');
    //     expect(result.isCorrect).toBe(false);
        
    //     const result2 = checkSubmission(undefined, 'name', 'United States');
    //     expect(result2.isCorrect).toBe(false);
    // });
});

describe('checkPromptCompletion', () => {
    // Based on current logic: !== null && !== 'incomplete' && !== 'failed'
    it('return true when all statuses are complete', () => {
        const quizContext = {
            quiz: {
                prompt: {
                    guesses: {
                        location: { status: 'prompted', n_attempts: 0, attempts: [] },
                        name: { status: 'completed', n_attempts: 1, attempts: ['United States of America'] },
                        flag: { status: 'completed', n_attempts: 1, attempts: ['USA'] }
                    }
                }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(true);
    });

    it('return false when any status is null', () => {
        const quizContext = {
            quiz: {
                prompt: {
                    guesses: {
                        location: { status: 'prompted', n_attempts: 0, attempts: [] },
                        name: { status: null, n_attempts: 0, attempts: [] },
                        flag: { status: 'complete', n_attempts: 1, attempts: ['USA'] }
                    }
                }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(false);
    });

    it('return false when any status is incomplete', () => {
        const quizContext = {
            quiz: {
                prompt: {
                    guesses: {
                        location: { status: 'prompted', n_attempts: 0, attempts: [] },
                        name: { status: 'incomplete', n_attempts: 2, attempts: ['Canada', 'Uzbekistan'] },
                        flag: { status: 'completed', n_attempts: 1, attempts: ['USA'] }
                    }
                }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(false);
    });

    it('should return false when all statuses are null', () => {
        const quizContext = {
            quiz: {
                prompt: {
                    guesses: {
                        location: { status: null, n_attempts: 0, attempts: [] },
                        name: { status: null, n_attempts: 0, attempts: [] },
                        flag: { status: null, n_attempts: 0, attempts: [] }
                    }
                }
            }
        };
        const result = checkPromptCompletion(quizContext);
        expect(result).toBe(false);
    });
});

describe('generatePromptType', () => {
    it('generate a random prompt type when selected', () => {
        for (let i = 0; i < 10; i++) {
            const promptType = generatePromptType(mockQuizContext);
            expect(promptType).toBeDefined();
            expect(['location', 'name', 'flag']).toContain(promptType);
            
            // Derive the value to verify it works
            const countryData = mockQuizContext.quizData[mockQuizContext.quiz.prompt.quizDataIndex];
            const value = derivePromptValue(countryData, promptType);
            expect(value).toBeDefined();
            
            if (promptType === 'name') {
                expect(value).toBe('United States of America');
            } else if (promptType === 'location') {
                expect(value).toStrictEqual({ code: 'USA', lat: 40, long: -100 });
            } else if (promptType === 'flag') {
                expect(value).toBe('US');
            }
        }
    });
    
    it('generate a location prompt type for regular quiz set', () => {
        mockQuizContext.config.selectedPromptTypes = ['location'];
        const promptType = generatePromptType(mockQuizContext);
        
        expect(promptType).toBeDefined();
        expect(promptType).toBe('location');
        
        // Verify value derivation
        const countryData = mockQuizContext.quizData[mockQuizContext.quiz.prompt.quizDataIndex];
        const value = derivePromptValue(countryData, promptType);
        expect(value).toStrictEqual({ code: 'USA', lat: 40, long: -100 });
    });

    it('Daily challenge repeats should be identical', async () => {       
        const result1 = generatePromptType(mockQuizContext);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result2 = generatePromptType(mockQuizContext);
        
        expect(result1).toEqual(result2);
    });

    it('should filter prompt types based on selectedPromptTypes', () => {
        mockQuizContext.config.selectedPromptTypes = ['name', 'flag'];
        
        for (let i = 0; i < 10; i++) {
            const promptType = generatePromptType(mockQuizContext);
            
            expect(promptType).toBeDefined();
            expect(['name', 'flag']).toContain(promptType);
            expect(promptType).not.toBe('location');
        }
    });

    it('handle country with limited available prompts', () => {
        const limitedCountryData = [ {
            "country": "Georgia",
            "aliases": [],
            "code": "GEO",
            "capital": "Tbilisi",
            "location": {
              "lat": 42,
              "long": 43
            },
            "flagCode": "GE",
            "colors": [
              "white",
              "red"
            ],
            "availablePrompts": ["name"]
          }];
        
          mockQuizContext.quizData = limitedCountryData;
        
        const promptType = generatePromptType(mockQuizContext);
        expect(promptType).toBeDefined();
        expect(promptType).toBe('name');
        
        // Verify value derivation
        const countryData = limitedCountryData[0];
        const value = derivePromptValue(countryData, promptType);
        expect(value).toBe('Georgia');
    });
});

describe('derivePromptValue', () => {
    const testCountryData = {
        country: 'United States of America',
        code: 'USA',
        location: { lat: 40, long: -100 },
        flagCode: 'US'
    };
    
    it('should derive location value correctly', () => {
        const value = derivePromptValue(testCountryData, 'location');
        expect(value).toStrictEqual({ code: 'USA', lat: 40, long: -100 });
    });
    
    it('should derive name value correctly', () => {
        const value = derivePromptValue(testCountryData, 'name');
        expect(value).toBe('United States of America');
    });
    
    it('should derive flag value correctly', () => {
        const value = derivePromptValue(testCountryData, 'flag');
        expect(value).toBe('US');
    });
    
    it('should return null for invalid prompt type', () => {
        const value = derivePromptValue(testCountryData, 'invalid');
        expect(value).toBeNull();
    });
    
    it('should return null for null country data', () => {
        const value = derivePromptValue(null, 'name');
        expect(value).toBeNull();
    });
});

describe('checkQuizCompletion', () => {
    it('should return true when quizDataIndex equals quizData length', () => {
        mockQuizContext.quiz.prompt.quizDataIndex = 1;
        const result = checkQuizCompletion(mockQuizContext);
        expect(result).toBe(true);
    });

    it('return false when quizDataIndex is less than quizData length', () => {
        mockQuizContext.quiz.prompt.quizDataIndex = 0;
        const result = checkQuizCompletion(mockQuizContext);
        expect(result).toBe(false);
    });
    
    it('should return false when quizData is empty', () => {
        const emptyContext = {
            ...mockQuizContext,
            quizData: []
        };
        const result = checkQuizCompletion(emptyContext);
        expect(result).toBe(false);
    });
});