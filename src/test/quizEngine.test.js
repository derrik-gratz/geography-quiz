// src/tests/quizEngine.test.js
import { describe, it, expect } from 'vitest';
import { getDailySeed } from '@/utils/RNG.js';
import {
  checkSubmission,
  checkPromptCompletion,
  generatePromptType,
  derivePromptValue,
  checkQuizCompletion,
} from '@/utils/quizEngine.js';

const mockCountryData = [
  {
    country: 'United States of America',
    aliases: ['USA'],
    code: 'USA',
    capital: 'Washington, D.C.',
    location: {
      lat: 40,
      long: -100,
    },
    flagCode: 'US',
    colors: ['red', 'white', 'blue'],
    availablePrompts: ['name', 'flag', 'location'],
  },
  {
    country: 'Uzbekistan',
    aliases: ['Republic of Uzbekistan'],
    code: 'UZB',
    capital: 'Tashkent',
    location: {
      lat: 42,
      long: 64,
    },
    flagCode: 'UZ',
    colors: ['blue', 'white', 'green'],
    availablePrompts: ['name', 'flag', 'location'],
  },
];
const mockQuizContext = {
  config: {
    quizSet: 'Test Set',
    selectedPromptTypes: ['location', 'name', 'flag'],
    gameMode: 'quiz',
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
        flag: { status: null, n_attempts: 0, attempts: [] },
      },
    },
    history: [],
  },
};

const currentPromptData =
  mockQuizContext.quizData[mockQuizContext.quiz.prompt.quizDataIndex];

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
    const result = checkSubmission(
      currentPromptData,
      'name',
      'United States of America',
    );
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
            name: {
              status: 'completed',
              n_attempts: 1,
              attempts: ['United States of America'],
            },
            flag: { status: 'completed', n_attempts: 1, attempts: ['USA'] },
          },
        },
      },
    };
    const result = checkPromptCompletion(quizContext.quiz.prompt.guesses);
    expect(result).toBe(true);
  });

  it('return false when any status is null', () => {
    const quizContext = {
      quiz: {
        prompt: {
          guesses: {
            location: { status: 'prompted', n_attempts: 0, attempts: [] },
            name: { status: null, n_attempts: 0, attempts: [] },
            flag: { status: 'completed', n_attempts: 1, attempts: ['USA'] },
          },
        },
      },
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
            name: {
              status: 'incomplete',
              n_attempts: 2,
              attempts: ['Canada', 'Uzbekistan'],
            },
            flag: { status: 'completed', n_attempts: 1, attempts: ['USA'] },
          },
        },
      },
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
            flag: { status: null, n_attempts: 0, attempts: [] },
          },
        },
      },
    };
    const result = checkPromptCompletion(quizContext);
    expect(result).toBe(false);
  });
});

describe('generatePromptType', () => {
  it('generate a random prompt type when selected', () => {
    const countryData = mockCountryData[0];
    const seed = 12345;
    for (let i = 0; i < 10; i++) {
      const promptType = generatePromptType(
        countryData,
        'quiz',
        ['location', 'name', 'flag'],
        seed + i,
      );
      expect(promptType).toBeDefined();
      expect(['location', 'name', 'flag']).toContain(promptType);

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
    const countryData = mockCountryData[0];
    const promptType = generatePromptType(
      countryData,
      'quiz',
      ['location'],
      999,
    );

    expect(promptType).toBeDefined();
    expect(promptType).toBe('location');

    const value = derivePromptValue(countryData, promptType);
    expect(value).toStrictEqual({ code: 'USA', lat: 40, long: -100 });
  });

  it('Daily challenge repeats should be identical', () => {
    const countryData = mockCountryData[0];
    const seed = getDailySeed() + 0;
    const result1 = generatePromptType(
      countryData,
      'dailyChallenge',
      ['location', 'name', 'flag'],
      seed,
    );
    const result2 = generatePromptType(
      countryData,
      'dailyChallenge',
      ['location', 'name', 'flag'],
      seed,
    );

    expect(result1).toEqual(result2);
  });

  it('should filter prompt types based on selectedPromptTypes', () => {
    const countryData = mockCountryData[0];
    for (let i = 0; i < 10; i++) {
      const promptType = generatePromptType(
        countryData,
        'quiz',
        ['name', 'flag'],
        1000 + i,
      );

      expect(promptType).toBeDefined();
      expect(['name', 'flag']).toContain(promptType);
      expect(promptType).not.toBe('location');
    }
  });

  it('handle country with limited available prompts', () => {
    const limitedCountryData = [
      {
        country: 'Georgia',
        aliases: [],
        code: 'GEO',
        capital: 'Tbilisi',
        location: {
          lat: 42,
          long: 43,
        },
        flagCode: 'GE',
        colors: ['white', 'red'],
        availablePrompts: ['name'],
      },
    ];
    const countryData = limitedCountryData[0];

    const promptType = generatePromptType(
      countryData,
      'quiz',
      ['location', 'name', 'flag'],
      42,
    );
    expect(promptType).toBeDefined();
    expect(promptType).toBe('name');

    const value = derivePromptValue(countryData, promptType);
    expect(value).toBe('Georgia');
  });
});

describe('derivePromptValue', () => {
  const testCountryData = {
    country: 'United States of America',
    code: 'USA',
    location: { lat: 40, long: -100 },
    flagCode: 'US',
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
  it('should return true when promptQuizDataIndex equals quizData length', () => {
    const quizData = [{ code: 'US' }];
    const result = checkQuizCompletion(quizData, 1);
    expect(result).toBe(true);
  });

  it('returns false when promptQuizDataIndex is less than quizData length', () => {
    const quizData = [{ code: 'US' }, { code: 'CA' }];
    const result = checkQuizCompletion(quizData, 0);
    expect(result).toBe(false);
  });

  it('should return false when quizData is empty', () => {
    const result = checkQuizCompletion([], 0);
    expect(result).toBe(false);
  });
});
