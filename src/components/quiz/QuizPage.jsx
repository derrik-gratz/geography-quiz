import React from 'react';
import { QuizConfig } from './QuizConfig.jsx';
import { QuizPrompt } from './QuizPrompt.jsx';
import { QuizFlagSelect } from './FlagSelect/FlagSelect.jsx';
import { QuizTextInput } from './TextInput/TextInput.jsx';
import { QuizWorldMap } from './WorldMap/WorldMap.jsx';
import { QuizLog } from './QuizLog.jsx';

export function QuizPage() {
  return (
    <main className="app-main">
      <div className="left-column">
        <div className="quiz-config-panel">
          <QuizConfig />
        </div>
        <div className="quiz-log-panel">
          <QuizLog />
        </div>
        <div className="quiz-prompt-panel">
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
