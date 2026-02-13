/**
 * Thunks: chained/conditional dispatch + side effects for quiz state.
 * Game-mode defaults and quiz data loading live here next to the reducer.
 */
import { filterCountryData } from '@/utils/filterCountryData.js';
import { loadAllUserData } from '@/utils/storageService.js';
import countryData from '@/data/country_data.json';

/**
 * Returns the quiz set name used for filtering when entering this game mode.
 * Matches the reducer's SET_GAME_MODE behavior.
 */
function getDefaultQuizSetForGameMode(gameMode) {
  if (gameMode === 'sandbox' || gameMode === 'learning' || gameMode === 'quiz')
    return 'all';
  if (gameMode === 'dailyChallenge') return 'Daily challenge';
  return null;
}

/**
 * Loads and returns quiz data for the given game mode. Async for learning (loads user data).
 * Call after dispatching SET_GAME_MODE; then dispatch SET_QUIZ_DATA with the result.
 *
 * @param {string} gameMode - 'dailyChallenge' | 'learning' | 'quiz' | 'sandbox'
 * @param {string[]} selectedPromptTypes
 * @param {Array} countryData
 * @returns {Promise<Array>} Quiz data to pass to SET_QUIZ_DATA
 */
async function loadQuizDataForGameMode(
  gameMode,
  selectedPromptTypes,
  countryData,
) {
  const quizSet = getDefaultQuizSetForGameMode(gameMode);
  if (quizSet === null) {
    return []; // quiz mode – no preload
  }
  if (gameMode === 'learning') {
    const userData = await loadAllUserData();
    return filterCountryData(
      quizSet,
      selectedPromptTypes,
      countryData,
      gameMode,
      userData,
    );
  }
  return filterCountryData(quizSet, selectedPromptTypes, countryData, gameMode);
}

/**
 * Switches game mode: updates config and loads quiz data when applicable.
 * Bound with (dispatch, state) in the provider; components use useQuizThunks().switchGameMode(gameMode).
 *
 * @param {Function} dispatch - Quiz dispatch
 * @param {Object} state - Current quiz state (from useQuiz())
 * @param {string} gameMode - 'dailyChallenge' | 'learning' | 'quiz' | 'sandbox'
 */
export async function switchGameMode(dispatch, state, gameMode) {
  dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
  try {
    const quizData = await loadQuizDataForGameMode(
      gameMode,
      state.config.selectedPromptTypes,
      countryData,
    );
    if (quizData.length > 0) {
      dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
    }
  } catch (error) {
    console.error('Failed to load quiz data for game mode:', error);
  }
}
