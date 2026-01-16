/**
 * Statistics calculation service
 * Pure functions for computing statistics from user data store
 */

import {
  formatDateString,
  parseDateString,
  calculateSkillScore,
  getModalityIndex,
  getModalityName
} from '../types/dataSchemas.js';

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

    // Transform each modality from quiz state to storage format
    const transformModality = (guess) => {
      const prompted = guess.status === 'prompted';
      const guesses = guess.n_attempts > 0 ? guess.n_attempts : null;
      let correct = null;
      
      if (guess.status === 'completed') {
        correct = true;
      } else if (guess.status === 'failed' || guess.status === 'incomplete') {
        correct = false;
      }

      return {
        prompted,
        guesses,
        correct
      };
    };

    return {
      country_id: countryData.code || countryData.flagCode || countryData.country || 'UNKNOWN',
      name: transformModality(entry.name || { status: null, n_attempts: 0 }),
      flag: transformModality(entry.flag || { status: null, n_attempts: 0 }),
      map: transformModality(entry.location || { status: null, n_attempts: 0 })
    };
  }).filter(prompt => prompt !== null);

  return { prompts };
}

/**
 * Calculate streak from daily challenge score log
 * @param {Object} dailyChallenge - Daily challenge data
 * @returns {Object} Streak information { current, longest }
 */
