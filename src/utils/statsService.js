/**
 * Statistics calculation service
 * Pure functions for computing statistics from user data store
 */

import {
  formatDateString,
  parseDateString,
  calculateSkillScore,
  getModalityIndex,
  createEmptyModalityMatrix,
  getModalityName,
} from '@/types/dataSchemas.js';

/**
 * Calculate statistics per prompt modality from score log and country data
 * @param {Object} userCountryData - Complete user country data store
 * @returns {Object} Statistics per modality { name, flag, location }
 * recall = ability to guess modality when prompted with different modality
 * recognition = performance on other modalities when prompted with this modality
 */
export function calculatePerModalityStats(userCountryData) {
  const modalityMatrix = [];
  for (let input = 0; input < 3; input++) {
    modalityMatrix[input] = [];
    for (let prompted = 0; prompted < 3; prompted++) {
      modalityMatrix[input][prompted] = {
        accuracy: [],
        precision: [],
      };
    }
  }

  if (!userCountryData) {
    console.error('No user country data found');
    return modalityMatrix;
  }

  // handle single country and multiple countries
  const countriesArray = userCountryData.matrix
    ? [userCountryData]
    : Object.values(userCountryData);

  // Aggregate from all country matrices
  // Matrix: rows = input modality, columns = prompted modality
  countriesArray.forEach((countryData) => {
    if (!countryData.matrix) return;

    for (let inputIndex = 0; inputIndex < 3; inputIndex++) {
      for (let promptedIndex = 0; promptedIndex < 3; promptedIndex++) {
        const cell = countryData.matrix[inputIndex][promptedIndex];
        if (cell.length > 0) {
          cell.forEach((score) => {
            modalityMatrix[inputIndex][promptedIndex].accuracy.push(
              score > 0 ? 1 : 0,
            );
            modalityMatrix[inputIndex][promptedIndex].precision.push(score);
          });
        }
      }
    }
  });

  for (let inputIndex = 0; inputIndex < 3; inputIndex++) {
    for (let promptedIndex = 0; promptedIndex < 3; promptedIndex++) {
      const cell = modalityMatrix[inputIndex][promptedIndex];
      if (cell.accuracy.length > 0) {
        const avgAccuracy =
          cell.accuracy.reduce((acc, curr) => acc + curr, 0) /
          cell.accuracy.length;
        cell.accuracy = avgAccuracy;
      } else {
        cell.accuracy = NaN;
      }

      if (cell.precision.length > 0) {
        const avgPrecision =
          cell.precision.reduce((acc, curr) => acc + curr, 0) /
          cell.precision.length;
        cell.precision = avgPrecision;
      } else {
        cell.precision = NaN;
      }
    }
  }
  return modalityMatrix;
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

export function dailyChallengeCompletedToday(userData) {
  if (!userData || !userData.dailyChallenge) {
    return false;
  }

  const today = formatDateString(new Date());

  // Check if there's a fullEntry for today
  if (userData.dailyChallenge.fullEntries) {
    const todayEntry = userData.dailyChallenge.fullEntries.find(
      (entry) => entry.date === today,
    );
    if (todayEntry) {
      return true;
    }
  }

  // Fallback: check streak.lastPlayed
  if (userData.dailyChallenge.streak?.lastPlayed === today) {
    return true;
  }

  return false;
}

export function calculateCountryAccuracy(countryData) {
  if (!countryData || !countryData.matrix) {
    return NaN;
  }

  let totalTests = 0;
  let correctTests = 0;
  // Iterate through the 3x3 matrix
  for (let inputIndex = 0; inputIndex < 3; inputIndex++) {
    for (let promptedIndex = 0; promptedIndex < 3; promptedIndex++) {
      const cell = countryData.matrix[inputIndex][promptedIndex];
      if (cell) {
        totalTests += cell.length;
        correctTests += cell.filter((score) => score > 0).length;
      }
    }
  }
  // Return accuracy as ratio of correct to total (0-1)
  return totalTests > 0 ? correctTests / totalTests : NaN;
}

export function calculateCountryPrecision(countryData) {
  if (!countryData || !countryData.matrix) {
    return NaN;
  }
  let totalTests = 0;
  // Iterate through the 3x3 matrix
  let avgPrecision = 0;
  for (let inputIndex = 0; inputIndex < 3; inputIndex++) {
    for (let promptedIndex = 0; promptedIndex < 3; promptedIndex++) {
      const cell = countryData.matrix[inputIndex][promptedIndex];
      if (cell && cell.length > 0) {
        totalTests += cell.length;
        avgPrecision += calculateAverageSkillScore(cell) / 0.5;
      }
    }
  }
  // Return accuracy as ratio of correct to total (0-1)
  return totalTests > 0 ? avgPrecision / totalTests : NaN;
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
      location: 0,
    };
  }

  const scores = {
    name: [],
    flag: [],
    location: [],
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
    location: calculateAverageSkillScore(scores.location),
  };

  return inputModality ? result[inputModality] : result;
}
