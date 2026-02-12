// import countryData from '../data/country_data.json' with { type: 'json' };
import quizSets from '@/data/quiz_sets.json' with { type: 'json' };
import { seededRNG, getDailySeed, createSeededRNG } from './dailyRNG.js';
import { getCountriesDueForReview } from './spacedRepetitionEngine.js';

const dailyChallengeLength = 5;

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray(data, seed) {
  if (!Array.isArray(data)) {
    console.error('shuffleArray: data must be an array', data);
    return [];
  }

  // Create a copy to avoid mutating the original array
  const shuffledData = [...data];
  const rng = createSeededRNG(seed);
  for (let i = shuffledData.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
  }
  return shuffledData;
}

function filterCountryDataByQuizSet(countryData, quizSet) {
  const quizSetData = quizSets.find((q) => q.name === quizSet);
  if (quizSetData) {
    return countryData.filter((country) =>
      quizSetData.countryCodes.includes(country.code),
    );
  } else {
    console.error(`Invalid quiz set: ${quizSet}`);
    return [];
  }
}

// Handle user configs to filter data for prompts
export function filterCountryData(
  quizSet,
  selectedPromptTypes,
  countryData,
  gameMode = null,
  userData = null,
) {
  let filteredCountryData = countryData;
  const dailySeed = getDailySeed();

  //remove countries with no valid prompt types
  filteredCountryData = countryData.filter((country) => {
    return country.availablePrompts.length > 0;
  });

  if (gameMode === 'learning') {
    if (!userData) {
      console.error('Learning mode requires userData');
      return [];
    }
    // from userData
    filteredCountryData = getCountriesDueForReview(
      userData,
      filteredCountryData,
    );
    filteredCountryData = shuffleArray(filteredCountryData, Date.now());
    return filteredCountryData;
  } else if (gameMode === 'dailyChallenge' || quizSet === 'Daily challenge') {
    filteredCountryData = shuffleArray(filteredCountryData, dailySeed).slice(
      0,
      dailyChallengeLength,
    );
    return filteredCountryData;
  } else if (gameMode === 'quiz') {
    if (!quizSet) {
      console.error(`No quiz set selected for filtering`);
      return [];
    } else if (quizSet !== 'all') {
      filteredCountryData = filterCountryDataByQuizSet(
        filteredCountryData,
        quizSet,
      );
    }
    filteredCountryData = shuffleArray(filteredCountryData, Date.now());

    if (selectedPromptTypes && selectedPromptTypes.length > 0) {
      filteredCountryData = filteredCountryData.filter((country) => {
        return country.availablePrompts.some((type) =>
          selectedPromptTypes.includes(type),
        );
      });
    }
  }
  return filteredCountryData;
}
