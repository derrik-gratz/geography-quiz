// import countryData from '../data/country_data.json' with { type: 'json' };
import quizSets from '@/data/quiz_sets.json' with { type: 'json' };
import AllCountryData from '@/data/country_data.json' with { type: 'json' };
import { getCountriesDueForReview } from './spacedRepetitionEngine.js';
import { shuffleArray, getDailySeed } from './RNG.js';

const DAILY_CHALLENGE_LENGTH = 5;

// function getDailyChallengeCountryCodes(seed=getDailySeed(), allCountryData=AllCountryData) {
//   return shuffleArray(allCountryData.map(country => country.code), seed).slice(0, DAILY_CHALLENGE_LENGTH);
// }

function filterCountryDataByPromptTypes(countryData, selectedPromptTypes) {
  return countryData.filter((country) =>
    country.availablePrompts.some((prompt) =>
      selectedPromptTypes.includes(prompt),
    ),
  );
}

function getCountryCodesFromQuizSet(quizSet, allCountryData = AllCountryData) {
  if (quizSet === 'all') {
    return allCountryData.map((country) => country.code);
  }
  const quizSetData = quizSets.find((q) => q.name === quizSet);
  if (quizSetData) {
    return quizSetData.countryCodes;
  } else {
    console.error(`Invalid quiz set: ${quizSet}`);
    return [];
  }
}

function filterCountryDataByCountryCodes(countryData, countryCodes) {
  return countryData.filter((country) => countryCodes.includes(country.code));
}

export function prepareQuizData(
  gameMode,
  quizSet,
  selectedPromptTypes,
  userData = null,
  dailySeed = getDailySeed(),
  allCountryData = AllCountryData,
) {
  let countryCodes = [];
  switch (gameMode) {
    case 'learning':
      if (!userData) {
        console.error('Learning mode requires userData');
      }
      countryCodes = getCountriesDueForReview(userData);
      break;
    case 'dailyChallenge':
      // return getDailyChallengeCountryCodes();
      countryCodes = getCountryCodesFromQuizSet('all');
      break;
    case 'quiz':
      countryCodes = getCountryCodesFromQuizSet(quizSet);
      break;
    case 'sandbox':
      countryCodes = getCountryCodesFromQuizSet('all');
      break;
  }
  let filteredCountryData = filterCountryDataByCountryCodes(
    allCountryData,
    countryCodes,
  );
  if (gameMode === 'daily challenge') {
    filteredCountryData = shuffleArray(filteredCountryData, dailySeed).slice(
      0,
      DAILY_CHALLENGE_LENGTH,
    );
    return filteredCountryData;
  }

  if (gameMode === 'quiz') {
    if (selectedPromptTypes && selectedPromptTypes.length > 0) {
      filteredCountryData = filterCountryDataByPromptTypes(
        filteredCountryData,
        selectedPromptTypes,
      );
    }
  }
  filteredCountryData = shuffleArray(filteredCountryData, Date.now());
  return filteredCountryData;
}
