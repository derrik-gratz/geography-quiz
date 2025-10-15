import React, { useMemo } from 'react';
import { QuizConfig } from './components/QuizConfig';
import { QuizLog } from './components/QuizLog';
import { QuizPrompt } from './components/QuizPrompt';
import { FlagSelect } from './components/FlagSelect';
import { useQuizConfig } from './hooks/useQuizConfig';
import { useQuizEngine } from './hooks/useQuizEngine';
import { CountryDataService } from './services/countryDataService';
import { TextCountryInput } from './components/TextInput';
import countryData from './data/country_data.json';
import { WorldMap } from './components/WorldMap';

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
        totalCountries,
        submitAnswer,
        attempts,
        answers,
        requiredAnswerTypes,
        isComplete
    } = useQuizEngine(processedCountryData);
    console.log(currentPrompt);
    const handleFlagSelect = (countryCode) => {
        console.log('Flag selected:', countryCode);
    };

    const displayCountryFlags = countryData
        .filter(country => country.flagCode && country.flagCode !== null)

    const incorrectCountries = [];
    const clearHighlights = () => {};

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
                
                {/* Quiz log section - displays progress with attempts tracking */}
                <QuizLog 
                    promptHistory={promptHistory}
                    attempts={attempts}
                    answers={answers}
                    currentPrompt={currentPrompt}
                    requiredAnswerTypes={requiredAnswerTypes}
                    isComplete={isComplete()}
                    totalCountries={totalCountries}
                />
                
                {/* Quiz prompt section - handles displaying prompts and controls */}
                <QuizPrompt 
                    currentPrompt={currentPrompt}
                    generatePrompt={generatePrompt}
                    resetQuiz={resetQuiz}
                    isQuizFinished={isQuizFinished}
                    totalCountries={totalCountries}
                    currentProgress={promptHistory.length}
                />
                <TextCountryInput
                    onSelect={(country) => {
                        const result = submitAnswer({ type: 'text', value: country });
                        console.log('Text answer result:', result);
                    }}
                    resetKey={currentPrompt?.countryCode}
                />
                {/* Flag select section - handles flag selection */}
                <FlagSelect
                    onSelect={(country) => {
                        const result = submitAnswer({ type: 'flag', value: country });
                        console.log('Flag answer result:', result);
                    }}
                    displayCountries={displayCountryFlags}
                    incorrectCountries={incorrectCountries}
                    clearHighlights={clearHighlights}
                />
                <WorldMap
                    lockedOn={currentPrompt?.promptType === 'location' ? currentPrompt.countryCode : null }
                    onSubmitAnswer={(countryCode) => {
                        const result = submitAnswer({ type: 'map', value: countryCode });
                        console.log('Map answer result:', result);
                    }}
                />
            </main>
        </div>
    );
}

export default App; 