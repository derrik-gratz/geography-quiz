// src/hooks/useQuizActions.js
import { useCallback } from 'react';
import { useQuiz } from './useQuiz.js';
import { filterCountryData } from '@/utils/filterCountryData.js';
import { checkSubmission } from '@/utils/quizEngine.js';
import {
  loadAllUserData,
  updateCountryLearningData,
} from '@/utils/storageService.js';
import { dailyChallengeCompletedToday } from '@/utils/statsService.js';
import countryData from '@/data/country_data.json';

export function useQuizActions() {
  const { dispatch, state } = useQuiz();

  const setQuizSet = useCallback(
    (quizSet) => {
      dispatch({ type: 'SET_QUIZ_SET', payload: quizSet });
    },
    [dispatch],
  );

  const setSelectedPromptTypes = useCallback(
    (selectedPromptTypes) => {
      dispatch({
        type: 'SET_SELECTED_PROMPT_TYPES',
        payload: selectedPromptTypes,
      });
    },
    [dispatch],
  );

  const handlePromptTypeChange = (type, checked) => {
    if (checked) {
      setSelectedPromptTypes([...state.config.selectedPromptTypes, type]);
    } else {
      setSelectedPromptTypes(
        state.config.selectedPromptTypes.filter((t) => t !== type),
      );
    }
  };

  const setGameMode = useCallback(
    async (gameMode) => {
      dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
      if (gameMode === 'sandbox') {
        setQuizSet('all');
        const quizData = filterCountryData(
          'all',
          state.config.selectedPromptTypes,
          countryData,
          gameMode,
        );
        dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
      } else if (gameMode === 'dailyChallenge') {
        const quizData = filterCountryData(
          'Daily challenge',
          state.config.selectedPromptTypes,
          countryData,
          gameMode,
        );
        dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
      } else if (gameMode === 'learning') {
        setQuizSet('all');
        try {
          const userData = await loadAllUserData();
          const quizData = filterCountryData(
            'all',
            state.config.selectedPromptTypes,
            countryData,
            gameMode,
            userData,
          );
          dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
        } catch (error) {
          console.error('Failed to load countries for learning mode:', error);
        }
      }
    },
    [dispatch, state.config.selectedPromptTypes, setQuizSet],
  );

  const sandboxSelect = useCallback(
    ({ inputType, countryValue }) => {
      dispatch({
        type: 'SANDBOX_SELECT',
        payload: { inputType, countryValue },
      });
    },
    [dispatch],
  );

  const startQuiz = useCallback(async () => {
    // Check if daily challenge is already completed today
    if (state.config.gameMode === 'dailyChallenge') {
      try {
        const userData = await loadAllUserData();
        if (dailyChallengeCompletedToday(userData)) {
          alert(
            "You have already completed today's daily challenge! Come back tomorrow for a new challenge.",
          );
          return;
        }
      } catch (error) {
        console.error('Failed to check daily challenge status:', error);
        // Continue with quiz start if check fails (don't block user)
      }
    }

    if (!state.config.quizSet) {
      console.error('Cannot start quiz: quizSet is not selected');
      return;
    }

    // Learning mode doesn't require prompt types
    if (state.config.gameMode !== 'learning') {
      if (
        !state.config.selectedPromptTypes ||
        state.config.selectedPromptTypes.length === 0
      ) {
        console.error('Cannot start quiz: no prompt types selected');
        return;
      }
    }

    // For learning mode, load userData and filter countries due for review
    if (state.config.gameMode === 'learning') {
      try {
        const userData = await loadAllUserData();
        const quizData = filterCountryData(
          state.config.quizSet,
          state.config.selectedPromptTypes,
          countryData,
          state.config.gameMode,
          userData,
        );
        dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
        dispatch({ type: 'START_QUIZ' });
      } catch (error) {
        console.error('Failed to load countries for learning mode:', error);
      }
    } else {
      const quizData = filterCountryData(
        state.config.quizSet,
        state.config.selectedPromptTypes,
        countryData,
        state.config.gameMode,
      );
      dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
      dispatch({ type: 'START_QUIZ' });
    }
  }, [
    state.config.quizSet,
    state.config.selectedPromptTypes,
    state.config.gameMode,
    dispatch,
  ]);

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
    setQuizSet,
    setSelectedPromptTypes,
    handlePromptTypeChange,
    setGameMode,
    sandboxSelect,
    startQuiz,
    submitAnswer,
    giveUpPrompt,
    resetQuiz,
  };
}
