import { describe, it, expect } from 'vitest';
import { filterCountryData } from '../services/filterCountryData.js';
import countryData from '../data/country_data.json' with { type: 'json' };
import quizSets from '../data/quiz_sets.json' with { type: 'json' };

const europeQuizSet = quizSets.find(q => q.name === 'Europe');

// Test configurations
const mockState = {
    quizSet: 'Europe',
      selectedPromptTypes: ['location', 'name', 'flag'],
      quizCountryData: [],
      quizCountryDataIndex: 0,
      totalCountries: 0,
      currentPrompt: null,
      currentPromptStatus: {
        location: { status: null, n_attempts: 0, attempts: [] },
        name: { status: null, n_attempts: 0, attempts: [] },
        flag: { status: null, n_attempts: 0, attempts: [] }
      },
      promptHistory: [],
      isQuizFinished: false
};

describe('filterCountryData', () => {
    it('should filter country data correctly', () => {
        const result = filterCountryData("Europe", ['location', 'name', 'flag'], countryData);
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(europeQuizSet.countryCodes.length);
    });
    it('if the selected prompt types are not available, a country should not be included', () => {
        const result = filterCountryData('all', ['flag'], countryData);
        expect(result.length).toBeGreaterThan(0);
        // console.log(result);
        expect(result.every(country => country.availablePrompts.includes('flag'))).toBe(true);
        // expect(result.length).toBeLessThanOrEqual(countryData.length);
    });
});