export function calculateStreak(dailyChallenge) {
  if (!dailyChallenge || !dailyChallenge.scoreLog || dailyChallenge.scoreLog.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Use streak from data if available
  if (dailyChallenge.streak && dailyChallenge.streak.current !== undefined) {
    // Calculate longest streak from score log
    const longest = calculateLongestStreak(dailyChallenge.scoreLog);
    return {
      current: dailyChallenge.streak.current || 0,
      longest: longest
    };
  }

  return calculateStreakFromScoreLog(dailyChallenge.scoreLog);
}

/**
 * Calculate streak from score log entries
 * @param {Array} scoreLog - Array of score log entries
 * @returns {Object} Streak information { current, longest }
 */
function calculateStreakFromScoreLog(scoreLog) {
  if (!scoreLog || scoreLog.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort by date (most recent first)
  const sortedEntries = [...scoreLog].sort((a, b) => b.date.localeCompare(a.date));
  const today = formatDateString(new Date());
  
  // Convert date strings to Date objects for calculation
  const dates = sortedEntries.map(entry => ({
    dateStr: entry.date,
    date: new Date(entry.date + 'T00:00:00')
  }));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Check if most recent entry is today or yesterday
  const mostRecentDate = dates[0];
  const todayDate = new Date(today + 'T00:00:00');
  
  if (mostRecentDate) {
    const daysDiff = Math.floor((todayDate - mostRecentDate.date) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) {
      currentStreak = 1;
      tempStreak = 1;
    } else {
      tempStreak = 1;
    }
  }

  // Calculate streaks
  for (let i = 1; i < dates.length; i++) {
    const currentDate = dates[i - 1].date;
    const previousDate = dates[i].date;
    const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      if (currentStreak > 0) {
        currentStreak++;
      }
      tempStreak++;
    } else if (daysDiff > 1) {
      // Streak broken
      if (currentStreak > 0 && daysDiff > 1) {
        currentStreak = 0;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    } else {
      // Same day or invalid
      tempStreak = Math.max(tempStreak, 1);
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak
  };
}

/**
 * Calculate longest streak from score log
 * @param {Array} scoreLog - Array of score log entries
 * @returns {number} Longest streak
 */
function calculateLongestStreak(scoreLog) {
  if (!scoreLog || scoreLog.length === 0) {
    return 0;
  }

  // Sort by date (oldest first)
  const sortedEntries = [...scoreLog].sort((a, b) => a.date.localeCompare(b.date));
  
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date + 'T00:00:00');
    
    if (!lastDate) {
      tempStreak = 1;
      longestStreak = 1;
    } else {
      const daysDiff = Math.floor((entryDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (daysDiff > 1) {
        // Streak broken
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      // If daysDiff === 0, it's the same day, keep tempStreak
    }
    
    lastDate = entryDate;
  }

  return Math.max(longestStreak, tempStreak);
}

/**
 * Calculate score progression over time from score log
 * @param {Object} dailyChallenge - Daily challenge data
 * @returns {Array} Array of { date, score, skillScore } objects
 */
export function calculateScoreOverTime(dailyChallenge) {
  if (!dailyChallenge || !dailyChallenge.scoreLog || dailyChallenge.scoreLog.length === 0) {
    return [];
  }

  // Sort by date (oldest first)
  const sortedEntries = [...dailyChallenge.scoreLog].sort((a, b) => a.date.localeCompare(b.date));

  return sortedEntries.map(entry => ({
    date: entry.date,
    score: entry.score,
    skillScore: entry.skillScore
  }));
}

/**
 * Calculate statistics per prompt modality from score log and country data
 * @param {Object} userData - Complete user data store
 * @returns {Object} Statistics per modality { name, flag, map }
 */
export function calculatePerModalityStats(userData) {
  const stats = {
    name: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
    flag: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
    map: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 }
  };

  if (!userData || !userData.countries) {
    return stats;
  }

  // Aggregate from all country matrices
  // Matrix: rows = input modality, columns = prompted modality
  Object.values(userData.countries).forEach(countryData => {
    if (!countryData.matrix) return;

    // For each input modality (rows)
    for (let inputIndex = 0; inputIndex < 3; inputIndex++) {
      const inputModality = getModalityName(inputIndex);
      if (!inputModality) continue;

      // For each prompted modality (columns)
      for (let promptedIndex = 0; promptedIndex < 3; promptedIndex++) {
        const promptedModality = getModalityName(promptedIndex);
        if (!promptedModality) continue;

        const cell = countryData.matrix[inputIndex][promptedIndex];
        
        // Count from testing array
        if (cell.testing && cell.testing.length > 0) {
          stats[inputModality].totalGuesses += cell.testing.length;
          
          // Count correct answers (skill score > 0 means correct)
          const correctCount = cell.testing.filter(score => score > 0).length;
          stats[inputModality].totalCorrect += correctCount;
        }
      }
    }
  });

  // Calculate accuracy percentages
  ['name', 'flag', 'map'].forEach(modality => {
    const attempted = stats[modality].totalGuesses;
    const correct = stats[modality].totalCorrect;
    stats[modality].accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  });

  return stats;
}

/**
 * Calculate overall statistics from user data store
 * @param {Object} userData - Complete user data store
 * @returns {Object} Complete statistics object
 */
export function calculateOverallStats(userData) {
  if (!userData) {
    return {
      streak: { current: 0, longest: 0 },
      scoreOverTime: [],
      perModality: {
        name: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
        flag: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
        map: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 }
      }
    };
  }

  const streak = calculateStreak(userData.dailyChallenge || {});
  const scoreOverTime = calculateScoreOverTime(userData.dailyChallenge || {});
  const perModality = calculatePerModalityStats(userData);

  return {
    streak,
    scoreOverTime,
    perModality
  };
}

/**
 * Calculate average skill score for a country modality
 * @param {Array} skillScores - Array of skill scores (floats)
 * @returns {number} Average skill score (0-1)
 */
export function calculateAverageSkillScore(skillScores) {
  if (!skillScores || skillScores.length === 0) {
    return 0;
  }

  const sum = skillScores.reduce((acc, score) => acc + score, 0);
  return sum / skillScores.length;
}

/**
 * Calculate skill score for a country across all modalities from matrix
 * @param {Object} countryData - Country data object with matrix
 * @param {string} [inputModality] - Optional: specific input modality to get score for
 * @returns {Object|number} Skill scores per modality or score for specific modality
 */
export function calculateCountrySkillScores(countryData, inputModality = null) {
  if (!countryData || !countryData.matrix) {
    if (inputModality) return 0;
    return {
      name: 0,
      flag: 0,
      map: 0
    };
  }

  const scores = {
    name: [],
    flag: [],
    map: []
  };

  // Aggregate scores from matrix
  // Matrix: rows = input modality, columns = prompted modality
  for (let inputIndex = 0; inputIndex < 3; inputIndex++) {
    const inputModalityName = getModalityName(inputIndex);
    if (!inputModalityName) continue;

    for (let promptedIndex = 0; promptedIndex < 3; promptedIndex++) {
      const cell = countryData.matrix[inputIndex][promptedIndex];
      if (cell.testing && cell.testing.length > 0) {
        scores[inputModalityName].push(...cell.testing);
      }
    }
  }

  // Calculate averages
  const result = {
    name: calculateAverageSkillScore(scores.name),
    flag: calculateAverageSkillScore(scores.flag),
    map: calculateAverageSkillScore(scores.map)
  };

  return inputModality ? result[inputModality] : result;
}
