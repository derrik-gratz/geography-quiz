import { createContext, useReducer, useMemo, useContext, useEffect } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js';
import { useQuizProgression } from '../hooks/useQuizProgression.js';

const QuizContext = createContext(null);
const QuizDispatchContext = createContext(null);

// export function useQuizThunks() {
//   const state = useQuiz();
//   const dispatch = useQuizDispatch();
//   return useMemo(
//     () => ({
//       startQuiz: () => startQuiz(dispatch, state),
//       switchGameMode: (gameMode) => switchGameMode(dispatch, state, gameMode),
//     }),
//     [dispatch, state],
//   );
// }

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
