import { useEffect, useMemo } from 'react';
import { getDailySeed } from '@/utils/RNG.js';
import {
  checkPromptCompletion,
  checkQuizCompletion,
  generatePromptType,
  promptScore,
} from '@/utils/quizEngine.js';
import {
  saveDailyChallenge,
  updateCountryLearningData,
} from '@/services/storageService.js';
import { transformQuizStateToStorage } from '@/services/storageService.js';
import { formatDateString } from '@/types/dataSchemas.js';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs progression logic (prompt completion, next prompt, quiz completion, review timer).
 * Call from QuizProvider with (state, dispatch)
 */
export function useQuizProgression(state, dispatch) {
  const isPromptCompleted = useMemo(() => {
    if (state.quiz.status === 'active') {
      if (
        !state.quiz.prompt.type ||
        state.quiz.prompt.status !== 'in_progress'
      ) {
        return false;
      }
      return checkPromptCompletion(state.quiz.prompt.guesses);
    } else {
      return false;
    }
  }, [
    state.quiz.status,
    state.quiz.prompt.type,
    state.quiz.prompt.status,
    state.quiz.prompt.guesses,
  ]);

  // After each submit
  useEffect(() => {
    if (isPromptCompleted && state.quiz.status === 'active') {
      dispatch({ type: 'PROMPT_FINISHED' });

      if (state.config.gameMode === 'learning') {
        const guesses = state.quiz.prompt.guesses;
        const promptType = state.quiz.prompt.type;
        const inputModalities = ['name', 'flag', 'location'].filter(
          (type) => type !== promptType,
        );
        const bothCorrect = inputModalities.every(
          (type) => guesses[type]?.status === 'completed',
        );
        const currentCountry = state.quizData[state.quiz.prompt.quizDataIndex];
        if (currentCountry) {
          updateCountryLearningData(currentCountry.code, bothCorrect).catch(
            (error) => console.error('Failed to update learning data:', error),
          );
        }
      }
    }

    // Quiz completion
    if (checkQuizCompletion(state.quizData, state.quiz.prompt.quizDataIndex)) {
      dispatch({ type: 'QUIZ_COMPLETED' });
      if (
        state.config.gameMode === 'dailyChallenge' &&
        state.quiz.history?.length > 0 &&
        state.quizData?.length > 0
      ) {
        const challengeData = transformQuizStateToStorage(
          state,
          state.quizData,
        );
        saveDailyChallenge(formatDateString(new Date()), challengeData).catch(
          (error) => console.error('Failed to save daily challenge:', error),
        );
      }
      return;
    }

    // Generate next prompt
    if (
      !state.quiz.prompt.type &&
      state.quiz.status === 'active' &&
      state.quiz.reviewType === null
    ) {
      const countryData = state.quizData[state.quiz.prompt.quizDataIndex];
      const seed =
        state.config.gameMode === 'dailyChallenge'
          ? getDailySeed() + state.quiz.prompt.quizDataIndex * 1000
          : Date.now();
      const promptType = generatePromptType(
        countryData,
        state.config.gameMode,
        state.config.selectedPromptTypes,
        seed,
      );
      if (promptType) {
        dispatch({ type: 'PROMPT_GENERATED', payload: { promptType } });
      }
    }
  }, [
    isPromptCompleted,
    state.quiz.status,
    state.quiz.reviewType,
    state.quiz.prompt.type,
    state.quiz.prompt.quizDataIndex,
    state.quiz.prompt.guesses,
    state.config.gameMode,
    state.quizData,
    // isQuizFinished,
    dispatch,
  ]);

  // auto-review timer
  useEffect(() => {
    if (state.quiz.status === 'reviewing' && state.quiz.reviewType === 'auto') {
      const lastHistoryEntry =
        state.quiz.history[state.quiz.history.length - 1];
      const wasSuccessful =
        lastHistoryEntry && promptScore(lastHistoryEntry) === 1;
      const delay = wasSuccessful ? 2000 : 3500;
      const timeoutId = setTimeout(() => {
        dispatch({ type: 'REVIEW_COMPLETED' });
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [
    state.quiz.status,
    state.quiz.reviewType,
    state.quiz.history,
    state.config.gameMode,
    state.quizData,
    dispatch,
  ]);
}
