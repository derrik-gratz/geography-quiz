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
  getModalityName
} from '../types/dataSchemas.js';

const DB_NAME = 'geography_quiz_db';
const DB_VERSION = 4; // Increment version for new schema
const STORE_NAME = 'user_data';
const USER_METADATA_KEY = 'geography_quiz_user_metadata';

/**
 * Initialize IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create user data store (replaces old stores)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('id', 'id', { unique: true });
      }
      
      // Delete old stores if they exist (for migration)
      if (db.objectStoreNames.contains('daily_challenges')) {
        db.deleteObjectStore('daily_challenges');
      }
      if (db.objectStoreNames.contains('country_stats')) {
        db.deleteObjectStore('country_stats');
      }
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

/**
 * Update last active timestamp
 * @returns {Promise<void>}
 */
export async function updateLastActive() {
  try {
    const metadata = await getUserMetadata();
    metadata.lastActiveAt = Date.now();
    localStorage.setItem(USER_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to update last active:', error);
  }
}

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
              scoreLog: []
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
        scoreLog: []
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
 * Save daily challenge completion
 * @param {string} date - Date string in "YYYY-MM-DD" format
 * @param {Object} challengeData - Daily challenge entry data with prompts
 * @returns {Promise<boolean>} True if saved, false if already exists
 */
export async function saveDailyChallenge(date, challengeData) {
  try {
    const userData = await loadUserData();
    
    // Check if entry already exists
    const existingEntry = userData.dailyChallenge.scoreLog.find(entry => entry.date === date);
    if (existingEntry) {
      console.log(`Daily challenge for ${date} already exists, skipping save`);
      return false;
    }

    // Calculate scores per country (0, 0.5, or 1)
    const guesses = challengeData.prompts.map(prompt => {
      const types = ['name', 'flag', 'map'];
      const completedCount = types.filter(type => {
        const modality = prompt[type];
        return modality && modality.correct === true;
      }).length;
      // Score per country: 0 = failed, 0.5 = partially correct, 1 = fully correct
      return completedCount * 0.5;
    });

    // Calculate total score (sum of country scores)
    const score = guesses.reduce((sum, g) => sum + g, 0);

    // Calculate skill score
    let skillScore = 0;
    challengeData.prompts.forEach(prompt => {
      ['name', 'flag', 'map'].forEach(modality => {
        const modalityData = prompt[modality];
        if (modalityData && modalityData.guesses !== null && modalityData.guesses > 0) {
          const skill = calculateSkillScore(modalityData.correct === true, modalityData.guesses);
          skillScore += skill;
        }
      });
    });

    // Create score log entry
    const scoreLogEntry = {
      date,
      skillScore,
      score,
      guesses
    };

    // Console log: Show what's being saved
    console.log('=== Daily Challenge Completion ===');
    console.log('Date:', date);
    console.log('Score Log Entry:', scoreLogEntry);
    console.log('Number of countries:', guesses.length);

    // Add to score log
    userData.dailyChallenge.scoreLog.push(scoreLogEntry);
    // Sort by date (most recent first)
    userData.dailyChallenge.scoreLog.sort((a, b) => b.date.localeCompare(a.date));

    // Update streak
    const lastPlayed = userData.dailyChallenge.streak.lastPlayed;
    const today = formatDateString(new Date());
    
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
    await updateLastActive();

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
    const countryId = prompt.country_id;
    if (!countryId) continue;

    // Get or create country data
    if (!userData.countries[countryId]) {
      userData.countries[countryId] = {
        matrix: createEmptyModalityMatrix()
      };
    }

    const countryData = userData.countries[countryId];

    // Find which modality was prompted (only one should be true)
    let promptedModality = null;
    ['name', 'flag', 'map'].forEach(modality => {
      const modalityData = prompt[modality];
      if (modalityData && modalityData.prompted === true) {
        promptedModality = modality;
      }
    });

    if (!promptedModality) {
      // No prompted modality found, skip this country
      return;
    }

    const promptedIndex = getModalityIndex(promptedModality);
    if (promptedIndex === -1) return;

    // Process each input modality that was attempted
    ['name', 'flag', 'map'].forEach(inputModality => {
      const inputIndex = getModalityIndex(inputModality);
      if (inputIndex === -1) return;

      const inputData = prompt[inputModality];
      
      // Only process if this modality was attempted (guesses is not null and > 0)
      // Matrix: rows = input modality, columns = prompted modality
      if (inputData && inputData.guesses !== null && inputData.guesses > 0) {
        const cell = countryData.matrix[inputIndex][promptedIndex];
        
        // Calculate skill score
        const skillScore = calculateSkillScore(inputData.correct === true, inputData.guesses);
        
        // Add to testing array (skill scores from daily challenges)
        cell.testing.push(skillScore);
        
        // Keep only last 5
        if (cell.testing.length > 5) {
          cell.testing = cell.testing.slice(-5);
        }

        // Note: Learning data (lastCorrect, learningRate) is NOT updated by daily challenges.
        // It will be updated by a separate game mode (not yet developed).
      }
    });

    // Console log: Show matrix update summary (testing scores only)
    // Matrix: rows = input modality, columns = prompted modality
    const matrixSummary = {};
    for (let inputIdx = 0; inputIdx < 3; inputIdx++) {
      for (let promptedIdx = 0; promptedIdx < 3; promptedIdx++) {
        const cell = countryData.matrix[inputIdx][promptedIdx];
        const key = `${getModalityName(promptedIdx)}->${getModalityName(inputIdx)}`;
        if (cell.testing.length > 0) {
          matrixSummary[key] = {
            tests: cell.testing.length,
            scores: cell.testing
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





