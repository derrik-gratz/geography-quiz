import { createContext, useReducer, useMemo, useContext } from 'react';
import { createInitialQuizState, quizReducer } from './quizContext.js';
import { useQuizProgression } from '../hooks/useQuizProgression.js';
import { switchGameMode } from './quizThunks.js';

const QuizContext = createContext(null);
const QuizDispatchContext = createContext(null);
const QuizThunks = createContext(null);

export function useQuizThunks() {
  const context = useContext(QuizThunks);
  if (context == null) {
    throw new Error('useQuizThunks must be used within QuizProvider');
  }
  return context;
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
  const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());

  // const currentPromptData = useMemo(() => {
  //   if (
  //     !state.quizData ||
  //     state.quiz.prompt.quizDataIndex >= state.quizData.length
  //   ) {
  //     return null;
  //   }
  //   return state.quizData[state.quiz.prompt.quizDataIndex];
  // }, [state.quizData, state.quiz.prompt.quizDataIndex]);

  useQuizProgression(state, dispatch);

  const thunks = useMemo(() => {
    return { switchGameMode: (gameMode) => switchGameMode(dispatch, state, gameMode) };
  }, [dispatch, state]);

  return (
    <QuizContext.Provider value={state}>
      <QuizDispatchContext.Provider value={dispatch}>
        <QuizThunks.Provider value={thunks}>
          {children}
        </QuizThunks.Provider>
      </QuizDispatchContext.Provider>
    </QuizContext.Provider>
  );
}
