import { createContext, useReducer, useMemo, useContext, useEffect } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js';
import { useQuizProgression } from '../hooks/useQuizProgression.js';

// function setQuizData(dispatch, gameMode, quizSet, selectedPromptTypes, userData = null) {
//   const quizData = prepareQuizData(gameMode, quizSet, selectedPromptTypes, userData);
//   dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
// }

// function startQuiz(dispatch, state) {
//   if (state.config.gameMode === 'quiz') {
//     if (!state.config.selectedPromptTypes || state.config.selectedPromptTypes.length === 0) {
//       console.error('Cannot start quiz: no prompt types selected');
//       return;
//     }
//   }
//   if (state.quizData.length === 0) {
//     console.error('Cannot start quiz: no countries to quiz');
//     return;
//   }
//   setQuizData(
//     dispatch,
//     state.config.gameMode,
//     state.config.quizSet,
//     state.config.selectedPromptTypes,
//     state.userData,
//   );
//   dispatch({ type: 'START_QUIZ' });
// }

// async function switchGameMode(dispatch, state, gameMode) {
//   dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
//   const userData = gameMode === 'learning' ? await loadAllUserData() : null;
//   setQuizData(
//     dispatch,
//     gameMode,
//     state.config.quizSet,
//     state.config.selectedPromptTypes,
//     userData,
//   );
// }

const QuizContext = createContext(null);
const QuizDispatchContext = createContext(null);

export function useQuizThunks() {
  const state = useQuiz();
  const dispatch = useQuizDispatch();
  return useMemo(
    () => ({
      startQuiz: () => startQuiz(dispatch, state),
      switchGameMode: (gameMode) => switchGameMode(dispatch, state, gameMode),
    }),
    [dispatch, state],
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context == null) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
}

export function useQuizDispatch() {
  const context = useContext(QuizDispatchContext);
  if (context == null) {
    throw new Error('useQuizDispatch must be used within QuizProvider');
  }
  return context;
}

export function QuizProvider({ children }) {
  // https://react.dev/reference/react/useReducer#avoiding-recreating-the-initial-state
  const [state, dispatch] = useReducer(quizReducer, null, createInitialQuizState);

  useQuizProgression(state, dispatch);

  // useEffect(() => {
  //   if (state.config.gameMode === null) {
  //     switchGameMode(dispatch, state, 'dailyChallenge');
  //   }
  // }, [state.config.gameMode]);

  return (
    <QuizContext.Provider value={state}>
      <QuizDispatchContext.Provider value={dispatch}>
        {children}
      </QuizDispatchContext.Provider>
    </QuizContext.Provider>
  );
}
