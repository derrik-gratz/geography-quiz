import React, { useState, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { useQuizActions } from '../hooks/useQuizActions';

// {state.quizStatus === 'not_started' && (
//     <button className="quiz-config__start-button" onClick={startQuiz}>Start quiz</button>
// )}
// {state.quizStatus === 'in_progress' && (
//     <button className="quiz-config__give-up-button" onClick={handleGiveUp}>Give up</button>
// )}
// {state.quizStatus === 'completed' && (
//     <button className="quiz-config__start-button" onClick={resetQuiz}>New quiz</button>
// )}

export function QuizPrompt({}) {
    const { state } = useQuiz();
    const { startQuiz, giveUpPrompt, resetQuiz } = useQuizActions();

    // Reset give up state when prompt changes
    useEffect(() => {
        setHasGivenUp(false);
    }, [currentPrompt?.countryCode]);

    const handleGiveUp = () => {
        setHasGivenUp(true);
        
        // Notify parent component about give up
        if (onGiveUp) {
            onGiveUp(currentPrompt);
        }
        
        // Auto-generate next prompt after delay
        setTimeout(() => {
            generatePrompt();
        }, 4000);
    };
    const formatLatitude = (lat) => {
        const absLat = Math.abs(lat);
        const direction = lat >= 0 ? 'N' : 'S';
        return `${absLat.toFixed(1)}°${direction}`;
      };
      
      const formatLongitude = (lon) => {
        const absLon = Math.abs(lon);
        const direction = lon >= 0 ? 'E' : 'W';
        return `${absLon.toFixed(1)}°${direction}`;
      };

    const isStartDisabled = state.quizStatus === 'not_started' && (!state.quizSet || !state.selectedPromptTypes || state.selectedPromptTypes.length === 0);
    const promptCompleted = state.currentPromptStatus.map(input_type => input_type.status === 'prompted' || input_type.status === 'correct').every(status => status);
    
    const renderPromptContent = () => {
        if (showNiceMessage) {
            return (
                <div className="prompt-content">
                    <div className="prompt-name">
                        Nice! 🎉
                    </div>
                </div>
            );
        }
        if (!state.currentPrompt) {
            if (state.quizStatus === 'not_started') {
                    // return (
                    //     <div className="prompt-content__no-config">
                    //         <p>Select a quiz set and prompt types.</p>
                    //     </div>
                    // );
                return (
                    <button 
                        className="quiz-prompt__start-quiz-button" 
                        onClick={startQuiz}
                        disabled={isStartDisabled}
                    >
                        Start quiz
                    </button>
                );
            } else if (state.quizStatus === 'in_progress') {
                
                return (
                    <button 
                        className="quiz-prompt__give-up-button" 
                        onClick={giveUpPrompt}
                        disabled={promptCompleted}
                    >
                        {promptCompleted ? 'Complete!' : 'Give up'}
                    </button>
                );
            } else if (state.quizStatus === 'completed') {
                return (
                    <button className="quiz-config__start-button" onClick={resetQuiz}>New quiz</button>
                );
            }
            
                
        } 

        const { promptType, countryCode, countryData } = currentPrompt;

        switch (promptType) {
            case 'name':
                return (
                    <div className="prompt-content">
                        {/* <h3>What is the name of this country?</h3> */}
                        <div className="prompt-name">
                            {countryData?.country || countryCode}
                        </div>
                    </div>
                );
            
            case 'flag':
                return (
                    <div className="prompt-content">
                        {/* <h3>Which country does this flag belong to?</h3> */}
                        <span className={`prompt-flag fi fi-${countryData.flagCode.toLowerCase()}`}></span>
                    </div>
                );
            
            case 'location':
                return (
                    <div className="prompt-content">
                        {/* <h3>Where is {countryData?.name || countryCode} located?</h3> */}
                        <div className="prompt-location">
                            { formatLatitude(countryData.location.lat) }, { formatLongitude(countryData.location.long) }
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className="prompt-content">
                        <p>Unknown prompt type: {promptType}</p>
                        <p>Country: {countryCode}</p>
                    </div>
                );
        }
    };

    return (
        <div className="quiz-prompt">
            {/* Quiz controls */}
                <div className="quiz-controls">
                    {!currentPrompt && !isQuizFinished &&(
                        <button 
                            onClick={generatePrompt} 
                            disabled={isQuizFinished || hasGivenUp}
                            className="generate-prompt-btn"
                        >
                            {isQuizFinished ? 'Quiz Finished!' : 'Generate Prompt'}
                        </button>
                )}
                
                {currentPrompt && !isQuizFinished && !hasGivenUp && (
                    <button 
                        onClick={handleGiveUp} 
                        className="give-up-btn"
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: '1px solid #dc3545',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '8px'
                        }}
                    >
                        Give Up
                    </button>
                )}
                
                {isQuizFinished && (
                    <button onClick={resetQuiz} className="reset-quiz-btn">
                        Start New Quiz
                    </button>
                )}
            </div>
            
            {/* Current prompt display */}
            <div className="prompt-display">
                {renderPromptContent()}
            </div>
        </div>
    );
}
