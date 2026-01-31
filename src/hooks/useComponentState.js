// src/hooks/usePromptState.js
import { useMemo } from 'react';
import { useQuiz } from './useQuiz.js';

/**
 * Hook to get the state for a specific prompt type component
 * @param {string} guessType - The type of guess: 'name', 'flag', or 'location'
 * @returns {Object} Component state including guesses, correctValue, disabled, componentStatus, incorrectValues
 */
export function useComponentState(guessType) {
  const { state } = useQuiz();
  const correctField = guessType === 'name' ? 'country' : guessType === 'flag' ? 'flagCode' : guessType === 'location' ? 'code' : null;
    const { guesses, correctValue, disabled } = useMemo(() => {
    let guesses = null;
    let correctValue = null;
    let disabled = true;

    if (state.config.gameMode === 'sandbox') {
      disabled = false;
      // In sandbox, guesses would be null, correctValue can be set if needed
    } else if (state.config.gameMode === 'quiz' || state.config.gameMode === 'learning' || state.config.gameMode === 'dailyChallenge') {
      if (state.quiz.status === 'active') {
        guesses = state.quiz.prompt.guesses[guessType];
        disabled = guesses?.status !== 'incomplete';
        const currentCountry = state.quizData[state.quiz.prompt.quizDataIndex];
        correctValue = currentCountry?.[correctField];
      } else if (state.quiz.status === 'reviewing' && state.quiz.reviewIndex !== null) {
        const historyEntry = state.quiz.history[state.quiz.reviewIndex];
        guesses = historyEntry?.[guessType];
        disabled = true;
        const historyCountry = state.quizData[historyEntry.quizDataIndex];
        correctValue = historyCountry?.[correctField];
      }
    }

    return { guesses, correctValue, disabled };
  }, [
    state.config.gameMode,
    state.config.quizSet,
    state.quiz.status,
    state.quiz.prompt.quizDataIndex,
    state.quiz.prompt.guesses,
    state.quiz.reviewIndex,
    state.quiz.history,
    state.quizData,
    guessType,
    correctField
  ]);

  const componentStatus = useMemo(() => {
    if (state.config.gameMode === 'sandbox') {
      return 'sandbox';
    } else if (state.config.gameMode === 'quiz' || state.config.gameMode === 'learning' || state.config.gameMode === 'dailyChallenge') {
      if (state.quiz.status === 'not_started' || state.quiz.status === 'completed') {
        return 'disabled';
      } else if (state.quiz.status === 'reviewing' && state.quiz.reviewIndex !== null) {
        return 'reviewing';
      } else if (guesses && guesses.status === 'failed') {
        return 'failed';
      } else if (guesses && guesses.status === 'incomplete') {
        return 'active';
      } else if (guesses && guesses.status === 'completed') {
        return 'completed';
      } else if (guesses && guesses.status === 'prompted') {
        return 'prompting';
      }
    }
    return 'unknown';
  }, [state.config.gameMode, state.quiz.status, state.quiz.reviewIndex, guesses?.status, disabled]);

  const incorrectValues = useMemo(() => {
    if (!guesses || !guesses.attempts) return [];
    return guesses.attempts.filter(attempt => attempt !== correctValue);
  }, [guesses?.attempts, correctValue]);

  return {
    guesses,
    correctValue,
    disabled,
    componentStatus,
    incorrectValues
  };
}