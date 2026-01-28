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
 * Calculate statistics per prompt modality from score log and country data
 * @param {Object} userData - Complete user data store
 * @returns {Object} Statistics per modality { name, flag, location }
 */
export function calculatePerModalityStats(userData) {
  const stats = {
    name: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
    flag: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
    location: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 }
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
  ['name', 'flag', 'location'].forEach(modality => {
    const attempted = stats[modality].totalGuesses;
    const correct = stats[modality].totalCorrect;
    stats[modality].accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  });

  return stats;
}

// /**
//  * Calculate overall statistics from user data store
//  * @param {Object} userData - Complete user data store
//  * @returns {Object} Complete statistics object
//  */
// export function calculateOverallStats(userData) {
//   if (!userData) {
//     return {
//       streak: { current: 0, longest: 0 },
//       scoreOverTime: [],
//       perModality: {
//         name: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
//         flag: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 },
//         map: { totalGuesses: 0, totalCorrect: 0, accuracy: 0 }
//       }
//     };
//   }

//   const streak = calculateStreak(userData.dailyChallenge || {});
//   const scoreOverTime = calculateScoreOverTime(userData.dailyChallenge || {});
//   const perModality = calculatePerModalityStats(userData);

//   return {
//     streak,
//     scoreOverTime,
//     perModality
//   };
// }

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
      location: 0
    };
  }

  const scores = {
    name: [],
    flag: [],
    location: []
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
    location: calculateAverageSkillScore(scores.location)
  };

  return inputModality ? result[inputModality] : result;
}
