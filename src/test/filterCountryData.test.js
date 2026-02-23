import { describe, it, expect } from 'vitest';
import { prepareQuizData } from '@/utils/filterCountryData.js';
import countryData from '@/data/country_data.json' with { type: 'json' };
import quizSets from '@/data/quiz_sets.json' with { type: 'json' };

const mockState = {
  config: {
    quizSet: 'Europe',
    selectedPromptTypes: ['location', 'name', 'flag'],
    gameMode: 'quiz',
  },
  quizData: [],
  quiz: {
    status: 'not_started',
    reviewType: null,
    reviewIndex: null,
    prompt: {
      status: null,
      type: null,
      quizDataIndex: 0,
      guesses: {
        location: { status: null, n_attempts: 0, attempts: [] },
        name: { status: null, n_attempts: 0, attempts: [] },
        flag: { status: null, n_attempts: 0, attempts: [] },
      },
    },
    history: [],
  },
};

describe('filterCountryData', () => {
  it('prepare quiz data from config', () => {
    const result = prepareQuizData(
      'quiz',
      'Europe',
      ['location', 'name', 'flag'],
    );
    const countryCodes = result.map((country) => country.code);
    const europeQuizSet = quizSets.find((q) => q.name === 'Europe');
    expect(countryCodes.sort()).toEqual(europeQuizSet.countryCodes.sort());
  });
  it('if the selected prompt types are not available, a country should not be included', () => {
    const result = prepareQuizData(
      'quiz',
      'Caribbean',
      ['flag'],
    );
    expect(result.length).toBeGreaterThan(0);
    const countryCodes = result.map((country) => country.code);
    const caribbeanQuizSet = quizSets.find((q) => q.name === 'Caribbean');
    expect(countryCodes.sort().length).toBeLessThanOrEqual(caribbeanQuizSet.countryCodes.sort().length);
    expect(
      result.every((country) => country.availablePrompts.includes('flag')),
    ).toBe(true);
  });
});
