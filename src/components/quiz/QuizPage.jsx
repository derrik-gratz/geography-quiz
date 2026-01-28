import React from 'react';
import { QuizConfig } from './QuizConfig.jsx';
import { QuizPrompt } from './QuizPrompt.jsx';
import { QuizLog } from './QuizLog.jsx';
import { QuizTextInput } from './TextInput.jsx';
import { QuizFlagSelect } from './FlagSelect.jsx';
import { QuizWorldMap } from './WorldMap.jsx';

/**
 * QuizPage component
 * Main quiz interface with configuration, prompt, input methods, and log
 */
export function QuizPage() {
  return (
    <main className="app-main">
      <div className="left-column">
        <QuizConfig />
        <QuizLog />
        <QuizPrompt />
      </div>
      <div className="right-column">
        <QuizTextInput />
        <QuizFlagSelect />
        <QuizWorldMap />
      </div>
    </main>
  );
}
