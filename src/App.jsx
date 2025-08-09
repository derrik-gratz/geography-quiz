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
        availableCountries,
        PROMPT_TYPES,
        selectedPromptTypes,
        setSelectedPromptTypes
    } = useQuizConfig();

    // Quiz engine state and functions
    const { currentPrompt, generatePrompt } = useQuizEngine(availableCountries, selectedPromptTypes);

    return (
        <div className="app">
            <header>
                <h1>Geography Quiz</h1>
            </header>
            <main>
                <p>Welcome to the Geography Quiz app!</p>
                
                {/* Quiz configuration section - handles quiz sets and prompt types */}
                <QuizConfig 
                    quizSet={quizSet} 
                    setQuizSet={setQuizSet} 
                    availableQuizSets={availableQuizSets}
                    selectedPromptTypes={selectedPromptTypes}
                    setSelectedPromptTypes={setSelectedPromptTypes}
                    PROMPT_TYPES={PROMPT_TYPES}
                />
                
                {/* Quiz controls - generate new prompts */}
                <button onClick={generatePrompt}>Generate Prompt</button>
                
                {/* Current prompt display */}
                {currentPrompt && (
                    <p>Current Prompt: {currentPrompt.promptType} of {currentPrompt.countryCode}</p>
                )}
            </main>
        </div>
    );
}

export default App; 