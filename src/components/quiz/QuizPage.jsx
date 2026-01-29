import React from 'react';
import { QuizConfig } from './QuizConfig.jsx';
import { QuizPrompt } from './QuizPrompt.jsx';
import { QuizLog } from './QuizLog.jsx';
import { QuizTextInput } from './TextInput.jsx';
import { QuizFlagSelect } from './FlagSelect.jsx';
import { QuizWorldMap } from './WorldMap.jsx';
import './QuizPage.css';
/**
 * QuizPage component
 * Main quiz interface with configuration, prompt, input methods, and log
 */
export function QuizPage() {
  return (
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
  );
}
