/**
 * Storage service for daily challenge and country data
 * Uses IndexedDB for main data store and localStorage for user metadata
 */

import {
  formatDateString,
  generateLocalUserId,
  createEmptyModalityMatrix,
  calculateSkillScore,
  getModalityIndex,
  getModalityName,
  createCountryResultFromPrompt
} from '../types/dataSchemas.js';
import { getDefaultLearningRate, updateLearningRate } from './spacedRepetitionEngine.js';

const DB_NAME = 'geography_quiz_db';
const DB_VERSION = 6;
const STORE_NAME = 'user_data';
const USER_METADATA_KEY = 'geography_quiz_user_metadata';

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;
      
      console.log(`🔄 Database upgrade: ${oldVersion} → ${newVersion}`);
      
      // If upgrading from version 0 (new database), just create the store
      if (oldVersion === 0) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('id', 'id', { unique: true });
        }
        return;
      }

      // For version changes, delete all old stores and create fresh database
      // TODO: Add data migration logic here in the future if needed
      // For now, we're creating a clean database on version change
      
      // Delete old stores
      if (db.objectStoreNames.contains('daily_challenges')) {
        db.deleteObjectStore('daily_challenges');
      }
      if (db.objectStoreNames.contains('country_stats')) {
        db.deleteObjectStore('country_stats');
      }
      
      // Delete and recreate the main store
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      objectStore.createIndex('id', 'id', { unique: true });

      console.log('✅ Fresh database created');
      
      // Future migration placeholder:
      // if (oldVersion < newVersion) {
      //   // Read existing data before deletion
      //   // Migrate data to new schema
      //   // Write migrated data back
      // }
    };
  });
}


/**
 * Get or create local user metadata
 * @returns {Promise<Object>} User metadata
 */
export async function getUserMetadata() {
  try {
    const metadataStr = localStorage.getItem(USER_METADATA_KEY);
    if (metadataStr) {
      return JSON.parse(metadataStr);
    }
    
    // Create new metadata
    const userId = generateLocalUserId();
    const metadata = {
      localUserId: userId,
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };
    localStorage.setItem(USER_METADATA_KEY, JSON.stringify(metadata));
    return metadata;
  } catch (error) {
    console.error('Failed to get user metadata:', error);
    throw error;
  }
}

// /**
//  * Update last active timestamp
//  * @returns {Promise<void>}
//  */
// export async function updateLastActive() {
//   try {
//     const metadata = await getUserMetadata();
//     metadata.lastActiveAt = Date.now();
//     localStorage.setItem(USER_METADATA_KEY, JSON.stringify(metadata));
//   } catch (error) {
//     console.error('Failed to update last active:', error);
//   }
// }

/**
 * Load user data store
 * @returns {Promise<Object>} User data store
 */
async function loadUserData() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get('user_data');
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          resolve(data.data); // Extract the data property
        } else {
          // Return empty structure
          resolve({
            dailyChallenge: {
              streak: {
                current: 0,
                lastPlayed: null
              },
              fullEntries: []
            },
            countries: {}
          });
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to load user data:', error);
    return {
      dailyChallenge: {
        streak: { current: 0, lastPlayed: null },
        fullEntries: []
      },
      countries: {}
    };
  }
}

/**
 * Save user data store
 * @param {Object} userData - User data store object
 * @returns {Promise<void>}
 */
