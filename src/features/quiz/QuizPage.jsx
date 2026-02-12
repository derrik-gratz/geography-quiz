import React from 'react';
import { QuizConfig } from './components/QuizConfig.jsx';
import { QuizPrompt } from './components/QuizPrompt.jsx';
import { QuizLog } from './components/QuizLog.jsx';
import { QuizTextInput } from './components/TextInput.jsx';
import { QuizFlagSelect } from './components/FlagSelect.jsx';
import { QuizWorldMap } from './components/WorldMap.jsx';
import { QuizProvider } from './state/quizProvider.jsx';
import './QuizPage.css';
/**
 * QuizPage component
 * Main quiz interface with configuration, prompt, input methods, and log
 */
export function QuizPage() {
  return (
    <QuizProvider>
      <main className="app-main">
        <div className="left-column">
          <div className="quiz-page__config">
            <QuizConfig />
          </div>
          <div className="quiz-page__log">
            <QuizLog />
          </div>
          <div className="quiz-page__prompt">
            <QuizPrompt />
          </div>
        </div>
        <div className="right-column">
          <QuizTextInput />
          <QuizFlagSelect />
          <QuizWorldMap />
        </div>
      </main>
      </QuizProvider>
  );
}
