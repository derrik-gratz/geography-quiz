import React, { useMemo } from 'react';
import { QuizConfig } from './components/QuizConfig';
import { useQuizConfig } from './hooks/useQuizConfig';
import { useQuizEngine } from './hooks/useQuizEngine';
import { CountryDataService } from './services/countryDataService';

/**
 * Main App component for the Geography Quiz application
 * Manages quiz configuration and prompt generation
 */
function App() {
    // Quiz configuration state and functions from custom hook
    const { 
        quizSet, 
        setQuizSet, 
        availableQuizSets,
        PROMPT_TYPES,
        selectedPromptTypes,
        setSelectedPromptTypes
    } = useQuizConfig();

    // Get processed country data from the service
    const processedCountryData = useMemo(() => {
        return CountryDataService.getEngineData(quizSet, selectedPromptTypes);
    }, [quizSet, selectedPromptTypes]);

    // Quiz engine state and functions from custom hook
    const { 
        currentPrompt, 
        generatePrompt, 
        promptHistory,
        isQuizFinished, 
        resetQuiz,
        totalCountries
    } = useQuizEngine(processedCountryData);

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
                
                {/* Quiz progress indicator */}
                <div className="quiz-progress">
                    <p>Progress: {promptHistory.length} / {totalCountries} countries</p>
                </div>
                
                {/* Quiz controls - generate new prompts */}
                <button onClick={generatePrompt} disabled={isQuizFinished}>
                    {isQuizFinished ? 'Quiz Finished!' : 'Generate Prompt'}
                </button>
                
                {/* Current prompt display - shows the generated prompt */}
                {currentPrompt && (
                    <p>Current Prompt: {currentPrompt.promptType} of {currentPrompt.countryCode}</p>
                )}
                
                {/* Quiz end modal */}
                {isQuizFinished && (
                    <div className="quiz-end-modal">
                        <div className="modal-content">
                            <h2>🎉 Quiz Finished! 🎉</h2>
                            <p>Congratulations! You've completed all {totalCountries} countries in this quiz set.</p>
                            <button onClick={resetQuiz}>Start New Quiz</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App; 