async function saveUserData(userData) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.put({
        id: 'user_data',
        data: userData
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
}

/**
 * Transform quiz state format to storage format
 * Returns prompts array with country_id and modality data
 * @param {Object} quizState - Quiz state from context
 * @param {Array} quizData - Quiz data array
 * @returns {Object} Daily challenge entry data with prompts
 */
export function transformQuizStateToStorage(quizState, quizData) {
  const prompts = quizState.quiz.history.map((entry) => {
    const countryData = quizData[entry.quizDataIndex];
    if (!countryData) {
      return null;
    }

    // Extract country code
    const countryCode = countryData.code || countryData.flagCode || countryData.country || 'UNKNOWN';

    // Pass through modality data as-is (status, n_attempts, attempts)
    return {
      countryCode,
      name: entry.name || { status: null, n_attempts: 0, attempts: [] },
      flag: entry.flag || { status: null, n_attempts: 0, attempts: [] },
      location: entry.location || { status: null, n_attempts: 0, attempts: [] }
    };
  }).filter(prompt => prompt !== null);

  return { prompts };
}

/**
 * Save daily challenge completion
 * @param {string} date - Date string in "YYYY-MM-DD" format
 * @param {Object} challengeData - Daily challenge entry data with prompts
 *   Each prompt should have: countryCode and name/flag/location with status/n_attempts/attempts
 * @returns {Promise<boolean>} True if saved, false if already exists
 */
export async function saveDailyChallenge(date, challengeData) {
  try {
    const userData = await loadUserData();
    
    // Check if entry already exists
    const existingFullEntry = userData.dailyChallenge?.fullEntries?.find(entry => entry.date === date);
    if (existingFullEntry) {
      console.log(`Daily challenge for ${date} already exists, skipping save`);
      return false;
    }

    // Transform prompts to country results using new schema helpers
    const results = challengeData.prompts.map(prompt => {
      const countryCode = prompt.countryCode;
      if (!countryCode) {
        console.warn('Prompt missing countryCode:', prompt);
        return null;
      }

      // Prompt entry should have name/flag/location with status, n_attempts, attempts
      const promptEntry = {
        name: prompt.name || { status: null, n_attempts: 0, attempts: [] },
        flag: prompt.flag || { status: null, n_attempts: 0, attempts: [] },
        location: prompt.location || { status: null, n_attempts: 0, attempts: [] }
      };

      return createCountryResultFromPrompt(promptEntry, countryCode);
    }).filter(country => country !== null);

    // Calculate overall skill score (sum of all modality skill scores)
    let skillScore = 0;
    results.forEach(result => {
      skillScore += result.name.skillScore;
      skillScore += result.flag.skillScore;
      skillScore += result.location.skillScore;
    });

    // Calculate total score (sum of country scores: 0, 0.5, or 1 per country)
    // Score per country: 0 = failed, 0.5 = partially correct (1-2 modalities), 1 = fully correct (3 modalities)
    const countryScores = results.map(result => {
      const correctCount = [result.name, result.flag, result.location]
        .filter(modality => modality.correct === true).length;
      return correctCount * 0.5;
    });
    const score = countryScores.reduce((sum, s) => sum + s, 0);

    // Create full entry using new schema
    const fullEntry = {
      date,
      skillScore,
      score
      // results
    };

    // Initialize fullEntries array if it doesn't exist
    if (!userData.dailyChallenge.fullEntries) {
      userData.dailyChallenge.fullEntries = [];
    }

    // Add to full entries
    userData.dailyChallenge.fullEntries.push(fullEntry);
    // Sort by date (most recent first)
    userData.dailyChallenge.fullEntries.sort((a, b) => b.date.localeCompare(a.date));

    // Update streak
    const lastPlayed = userData.dailyChallenge.streak?.lastPlayed;
    if (!lastPlayed) {
      // First challenge
      userData.dailyChallenge.streak = {
        current: 1,
        lastPlayed: date
      };
    } else {
      const lastDate = new Date(lastPlayed + 'T00:00:00');
      const currentDate = new Date(date + 'T00:00:00');
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        userData.dailyChallenge.streak.current += 1;
        userData.dailyChallenge.streak.lastPlayed = date;
      } else if (daysDiff === 0) {
        // Same day (already handled by existence check)
        userData.dailyChallenge.streak.lastPlayed = date;
      } else {
        // Streak broken
        userData.dailyChallenge.streak = {
          current: 1,
          lastPlayed: date
        };
      }
    }

    // Update country statistics
    await updateCountryStatsFromChallenge(challengeData, userData);

    // Save updated data
    await saveUserData(userData);

    console.log('✅ Daily challenge saved:', { date, score, skillScore, streak: userData.dailyChallenge.streak.current });
    return true;
  } catch (error) {
    console.error('Failed to save daily challenge:', error);
    throw error;
  }
}

/**
 * Update country statistics from a daily challenge
 * @param {Object} challengeData - Daily challenge data with prompts
 * @param {Object} userData - User data store object (will be modified)
 * @returns {Promise<void>}
 */
