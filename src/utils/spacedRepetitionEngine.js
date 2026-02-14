import { parseDateString } from '@/types/dataSchemas.js';
import allCountryData from '@/data/country_data.json' with { type: 'json' };

// in days
const DEFAULT_LEARNING_RATE = 2;
const CORRECT_MULTIPLIER = 1.6;
const WRONG_DIVISOR = 2;
const MIN_LEARNING_RATE = 1;
const MAX_LEARNING_RATE = 128;

/**
 * Update learning rate based on answer correctness
 * @param {number} currentRate - Current learning rate in days
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {number} Updated learning rate
 */
export function updateLearningRate(currentRate, isCorrect) {
  const rate = currentRate ?? DEFAULT_LEARNING_RATE;
  if (isCorrect) {
    return Math.min(rate * CORRECT_MULTIPLIER, MAX_LEARNING_RATE);
  } else {
    return Math.max(rate / WRONG_DIVISOR, MIN_LEARNING_RATE);
  }
}

/**
 * Get all countries due for review
 * @param {Object} userData - User data with countries object
 * @param {Array} allCountryData - All available country data from country_data.json
 * @returns {Array} Array of country objects due for review
 */
export function getCountriesDueForReview(
  userData,
  today = new Date(),
  availableCountryData = allCountryData,
) {
  if (!userData || !userData.countries || !availableCountryData) {
    console.error(
      'getCountriesDueForReview: userData or availableCountryData is missing',
    );
    return [];
  }

  const dueCountries = [];
  availableCountryData.forEach((country) => {
    const countryCode = country.code;
    const learningRateData = userData.countries[countryCode];

    // If country has no data, it's due (never reviewed)
    if (!learningRateData || !learningRateData.lastChecked) {
      dueCountries.push(countryCode);
      return;
    }
    const learningRate = learningRateData.learningRate ?? DEFAULT_LEARNING_RATE;
    const timeSinceLastChecked = (
      (today - parseDateString(learningRateData.lastChecked)) /
      (1000 * 60 * 60 * 24)
    ).toFixed(2);
    if (timeSinceLastChecked >= learningRate) {
      dueCountries.push(countryCode);
    }
  });

  return dueCountries;
}

export function getEngineSettings() {
  return {
    DEFAULT_LEARNING_RATE,
    CORRECT_MULTIPLIER,
    WRONG_DIVISOR,
    MIN_LEARNING_RATE,
    MAX_LEARNING_RATE,
  };
}
