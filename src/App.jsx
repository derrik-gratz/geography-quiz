import React, { useState } from 'react';
import { QuizProvider } from './state/quizProvider.jsx';
import { NavigationBar } from './components/base/NavigationBar.jsx';
import { QuizPage } from './components/quiz/QuizPage.jsx';
import { ProfilePage } from './components/profile/ProfilePage.jsx';
import { initStorage } from './services/storageService.js';

/**
 * Main App component for the Geography Quiz application
 * Manages page navigation and displays quiz or profile page
 */
function App() {

    // Initialize storage on app mount
    React.useEffect(() => {
        initStorage().catch(error => {
            console.error('Failed to initialize storage:', error);
        });
    }, []);

    const [currentPage, setCurrentPage] = useState('quiz');

    return (
        <QuizProvider>
            <div className="app">
                {/* <NavigationBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                {currentPage === 'profile' ? ( */}
                    {/* <ProfilePage /> */}
                {/* ) : ( */}
                    <QuizPage />
                {/* )} */}
            </div>
        </QuizProvider>
    );
}

export default App;
