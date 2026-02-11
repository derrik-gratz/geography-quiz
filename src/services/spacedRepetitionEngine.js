import { formatDateString, parseDateString } from '@/types/dataSchemas.js';
import allCountryData from '@/data/country_data.json' with { type: 'json' };

// in days
const DEFAULT_LEARNING_RATE = 2;
const CORRECT_MULTIPLIER = 1.6;
const WRONG_DIVISOR = 2;
const MIN_LEARNING_RATE = 1;
const MAX_LEARNING_RATE = 128;

/**
 * Calculate days between two date strings (YYYY-MM-DD)
 * @param {string} dateString1 - First date string
 * @param {string} dateString2 - Second date string
 * @returns {number} Number of days between dates
 */
function daysBetween(dateString1, dateString2) {
  const date1 = parseDateString(dateString1);
  const date2 = parseDateString(dateString2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if a country is due for review
 * @param {Object} countryData - Country data with learningRate and lastChecked
 * @param {string} today - Today's date string (YYYY-MM-DD)
 * @returns {boolean} True if country is due for review
 */
export function isCountryDueForReview(countryData, today) {
  if (!countryData) {
    return false;
  }

  // If never reviewed, due immediately
  if (!countryData.lastChecked) {
    return true;
  }

  const learningRate = countryData.learningRate ?? DEFAULT_LEARNING_RATE;
  const daysSincelastChecked = daysBetween(countryData.lastChecked, today);
  return daysSincelastChecked >= learningRate;
}

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
  countryData = allCountryData,
) {
  if (!userData || !userData.countries || !countryData) {
    return [];
  }

  const today = formatDateString(new Date());
  const dueCountries = [];

  countryData.forEach((country) => {
    const countryCode = country.code;
    const countryData = userData.countries[countryCode];

    // If country has no data, it's due (never reviewed)
    if (!countryData) {
      dueCountries.push(country);
      return;
    }

    if (isCountryDueForReview(countryData, today)) {
      dueCountries.push(country);
    }
  });

  return dueCountries;
}

/**
 * Get default learning rate for new countries
 * @returns {number} Default learning rate in days
 */
export function getDefaultLearningRate() {
  return DEFAULT_LEARNING_RATE;
}
