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
                                    console.log('Text answer result:', result);
                                }}
                                resetKey={currentPrompt?.countryCode}
                                disabled={currentPrompt?.promptType === 'name'}
                            />
                        </div>
                        <div className="flag-input-container">
                            <FlagSelect
                                onSelect={(country) => {
                                    const result = submitAnswer({ type: 'flag', value: country });
                                    console.log('Flag answer result:', result);
                                }}
                                displayCountries={displayCountryFlags}
                                incorrectCountries={incorrectCountries}
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
                                console.log('Map answer result:', result);
                            }}
                            disabled={currentPrompt?.promptType === 'location'}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App; 
