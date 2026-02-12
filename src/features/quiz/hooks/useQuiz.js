// src/hooks/useQuiz.js
import { useContext } from 'react';
import { QuizContext } from '../state/quizProvider.jsx';

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
}
