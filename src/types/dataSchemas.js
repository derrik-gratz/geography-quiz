/**
 * Data schemas and type definitions for daily challenge tracking
 * 
 * Modalities: 'name', 'flag', 'map' (3 total)
 */

/**
 * Daily Challenge Data Structures
 */

/**
 * @typedef {Object} StreakInfo
 * @property {number} current - Current consecutive days streak
 * @property {string} lastPlayed - Date string "YYYY-MM-DD" of last daily challenge completion
 */

/**
 * @typedef {Object} DailyChallengeScoreLogEntry
 * @property {string} date - Date string "YYYY-MM-DD"
 * @property {number} skillScore - Overall skill score for the challenge (float)
 * @property {number} score - Total score for the challenge (float)
 * @property {number[]} guesses - Array of scores per country (0, 0.5, or 1) for computing global performance
 */

/**
 * @typedef {Object} DailyChallengeData
 * @property {StreakInfo} streak - Streak information
 * @property {DailyChallengeScoreLogEntry[]} scoreLog - Array of score log entries
 */

/**
 * Country Learning & Testing Data Structures
 */

/**
 * @typedef {Object} LearningData
 * @property {string} lastCorrect - Date string "YYYY-MM-DD" when last answered correctly
 * @property {number} learningRate - Number of days until next prompted for learning (spaced repetition)
 */

/**
 * @typedef {Object} ModalityPairData
 * @property {LearningData} learning - Learning/spaced repetition data
 * @property {number[]} testing - Array of skill scores (floats) for last 5 tests
 */

/**
 * @typedef {ModalityPairData[][]} CountryModalityMatrix
 * 3x3 matrix where:
 * - Rows (first index 0-2) = Input modality (name, flag, map)
 * - Columns (second index 0-2) = Prompted modality (name, flag, map)
 * - Each cell [input][prompted] = ModalityPairData
 * 
 * Example: matrix[1][0] = data for "prompted with name, answered with flag"
 * 
 * Matrix indices:
 * 0 = name
 * 1 = flag  
 * 2 = map
 */

/**
 * @typedef {Object} CountryData
 * @property {CountryModalityMatrix} matrix - 3x3 matrix of modality pair data
 */

/**
 * Root Data Structure
 */

/**
 * @typedef {Object} UserDataStore
 * @property {DailyChallengeData} dailyChallenge - Daily challenge tracking data
 * @property {Object<string, CountryData>} countries - Per-country data keyed by country_id
 */

/**
 * Helper Types (for backward compatibility and calculations)
 */

/**
 * @typedef {Object} PromptModality
 * @property {boolean} prompted - Was this prompt type shown?
 * @property {number|null} guesses - Number of guesses (null if not attempted)
 * @property {boolean|null} correct - Was answer correct? (null if not attempted)
 */

/**
 * @typedef {Object} DailyChallengePrompt
 * @property {string} country_id - Country code (e.g., "MEX", "CAN")
 * @property {PromptModality} name - Name prompt data
 * @property {PromptModality} flag - Flag prompt data
 * @property {PromptModality} map - Map prompt data (note: "map" in storage, "location" in quiz state)
 */

/**
 * @typedef {Object} DailyChallengeEntry
 * @property {string} id - Date string: "YYYY-MM-DD" (e.g., "2026-01-14")
 * @property {DailyChallengePrompt[]} prompts - Array of prompt results per country
 */

/**
 * Utility Functions
 */

/**
 * Generate a date string in YYYY-MM-DD format
 * @param {Date} [date] - Optional date object, defaults to today
 * @returns {string} Date string in "YYYY-MM-DD" format
 */
export function formatDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string in YYYY-MM-DD format
 * @param {string} dateString - Date string in "YYYY-MM-DD" format
 * @returns {Date} Date object
 */
export function parseDateString(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Generate a unique local user ID
 * @returns {string} Unique user ID
 */
export function generateLocalUserId() {
  // Use existing ID from localStorage or generate new one
  const existingId = localStorage.getItem('geography_quiz_user_id');
  if (existingId) {
    return existingId;
  }
  
  // Generate new ID
  const newId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('geography_quiz_user_id', newId);
  return newId;
}

/**
 * Get modality index for matrix access
 * @param {string} modality - Modality name: 'name', 'flag', or 'map'
 * @returns {number} Index (0=name, 1=flag, 2=map)
 */
export function getModalityIndex(modality) {
  const indexMap = { name: 0, flag: 1, map: 2 };
  return indexMap[modality] ?? -1;
}

/**
 * Get modality name from index
 * @param {number} index - Index (0=name, 1=flag, 2=map)
 * @returns {string} Modality name
 */
export function getModalityName(index) {
  const names = ['name', 'flag', 'map'];
  return names[index] ?? null;
}

/**
 * Initialize an empty 3x3 modality matrix
 * @returns {CountryModalityMatrix} Empty 3x3 matrix with default values
 */
export function createEmptyModalityMatrix() {
  const matrix = [];
  for (let prompted = 0; prompted < 3; prompted++) {
    matrix[prompted] = [];
    for (let input = 0; input < 3; input++) {
      matrix[prompted][input] = {
        learning: {
          lastCorrect: null,
          learningRate: null
        },
        testing: []
      };
    }
  }
  return matrix;
}

/**
 * Calculate skill score from correct/guesses
 * Skill score = correct ? (1 / guesses) : 0
 * @param {boolean} correct - Was answer correct?
 * @param {number} guesses - Number of guesses made
 * @returns {number} Skill score (0-1, higher is better)
 */
export function calculateSkillScore(correct, guesses) {
  if (!correct || guesses <= 0) {
    return 0;
  }
  return 1 / guesses; // Perfect score: 1 guess = 1.0, 2 guesses = 0.5, etc.
}
