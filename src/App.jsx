import React from 'react';
import { QuizConfig } from './components/QuizConfig';
import { useQuizConfig } from './hooks/useQuizConfig';
import { useQuizEngine } from './hooks/useQuizEngine';

function App() {
    // Quiz configuration state and functions
    const { 
        quizSet, 
        setQuizSet, 
        availableQuizSets, 
        availableCountries 
    } = useQuizConfig();

    // Quiz engine state and functions
    const { currentPrompt, generatePrompt } = useQuizEngine(availableCountries);

    return (
        <div className="app">
            <header>
                <h1>Geography Quiz</h1>
            </header>
            <main>
                <p>Welcome to the Geography Quiz app!</p>
                
                {/* Quiz configuration section */}
                <QuizConfig 
                    quizSet={quizSet} 
                    setQuizSet={setQuizSet} 
                    availableQuizSets={availableQuizSets} 
                />
                
                {/* Quiz controls */}
                <button onClick={generatePrompt}>Generate Prompt</button>
                
                {/* Current prompt display */}
                {currentPrompt && (
                    <p>Current Prompt: {currentPrompt}</p>
                )}
            </main>
        </div>
    );
}

export default App; 