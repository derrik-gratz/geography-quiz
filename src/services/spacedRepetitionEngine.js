/**
 * Spaced Repetition Engine
 * Modular engine for managing spaced repetition learning algorithm
 * Can be swapped with different algorithms in the future
 */

import { formatDateString, parseDateString } from '../types/dataSchemas.js';

// Algorithm parameters - can be adjusted or swapped
const DEFAULT_LEARNING_RATE = 1; // days
const CORRECT_MULTIPLIER = 2;
const WRONG_DIVISOR = 2;
const MIN_LEARNING_RATE = 0.25; // minimum 6 hours
const MAX_LEARNING_RATE = 365; // maximum 1 year

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
 * @param {Object} countryData - Country data with learningRate and lastCorrect
 * @param {string} today - Today's date string (YYYY-MM-DD)
 * @returns {boolean} True if country is due for review
 */
export function isCountryDueForReview(countryData, today) {
  if (!countryData) {
    return false;
  }
  
  // If never reviewed, due immediately
  if (!countryData.lastCorrect) {
    return true;
  }
  
  // Get learningRate, default to 1 if not set
  const learningRate = countryData.learningRate ?? DEFAULT_LEARNING_RATE;
  
  // Calculate days since last correct
  const daysSinceLastCorrect = daysBetween(countryData.lastCorrect, today);
  
  // Due if days since last correct >= learningRate
  return daysSinceLastCorrect >= learningRate;
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
export function getCountriesDueForReview(userData, allCountryData) {
  if (!userData || !userData.countries || !allCountryData) {
    return [];
  }
  
  const today = formatDateString(new Date());
  const dueCountries = [];
  
  // Check each country in the full dataset
  allCountryData.forEach(country => {
    const countryCode = country.code;
    const countryData = userData.countries[countryCode];
    
    // If country has no data, it's due (never reviewed)
    if (!countryData) {
      dueCountries.push(country);
      return;
    }
    
    // Check if country is due for review
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
