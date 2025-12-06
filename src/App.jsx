import React from 'react';
import { QuizProvider } from './state/quizProvider.jsx';
import { QuizConfig } from './components/QuizConfig.jsx';
import { QuizPrompt } from './components/QuizPrompt.jsx';
import { FlagSelect } from './components/FlagSelect.jsx';
import { TextInput } from './components/TextInput.jsx';
import { WorldMap } from './components/WorldMap.jsx';
import { QuizLog } from './components/QuizLog.jsx';
/**
 * Main App component for the Geography Quiz application
 * Displays quiz configuration interface
 */
function App() {
    return (
        <QuizProvider>
            <div className="app">
                <main className="app-main">
                    <div className="left-column">
                        <div className="quiz-config-panel">
                            <QuizConfig />
                            <QuizLog />
                        </div>
                        <div className="quiz-prompt-panel">
                            <QuizPrompt />
                        </div>
                    </div>
                    <div className="right-column">
                        <TextInput />
                        <FlagSelect />
                        <WorldMap />
                    </div>

                </main>
            </div>
        </QuizProvider>
    );
}

export default App;