async function updateCountryStatsFromChallenge(challengeData, userData) {
  if (!challengeData.prompts || challengeData.prompts.length === 0) {
    return;
  }

    // Process each country in the challenge
  for (const prompt of challengeData.prompts) {
    const countryId = prompt.countryCode;
    if (!countryId) continue;

    // Get or create country data
    if (!userData.countries[countryId]) {
      userData.countries[countryId] = {
        matrix: createEmptyModalityMatrix(),
        learningRate: getDefaultLearningRate(),
        lastCorrect: null
      };
    }

    const countryData = userData.countries[countryId];

    // Find which modality was prompted (status === 'prompted')
    let promptedModality = null;
    ['name', 'flag', 'location'].forEach(modality => {
      const modalityData = prompt[modality];
      if (modalityData && modalityData.status === 'prompted') {
        promptedModality = modality;
      }
    });

    if (!promptedModality) {
      // No prompted modality found, skip this country
      continue;
    }

    const promptedIndex = getModalityIndex(promptedModality);
    if (promptedIndex === -1) continue;

    // Process each input modality that was attempted
    ['name', 'flag', 'location'].forEach(inputModality => {
      if (inputModality === promptedModality) {
        return;
      }
      const inputIndex = getModalityIndex(inputModality);
      if (inputIndex === -1) return;

      const inputData = prompt[inputModality];
      if (!inputData) return;

      // Get number of guesses from attempts array or n_attempts
      let guessCount = 0;
      if (inputData.attempts && Array.isArray(inputData.attempts)) {
        guessCount = inputData.attempts.length;
      } else if (inputData.n_attempts) {
        guessCount = inputData.n_attempts;
      }

      // Determine if correct from status
      const isCorrect = inputData.status === 'completed';

      const cell = countryData.matrix[inputIndex][promptedIndex];
      const skillScore = guessCount > 0 ? calculateSkillScore(isCorrect, guessCount) : 0;
      cell.push(skillScore);
      if (cell.length > 5) {
        cell = cell.slice(-5);
      }
      countryData.matrix[inputIndex][promptedIndex] = cell;
    });

    // Console log: Show matrix update summary (testing scores only)
    // Matrix: rows = input modality, columns = prompted modality
    const matrixSummary = {};
    for (let inputIdx = 0; inputIdx < 3; inputIdx++) {
      for (let promptedIdx = 0; promptedIdx < 3; promptedIdx++) {
        const cell = countryData.matrix[inputIdx][promptedIdx];
        const key = `${getModalityName(promptedIdx)}->${getModalityName(inputIdx)}`;
        if (cell.length > 0) {
          matrixSummary[key] = {
            tests: cell.length,
            scores: cell
            // Note: learning data not updated by daily challenges
          };
        }
      }
    }
    console.log(`📊 Updated testing scores for ${countryId}:`, matrixSummary);
  }
}

/**
 * Load daily challenge data
 * @returns {Promise<Object>} Daily challenge data
 */
export async function loadDailyChallengeData() {
  const userData = await loadUserData();
  return userData.dailyChallenge;
}

/**
 * Load country statistics
 * @param {string} [countryId] - Optional country ID to get specific country
 * @returns {Promise<Object|Object>} Country stats or all countries
 */
export async function getCountryStats(countryId) {
  const userData = await loadUserData();
  if (countryId) {
    return userData.countries[countryId] || null;
  }
  return userData.countries;
}

/**
 * Get all country statistics
 * @returns {Promise<Object>} All country statistics
 */
export async function getAllCountryStats() {
  return getCountryStats();
}

/**
 * Load all user data
 * @returns {Promise<Object>} Complete user data store
 */
export async function loadAllUserData() {
  return loadUserData();
}

/**
 * Clear all stored data
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  try {
    // Clear IndexedDB
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Clear localStorage
    localStorage.removeItem(USER_METADATA_KEY);
    localStorage.removeItem('geography_quiz_user_id');
  } catch (error) {
    console.error('Failed to clear all data:', error);
    throw error;
  }
}

/**
 * Update learning data for a country after a learning mode attempt
 * @param {string} countryCode - Country code (e.g., "MEX", "CAN")
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {Promise<void>}
 */
export async function updateCountryLearningData(countryCode, isCorrect) {
  try {
    const userData = await loadUserData();
    
    // Get or create country data
    if (!userData.countries[countryCode]) {
      userData.countries[countryCode] = {
        matrix: createEmptyModalityMatrix(),
        learningRate: getDefaultLearningRate(),
        lastCorrect: null
      };
    }
    
    const countryData = userData.countries[countryCode];
    const today = formatDateString(new Date());
    
    // Update learningRate based on correctness
    const currentRate = countryData.learningRate ?? getDefaultLearningRate();
    countryData.learningRate = updateLearningRate(currentRate, isCorrect);
    
    // Update lastCorrect if answer was correct
    if (isCorrect) {
      countryData.lastCorrect = today;
    }
    
    // Save updated data
    await saveUserData(userData);
  } catch (error) {
    console.error('Failed to update country learning data:', error);
    throw error;
  } finally {
    // Remove from pending set after completion (with a small delay to handle rapid successive calls)
    setTimeout(() => {
      pendingUpdates.delete(updateKey);
    }, 100);
  }
}

/**
 * Initialize storage (call on app startup)
 * @returns {Promise<void>}
 */
export async function initStorage() {
  try {
    await initDB();
    await getUserMetadata();
    await loadUserData(); // Initialize data structure
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}





