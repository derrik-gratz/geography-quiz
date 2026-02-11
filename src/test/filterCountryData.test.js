import { describe, it, expect } from 'vitest';
import { filterCountryData } from '@/services/filterCountryData.js';
import countryData from '@/data/country_data.json' with { type: 'json' };
import quizSets from '@/data/quiz_sets.json' with { type: 'json' };

const europeQuizSet = quizSets.find((q) => q.name === 'Europe');

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
  it('should filter country data correctly', () => {
    const result = filterCountryData(
      'Europe',
      ['location', 'name', 'flag'],
      countryData,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(
      europeQuizSet.countryCodes.length,
    );
  });
  it('if the selected prompt types are not available, a country should not be included', () => {
    const result = filterCountryData('all', ['flag'], countryData);
    expect(result.length).toBeGreaterThan(0);
    // console.log(result);
    expect(
      result.every((country) => country.availablePrompts.includes('flag')),
    ).toBe(true);
    // expect(result.length).toBeLessThanOrEqual(countryData.length);
  });
});
