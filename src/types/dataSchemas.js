/**
 * Data schemas and type definitions for daily challenge tracking
 * 
 * Modalities: 'name', 'flag', 'location' (3 total)
 */

/**
 * Today's Daily Challenge
*/

/**
 * @typedef {Object} DailyChallengeModalityResult
 * @property {number} skillScore - Calculated skill score for this modality (float, 0-1)
 * @property {boolean|null} correct - Whether the answer was correct (null if not attempted)
 * @property {Array<string>} guesses - Array of actual guesses/attempts made (empty if not attempted)
 * @property {boolean} prompted - Whether this modality was the prompt type shown
 */

/**
 * @typedef {Object} DailyChallengeCountryResult
 * @property {string} countryCode - Country code (e.g., "MEX", "CAN")
 * @property {DailyChallengeModalityResult} name - Name modality result
 * @property {DailyChallengeModalityResult} flag - Flag modality result
 * @property {DailyChallengeModalityResult} location - Location modality result
 */

/** Only one is stored per user
 * @typedef {Object} DailyChallengeFullEntry
 * @property {string} date - Date string "YYYY-MM-DD"
 * @property {number} skillScore - Overall skill score for the challenge (float)
 * @property {number} score - Total score for the challenge (float)
 * @property {DailyChallengeCountryResult[]} countries - Array of 5 country results with detailed modality data
 */

/**
 * @typedef {Object} DailyChallengeLogEntry
 * @property {string} date - Date string "YYYY-MM-DD"
 * @property {number} skillScore - Overall skill score for the challenge (float)
 * @property {number} score - Total score for the challenge (float)
 */

/**
 * @typedef {Object} DailyChallengeLog
 * @property {number} currentStreak - Current consecutive days streak
 * @property {string|null} lastPlayed - Date string "YYYY-MM-DD" of last daily challenge completion
 * @property {DailyChallengeLogEntry[]} entries - Array of daily challenge entries
 */

/**
 * Per-country performance data
 */

/** 
 * @typedef {Object} LearningData
 * @property {string|null} lastCorrect - Date string "YYYY-MM-DD" when last answered correctly
 * @property {number|null} learningRate - Number of days until next prompted for learning (spaced repetition)
 */

/**
 * @typedef {Object} ModalityPairData
 * @property {LearningData} learning - Learning/spaced repetition data
 * @property {number[]} testing - Array of skill scores (floats) for last 5 tests
 */

/**
 * @typedef {ModalityPairData[][]} CountryModalityMatrix
 * 3x3 matrix where:
 * - Rows (first index 0-2) = Input modality (name, flag, location)
 * - Columns (second index 0-2) = Prompted modality (name, flag, location)
 * - Each cell [input][prompted] = ModalityPairData
 * 
 * Example: matrix[1][0] = data for "prompted with name, answered with flag"
 * 
 * Matrix access: matrix[inputIndex][promptedIndex]
 * Matrix indices:
 * 0 = name
 * 1 = flag  
 * 2 = location
 */

/** 
 * @typedef {Object} CountryLogEntry
 * @property {string} countryCode - Country code (e.g., "MEX", "CAN")
 * @property {CountryModalityMatrix} modalityMatrix - Matrix of modality data for this country
 */

/**
 * @typedef {Object} CountryLog
 * @property {CountryLogEntry[]} entries - Array of country log entries
 */

/** 
 * @typedef {Object} UserData
 * @property {string} userId - Unique user ID
 * @property {DailyChallengeLog} dailyChallengeLog - Daily challenge log
 * @property {CountryLog} countryLog - Country log
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
 * @param {string} modality - Modality name: 'name', 'flag', or 'location'
 * @returns {number} Index (0=name, 1=flag, 2=location)
 */
export function getModalityIndex(modality) {
  const indexMap = { name: 0, flag: 1, location: 2 };
  return indexMap[modality] ?? -1;
}

/**
 * Get modality name from index
 * @param {number} index - Index (0=name, 1=flag, 2=location)
 * @returns {string} Modality name
 */
export function getModalityName(index) {
  const names = ['name', 'flag', 'location'];
  return names[index] ?? null;
}

/**
 * Initialize an empty 3x3 modality matrix
 * Matrix structure: matrix[inputIndex][promptedIndex]
 * - Rows (first index 0-2) = Input modality (name, flag, location)
 * - Columns (second index 0-2) = Prompted modality (name, flag, location)
 * @returns {CountryModalityMatrix} Empty 3x3 matrix with default values
 */
export function createEmptyModalityMatrix() {
  const matrix = [];
  for (let input = 0; input < 3; input++) {
    matrix[input] = [];
    for (let prompted = 0; prompted < 3; prompted++) {
      matrix[input][prompted] = {
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
 * Formula: (6 - guesses) / 10
 * - 1 guess = 0.5, 2 guesses = 0.4, 3 guesses = 0.3, etc.
 * @param {boolean} correct - Was answer correct?
 * @param {number} guesses - Number of guesses made
 * @returns {number} Skill score (0-1, higher is better)
 */
export function calculateSkillScore(correct, guesses) {
  if (!correct || guesses <= 0) {
    return 0;
  }
  return (6 - guesses) / 10;
}

/**
 * Create an empty DailyChallengeModalityResult
 * @param {boolean} prompted - Whether this modality was prompted
 * @returns {DailyChallengeModalityResult} Empty modality result
 */
export function createEmptyModalityResult(prompted = false) {
  return {
    skillScore: 0,
    correct: null,
    guesses: [],
    prompted
  };
}

/**
 * Create a DailyChallengeModalityResult from quiz state data
 * The `prompted` flag is automatically determined from the status field
 * @param {Object} guessData - Guess data from quiz state with status, n_attempts, attempts
 * @returns {DailyChallengeModalityResult} Modality result
 */
export function createModalityResultFromGuess(guessData) {
  const { status, n_attempts = 0, attempts = [] } = guessData || {};
  
  let correct = null;
  let prompted = false;
  if (status === 'completed') {
    correct = true;
  } else if (status === 'failed' || status === 'incomplete') {
    correct = false;
  } else if (status === 'prompted') {
    correct = null;
    prompted = true;
  }
  
  const guesses = attempts || [];
  const skillScore = calculateSkillScore(correct === true, guesses.length || n_attempts);
  
  return {
    skillScore,
    correct,
    guesses,
    prompted
  };
}

/**
 * Create a DailyChallengeCountryResult from quiz state data
 * @param {Object} promptEntry - Prompt entry from quiz history
 * @param {string} countryCode - Country code (e.g., "MEX", "CAN")
 * @returns {DailyChallengeCountryResult} Country result
 */
export function createCountryResultFromPrompt(promptEntry, countryCode) {
  const nameData = promptEntry.name || { status: null, n_attempts: 0, attempts: [] };
  const flagData = promptEntry.flag || { status: null, n_attempts: 0, attempts: [] };
  const locationData = promptEntry.location || { status: null, n_attempts: 0, attempts: [] };
  
  return {
    countryCode,
    name: createModalityResultFromGuess(nameData),
    flag: createModalityResultFromGuess(flagData),
    location: createModalityResultFromGuess(locationData)
  };
}
