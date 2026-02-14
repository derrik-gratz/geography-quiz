// src/hooks/useQuizActions.js
import { useCallback } from 'react';
import { useQuiz, useQuizDispatch } from '../state/quizProvider.jsx';
// import { filterCountryData } from '@/utils/filterCountryData.js';
import { checkSubmission } from '@/utils/quizEngine.js';
import {
  loadAllUserData,
  updateCountryLearningData,
} from '@/utils/storageService.js';
import { dailyChallengeCompletedToday } from '@/utils/statsService.js';
import countryData from '@/data/country_data.json';

export function useQuizActions() {
  const state = useQuiz();
  const dispatch = useQuizDispatch();

  const sandboxSelect = useCallback(
    ({ inputType, countryValue }) => {
      dispatch({
        type: 'SANDBOX_SELECT',
        payload: { inputType, countryValue },
      });
    },
    [dispatch],
  );

  // const startQuiz = useCallback(async () => {
  //   if (state.config.gameMode === 'quiz') {
  //     if (
  //       !state.config.selectedPromptTypes ||
  //       state.config.selectedPromptTypes.length === 0
  //     ) {
  //       console.error('Cannot start quiz: no prompt types selected');
  //       return;
  //     }
  //   }
  //   if (state.quizData.length === 0) {
  //     console.error('Cannot start quiz: no countries to quiz');
  //     return;
  //   }
  //   console.log(state.quizData);
  //   dispatch({ type: 'START_QUIZ' });
  // }, [
  //   state.quizData,
  //   dispatch,
  // ]);

  const submitAnswer = useCallback(
    (submissionType, submissionValue) => {
      // Only allow submission in active mode
      if (state.quiz.status !== 'active') {
        console.warn('Cannot submit answer: not in active mode');
        return;
      }

      if (
        !state.quizData ||
        state.quizData.length === 0 ||
        state.quiz.prompt.quizDataIndex >= state.quizData.length
      ) {
        console.error('Cannot submit answer: invalid quiz state');
        return;
      }

      // Check Daily Challenge guess limit (5 attempts per field)
      if (state.config.gameMode === 'dailyChallenge') {
        const guessState = state.quiz.prompt.guesses[submissionType];
        const currentAttempts = guessState?.n_attempts || 0;
        const currentStatus = guessState?.status;

        // Block if already at or over 5 attempts (unless already completed or failed)
        if (
          currentAttempts >= 5 &&
          currentStatus !== 'completed' &&
          currentStatus !== 'failed'
        ) {
          console.warn(
            `Cannot submit answer: 5 guess limit reached for ${submissionType}`,
          );
          return;
        }
      }

      const currentCountryData =
        state.quizData[state.quiz.prompt.quizDataIndex];
      const evaluation = checkSubmission(
        currentCountryData,
        submissionType,
        submissionValue,
      );

      dispatch({
        type: 'ANSWER_SUBMITTED',
        payload: {
          type: submissionType,
          value: submissionValue,
          isCorrect: evaluation,
        },
      });
    },
    [
      state.quizData,
      state.quiz.prompt.quizDataIndex,
      state.quiz.status,
      state.config.gameMode,
      state.quiz.prompt.guesses,
      dispatch,
    ],
  );

  const giveUpPrompt = useCallback(() => {
    dispatch({ type: 'GIVE_UP' });
  }, [dispatch]);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, [dispatch]);

  return {
    sandboxSelect,
    // startQuiz,
    submitAnswer,
    giveUpPrompt,
    resetQuiz,
  };
}
