// src/hooks/usePromptState.js
import { useMemo, useEffect } from 'react';
import { useQuiz } from '../state/quizProvider.jsx';
import { countryModalityValue } from '@/utils/quizEngine.js';
import { useModalityState, useModalityStateDispatch } from '../state/modalityProvider.jsx';

/**
 * Pure derivation of modality component state from quiz state. Guesses stay in quiz state; this returns only what the UI needs (correctValue, disabled, componentStatus, incorrectValues).
 *
 * @param {string} gameMode - 'sandbox' | 'quiz' | 'learning' | 'dailyChallenge'
 * @param {string} quizStatus - 'active' | 'reviewing' | 'not_started' | 'completed'
 * @param {Object} guesses - guesses object
 * @param {string} modality - 'name' | 'flag' | 'location'
 * @param {string} guessType - 'name' | 'flag' | 'location'
 * @returns {string} componentStatus - 'sandbox' | 'active' | 'reviewing' | 'disabled' | 'unknown'
 */
function computeModalityStatus(gameMode, quizStatus, guesses, modality) {
  if (gameMode === 'sandbox') {
    return 'sandbox'
  } else if (
    gameMode === 'quiz' ||
    gameMode === 'learning' ||
    gameMode === 'dailyChallenge'
  ) {
    if (quizStatus === 'active') {
      const componentStatus = guesses[modality]?.status === 'incomplete' ? 'incomplete' : 
      guesses[modality]?.status === 'completed' ? 'completed' :
      guesses[modality]?.status === 'failed' ? 'failed' :
      guesses[modality]?.status === 'prompted' ? 'prompting' :
      'unknown';
      return componentStatus
    } else if (quizStatus === 'reviewing') {
      return 'reviewing';
    } else if (quizStatus === 'not_started' || quizStatus === 'completed') {
      return 'disabled';
    }
  }
  return null;
}

export function syncModalityStateWithQuizState() {
  const state = useQuiz();
  const modalityState = useModalityState();
  const modalityStateDispatch = useModalityStateDispatch();
  const modalityType = modalityState.modalityType;

  const status = useMemo(() => {
    return computeModalityStatus(state.config.gameMode, state.quiz.status, state.quiz.prompt.guesses, modalityType);
  }, [state.config.gameMode, state.quiz.status, state.quiz.prompt.guesses, modalityType]);
  useEffect(() => {
    modalityStateDispatch({ type: 'STATUS_CHANGED', payload: status });
  }, [status, modalityStateDispatch]);

  const correctValue = useMemo(() => {
    let countryDataIndex = null;
    if (state.quiz.status === 'reviewing') {
      countryDataIndex = state.quiz.history[state.quiz.reviewIndex].quizDataIndex;
    } else if (state.quiz.status === 'active') {
      countryDataIndex = state.quiz.prompt.quizDataIndex;
    } else {
      return null;
    }
    return countryModalityValue(state.quizData[countryDataIndex], modalityType);
    // return computeModalityCorrectValue(state.quiz.status, state.quizData, countryData, modalityType);
  }, [state.quiz.status, state.quizData, state.quiz.prompt.quizDataIndex, state.quiz.reviewIndex, state.quiz.history, modalityType]);
  useEffect(() => {
    modalityStateDispatch({ type: 'CORRECT_VALUE_CHANGED', payload: correctValue });
  }, [correctValue, modalityStateDispatch]);

  const incorrectValues = useMemo(() => {
    let guesses = null;
    if (state.quiz.status === 'reviewing') {
      guesses = state.quiz.history[state.quiz.reviewIndex][modalityType];
    } else if (state.quiz.status === 'active') {
      guesses = state.quiz.prompt.guesses[modalityType];
    } else {
      return [];
    }
    const attempts = guesses?.attempts ?? []
    const status = guesses?.status
    if (status === 'incomplete' || status === 'failed' ) {
      return attempts
    } else if (status === 'completed') {
      return attempts.slice(0, -1)
    }
    return []
  }, [state.quiz.prompt.guesses[modalityType], modalityType, state.quiz.status, state.quiz.reviewIndex, state.quiz.history, state.quiz.prompt.quizDataIndex, state.quizData]);
  useEffect(() => {
    modalityStateDispatch({ type: 'INCORRECT_VALUES_CHANGED', payload: incorrectValues });
  }, [incorrectValues, modalityStateDispatch]);

  const isCollapsed = useMemo(() => {
    return state.quiz.status === 'not_started' ? false : 
    status === 'prompting' ? true : 
    (status === 'completed' || status === 'failed') && state.quiz.status === 'active' ? true :
    false;
  }, [status, state.quiz.status]);
  useEffect(() => {
    if (isCollapsed) {
      modalityStateDispatch({ type: 'COLLAPSE_COMPONENT' });
    } else {
      modalityStateDispatch({ type: 'EXPAND_COMPONENT' });
    }
  }, [isCollapsed, modalityStateDispatch]);
}

/**
 * Computes the correct value for a modality
 * @param {string} quizStatus - 'active' | 'reviewing' | 'not_started' | 'completed'
 * @param {Object} quizData - quiz data
 * @param {number} quizDataIndex - index of the quiz data
 * @param {number} reviewIndex - index of the review data
 * @param {string} modality - 'name' | 'flag' | 'location'
 * @returns {string|null} - the correct value for the modality
 */
// export function computeModalityCorrectValue(quizStatus, countryData, modality) {
//   if (quizStatus === 'active') {
//     return countryModalityValue(quizData[quizDataIndex], modality);
//   } else if (quizStatus === 'reviewing') {
//     return countryModalityValue(history[reviewIndex], modality);
//   }
//   return null;
// }