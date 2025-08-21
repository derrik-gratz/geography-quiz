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
    currentProgress 
}) {
    const renderPromptContent = () => {
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
                        <div className="country-flag">
                            <span className={`fi fi-${countryCode.toLowerCase()}`}></span>
                        </div>
                        <p className="hint">Flag: {countryCode}</p>
                    </div>
                );
            
            case 'flag':
                return (
                    <div className="prompt-content">
                        {/* <h3>Which country does this flag belong to?</h3> */}
                        <p className="country-name">{countryData?.name || countryCode}</p>
                        <p className="hint">Name: {countryData?.name || countryCode}</p>
                    </div>
                );
            
            case 'location':
                return (
                    <div className="prompt-content">
                        {/* <h3>Where is {countryData?.name || countryCode} located?</h3> */}
                        <div className="country-flag">
                            <span className={`fi fi-${countryCode.toLowerCase()}`}></span>
                        </div>
                        <p className="hint">Flag: {countryCode}</p>
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
                <button 
                    onClick={generatePrompt} 
                    disabled={isQuizFinished}
                    className="generate-prompt-btn"
                >
                    {isQuizFinished ? 'Quiz Finished!' : 'Generate Prompt'}
                </button>
                
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
        </div>
    );
}
