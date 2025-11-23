import React from 'react';
import { QuizProvider } from './state/quizProvider.jsx';
import { QuizConfig } from './components/QuizConfig.jsx';

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
                        <div className="quiz-control-panel">
                            <QuizConfig />
                        </div>
                    </div>
                </main>
            </div>
        </QuizProvider>
    );
}

export default App;
