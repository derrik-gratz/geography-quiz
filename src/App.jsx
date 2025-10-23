import React, { useMemo, useState, useEffect } from 'react';
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
        isComplete,
        showNiceMessage
    } = useQuizEngine(processedCountryData);
    const handleFlagSelect = (countryCode) => {
        // Flag selection handled by onSelect callback
    };

    // Simple seeded random function for consistent flag ordering
    const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const displayCountryFlags = countryData
        .filter(country => country.flagCode && country.flagCode !== null)
        .sort((a, b) => {
            const seedA = seededRandom(a.code.charCodeAt(0) + a.code.charCodeAt(1) + a.code.charCodeAt(2));
            const seedB = seededRandom(b.code.charCodeAt(0) + b.code.charCodeAt(1) + b.code.charCodeAt(2));
            return seedA - seedB;
        });

    // Track incorrect attempts for visual feedback - separate by input type
    const [incorrectFlags, setIncorrectFlags] = useState([]);
    const [incorrectMapCountries, setIncorrectMapCountries] = useState([]);
    const [incorrectTextCountries, setIncorrectTextCountries] = useState([]);
    const [correctFlags, setCorrectFlags] = useState([]);
    const [correctMapCountries, setCorrectMapCountries] = useState([]);
    
    const clearHighlights = () => {
        setIncorrectFlags([]);
        setIncorrectMapCountries([]);
        setIncorrectTextCountries([]);
        setCorrectFlags([]);
        setCorrectMapCountries([]);
    };

    // Clear highlights when current prompt changes
    useEffect(() => {
        clearHighlights();
    }, [currentPrompt?.countryCode]);

    return (
        <div className="app">
            <main className="app-main">
                {/* Left Column - Controls and Results */}
                <div className="left-column">
                    {/* Quiz control panel - config, prompt, and controls */}
                    <div className="quiz-control-panel">
                        <QuizConfig 
                            quizSet={quizSet} 
                            setQuizSet={setQuizSet} 
                            availableQuizSets={availableQuizSets}
                            selectedPromptTypes={selectedPromptTypes}
                            setSelectedPromptTypes={setSelectedPromptTypes}
                            PROMPT_TYPES={PROMPT_TYPES}
                        />
                        
                        <QuizPrompt 
                            currentPrompt={currentPrompt}
                            generatePrompt={generatePrompt}
                            resetQuiz={resetQuiz}
                            isQuizFinished={isQuizFinished}
                            totalCountries={totalCountries}
                            currentProgress={promptHistory.length}
                            showNiceMessage={showNiceMessage}
                        />
                    </div>
                    
                    {/* Quiz log section - results */}
                    <QuizLog 
                        promptHistory={promptHistory}
                        attempts={attempts}
                        answers={answers}
                        currentPrompt={currentPrompt}
                        requiredAnswerTypes={requiredAnswerTypes}
                        isComplete={isComplete()}
                        totalCountries={totalCountries}
                        isQuizFinished={isQuizFinished}
                        quizSetName={quizSet?.name || 'Geography Quiz'}
                    />
                </div>

                {/* Right Column - Interactive Elements */}
                <div className="right-column">
                    {/* Top Row - Input Controls */}
                    <div className="input-row">
                        <div className="text-input-container">
                            <TextCountryInput
                                onSelect={(country) => {
                                    const result = submitAnswer({ type: 'text', value: country });
                                    if (result.correctCode) {
                                        setIncorrectTextCountries(prev => [...prev, country.code]);
                                    }
                                    return result; // Return result for feedback
                                }}
                                promptResetKey={currentPrompt?.countryCode}
                                disabled={currentPrompt?.promptType === 'name'}
                                incorrectCountries={incorrectTextCountries}
                            />
                        </div>
                        <div className="flag-input-container">
                            <FlagSelect
                                onSelect={(country) => {
                                    const result = submitAnswer({ type: 'flag', value: country });
                                    if (result.ok) {
                                        setCorrectFlags(prev => [...prev, country.code]);
                                    } else if (result.correctCode) {
                                        setIncorrectFlags(prev => [...prev, country.code]);
                                    }
                                }}
                                displayCountries={displayCountryFlags}
                                incorrectCountries={incorrectFlags}
                                correctCountries={correctFlags}
                                clearHighlights={clearHighlights}
                                disabled={currentPrompt?.promptType === 'flag'}
                            />
                        </div>
                    </div>
                    
                    {/* Bottom Row - Map */}
                    <div className="map-container">
                        <WorldMap
                            lockedOn={currentPrompt?.promptType === 'location' ? currentPrompt.countryCode : null }
                            onSubmitAnswer={(countryCode) => {
                                const result = submitAnswer({ type: 'map', value: countryCode });
                                if (result.ok) {
                                    setCorrectMapCountries(prev => [...prev, countryCode]);
                                } else if (result.correctCode) {
                                    setIncorrectMapCountries(prev => [...prev, countryCode]);
                                }
                            }}
                            incorrectCountries={incorrectMapCountries}
                            correctCountries={correctMapCountries}
                            disabled={currentPrompt?.promptType === 'location'}
                            promptResetKey={currentPrompt?.countryCode}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App; 
