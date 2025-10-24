import React, { useState, useEffect } from 'react';

/**
 * QuizPrompt Component
 * 
 * Renders the current quiz prompt (display only, no user input)
 * 
 * @param {Object|null} props.currentPrompt - Current prompt object from quiz engine
 * @param {Function} props.generatePrompt - Function to generate new prompt
 * @param {Function} props.resetQuiz - Function to reset quiz
 * @param {boolean} props.isQuizFinished - Whether quiz is complete
 * @param {number} props.totalCountries - Total countries in current quiz set
 * @param {number} props.currentProgress - Current progress count
 * @returns {JSX.Element} Quiz prompt display interface
 */
export function QuizPrompt({ 
    currentPrompt, 
    generatePrompt, 
    resetQuiz, 
    isQuizFinished, 
    totalCountries, 
    currentProgress,
    showNiceMessage = false,
    onGiveUp
}) {
    const [hasGivenUp, setHasGivenUp] = useState(false);

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
        }, 3000); // 3 second delay
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

        if (!currentPrompt) {
            return (
                <div className="prompt-placeholder">
                    <p>Click "Generate Prompt" to start the quiz!</p>
                </div>
            );
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
