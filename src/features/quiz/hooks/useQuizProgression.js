import { useEffect, useMemo } from 'react';
import {
  checkPromptCompletion,
  checkQuizCompletion,
  generatePromptType,
} from '@/utils/quizEngine.js';
import {
  saveDailyChallenge,
  updateCountryLearningData,
} from '@/utils/storageService.js';
import { transformQuizStateToStorage } from '@/utils/storageService.js';
import { formatDateString } from '@/types/dataSchemas.js';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs progression logic (prompt completion, next prompt, quiz completion, review timer).
 * Call from QuizProvider with (state, dispatch). Keeps reducer state pure.
 */
export function useQuizProgression(state, dispatch) {
  const promptCompleted = useMemo(() => {
    if (!state.quiz.prompt.type || state.quiz.prompt.status !== 'in_progress') {
      return false;
    }
    return checkPromptCompletion(state);
  }, [
    state.quiz.prompt.type,
    state.quiz.prompt.status,
    state.quiz.prompt.guesses,
  ]);

  const isQuizFinished = useMemo(() => {
    if (state.quiz.status === 'active') {
      return checkQuizCompletion(state);
    }
    return false;
  }, [state.quiz.status, state.quiz.prompt.quizDataIndex, state.quizData]);

  // Prompt progress: completion (and learning update) + next prompt generation
  useEffect(() => {
    if (promptCompleted && state.quiz.status === 'active') {
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

    if (isQuizFinished) return;
    if (state.quiz.prompt.quizDataIndex >= state.quizData.length) return;
    if (
      !state.quiz.prompt.type &&
      state.quiz.status === 'active' &&
      state.quiz.reviewType === null &&
      state.quizData[state.quiz.prompt.quizDataIndex]
    ) {
      const promptType = generatePromptType(state);
      if (promptType) {
        dispatch({ type: 'PROMPT_GENERATED', payload: { promptType } });
      }
    }
  }, [
    promptCompleted,
    state.quiz.status,
    state.quiz.reviewType,
    state.quiz.prompt.type,
    state.quiz.prompt.quizDataIndex,
    state.quiz.prompt.guesses,
    state.config.gameMode,
    state.quizData,
    isQuizFinished,
    dispatch,
  ]);

  // Quiz completion + auto-review timer
  useEffect(() => {
    if (isQuizFinished) {
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

    if (state.quiz.status === 'reviewing' && state.quiz.reviewType === 'auto') {
      const lastHistoryEntry =
        state.quiz.history[state.quiz.history.length - 1];
      const wasSuccessful =
        lastHistoryEntry &&
        Object.values(lastHistoryEntry).every(
          (entry) =>
            entry.status === 'prompted' || entry.status === 'completed',
        );
      const delay = wasSuccessful ? 1000 : 3000;
      const timeoutId = setTimeout(() => {
        dispatch({ type: 'REVIEW_COMPLETED' });
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [
    isQuizFinished,
    state.quiz.status,
    state.quiz.reviewType,
    state.quiz.history,
    state.config.gameMode,
    state.quizData,
    dispatch,
  ]);
}
