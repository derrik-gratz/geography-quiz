/**
 * Thunks: chained/conditional dispatch + side effects for quiz state.
 * Game-mode defaults and quiz data loading live here next to the reducer.
 */
import { prepareQuizData } from '@/utils/filterCountryData.js';
import { loadAllUserData } from '@/utils/storageService.js';
import AllCountryData from '@/data/country_data.json';

function setQuizData(
  dispatch,
  gameMode,
  quizSet,
  selectedPromptTypes,
  userData = null,
) {
  const quizData = prepareQuizData(
    gameMode,
    quizSet,
    selectedPromptTypes,
    userData,
  );
  dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
}

export function startQuiz(dispatch, state) {
  if (state.config.gameMode === 'quiz') {
    if (
      !state.config.selectedPromptTypes ||
      state.config.selectedPromptTypes.length === 0
    ) {
      console.error('Cannot start quiz: no prompt types selected');
      return;
    }
  }
  if (state.quizData.length === 0) {
    console.error('Cannot start quiz: no countries to quiz');
    return;
  }
  setQuizData(
    dispatch,
    state.config.gameMode,
    state.config.quizSet,
    state.config.selectedPromptTypes,
    state.userData,
  );
  dispatch({ type: 'START_QUIZ' });
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
  // const quizSet = gameMode === 'daily challenge' ? 'Daily challenge' : 'all';
  let userData = null;
  if (gameMode === 'learning') {
    userData = await loadAllUserData();
  } else {
    userData = null;
  }
  setQuizData(
    dispatch,
    gameMode,
    state.config.quizSet,
    state.config.selectedPromptTypes,
    userData,
  );
}
