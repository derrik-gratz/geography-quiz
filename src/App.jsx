import React, { useState } from 'react';
import { QuizProvider } from './state/quizProvider.jsx';
import { QuizConfig } from './components/quiz/QuizConfig.jsx';
import { QuizPrompt } from './components/quiz/QuizPrompt.jsx';
import { QuizFlagSelect } from './components/quiz/FlagSelect/FlagSelect.jsx';
import { QuizTextInput } from './components/quiz/TextInput/TextInput.jsx';
import { QuizWorldMap } from './components/quiz/WorldMap/WorldMap.jsx';
import { QuizLog } from './components/quiz/QuizLog.jsx';
import { ProfilePage } from './components/profile/ProfilePage.jsx';
import { initStorage } from './services/storageService.js';
import './components/profile/ProfilePage.css';

/**
 * Main App component for the Geography Quiz application
 * Manages page navigation and displays quiz or profile page
 */
function App() {
    const [currentPage, setCurrentPage] = useState('quiz');

    // Initialize storage on app mount
    React.useEffect(() => {
        initStorage().catch(error => {
            console.error('Failed to initialize storage:', error);
        });
    }, []);

    return (
        <QuizProvider>
            <div className="app">
                <nav style={{ 
                    padding: '1rem 2rem', 
                    borderBottom: '2px solid var(--border-color)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => setCurrentPage('quiz')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: currentPage === 'quiz' ? 'var(--color-selected)' : 'none',
                            color: currentPage === 'quiz' ? 'white' : 'var(--text-primary)',
                            border: '2px solid',
                            borderColor: currentPage === 'quiz' ? 'var(--color-selected)' : 'var(--border-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Quiz
                    </button>
                    <button
                        onClick={() => setCurrentPage('profile')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: currentPage === 'profile' ? 'var(--color-selected)' : 'none',
                            color: currentPage === 'profile' ? 'white' : 'var(--text-primary)',
                            border: '2px solid',
                            borderColor: currentPage === 'profile' ? 'var(--color-selected)' : 'var(--border-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Profile
                    </button>
                </nav>
                {currentPage === 'profile' ? (
                    <ProfilePage />
                ) : (
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
                )}
            </div>
        </QuizProvider>
    );
}

export default App;
