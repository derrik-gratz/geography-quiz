import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js';
import {
  checkPromptCompletion,
  checkQuizCompletion,
  generatePromptType,
  derivePromptValue,
} from '../services/quizEngine.js';
import {
  saveDailyChallenge,
  updateCountryLearningData,
} from '@/services/storageService.js';
import { transformQuizStateToStorage } from '@/services/storageService.js';
import { formatDateString } from '@/types/dataSchemas.js';

export const QuizContext = createContext();

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());
  // todo: pass reset inputs to children?
  // const resetInputs = () => {
  // }

  // Monitor for prompt completion
  // const quizCountryData = useMemo(() => {
  //     return getQuizCountryData(state.quizSet);
  // }, [state.quizSet, state.selectedPromptTypes]);

  const currentPromptData = useMemo(() => {
    if (
      !state.quizData ||
      state.quiz.prompt.quizDataIndex >= state.quizData.length
    ) {
      return null;
    }
    return state.quizData[state.quiz.prompt.quizDataIndex];
  }, [state.quizData, state.quiz.prompt.quizDataIndex]);

  const totalCountries = useMemo(() => {
    return state.quizData.length;
  }, [state.quizData]);

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
  useEffect(() => {
    if (promptCompleted && state.quiz.status === 'active') {
      dispatch({ type: 'PROMPT_FINISHED' });

      // For learning mode, update learning data when prompt is completed
      // Check if both modalities were correct (prompt passed)
      if (state.config.gameMode === 'learning') {
        const guesses = state.quiz.prompt.guesses;
        const promptType = state.quiz.prompt.type;

        // Get the two input modalities (not the prompted one)
        const inputModalities = ['name', 'flag', 'location'].filter(
          (type) => type !== promptType,
        );

        // Check if both input modalities were completed (correct)
        const bothCorrect = inputModalities.every(
          (type) => guesses[type]?.status === 'completed',
        );

        const currentCountry = state.quizData[state.quiz.prompt.quizDataIndex];
        if (currentCountry) {
          const countryCode = currentCountry.code;
          // Update learning data based on whether both were correct
          updateCountryLearningData(countryCode, bothCorrect).catch((error) => {
            console.error('Failed to update learning data:', error);
          });
        }
      }
    }
  }, [
    promptCompleted,
    state.quiz.status,
    state.config.gameMode,
    state.quiz.prompt.guesses,
    state.quiz.prompt.type,
    state.quiz.prompt.quizDataIndex,
    state.quizData,
  ]);
  useEffect(() => {
    if (state.quiz.status === 'reviewing' && state.quiz.reviewType === 'auto') {
      // Calculate delay: 1s for success, 3s for failure/give-up
      // Check the most recent history entry to determine success
      const lastHistoryEntry =
        state.quiz.history[state.quiz.history.length - 1];
      const wasSuccessful =
        lastHistoryEntry &&
        Object.values(lastHistoryEntry).every(
          (entry) =>
            entry.status === 'prompted' || entry.status === 'completed',
        );

      const delay = wasSuccessful ? 1000 : 3000;

      const handleAutoReview = async () => {
        await sleep(delay);
        dispatch({ type: 'REVIEW_COMPLETED' });
      };

      handleAutoReview();
    }
  }, [state.quiz.status, state.quiz.reviewType, state.quiz.history]);

  const isQuizFinished = useMemo(() => {
    if (state.quiz.status === 'active') {
      return checkQuizCompletion(state);
    }
    return false;
  }, [state.quiz.status, state.quiz.prompt.quizDataIndex, state.quizData]);

  // Quiz completion
  useEffect(() => {
    if (isQuizFinished) {
      dispatch({ type: 'QUIZ_COMPLETED' });
      if (
        state.config.gameMode === 'dailyChallenge' &&
        state.quiz.history &&
        state.quiz.history.length > 0 &&
        state.quizData &&
        state.quizData.length > 0
      ) {
        // Transform quiz state to storage format
        const challengeData = transformQuizStateToStorage(
          state,
          state.quizData,
        );
        const date = formatDateString(new Date());

        // Save to storage (non-blocking)
        saveDailyChallenge(date, challengeData).catch((error) => {
          console.error('Failed to save daily challenge:', error);
          // Don't block user experience if save fails
        });
      }
    }
  }, [isQuizFinished]);

  // monitor for prompt generation if there is no current prompt
  useEffect(() => {
    if (isQuizFinished) {
      return;
    }
    if (state.quiz.prompt.quizDataIndex >= state.quizData.length) {
      return;
    }

    // Only generate if in active mode, no current prompt, and quiz is in progress
    if (
      !state.quiz.prompt.type &&
      state.quiz.status === 'active' &&
      state.quiz.reviewType === null &&
      state.quiz.prompt.quizDataIndex < state.quizData.length
    ) {
      const promptType = generatePromptType(state);
      if (promptType && currentPromptData) {
        dispatch({ type: 'PROMPT_GENERATED', payload: { promptType } });
      }
    }
  }, [
    isQuizFinished,
    // autoReviewCompleted,
    state.quiz.status,
    state.quiz.prompt.type,
    state.quiz.prompt.quizDataIndex,
    state.quizData,
    currentPromptData,
    dispatch,
  ]);

  return (
    <QuizContext.Provider
      value={{
        state,
        currentPromptData,
        totalCountries,
        promptCompleted,
        isQuizFinished,
        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}
