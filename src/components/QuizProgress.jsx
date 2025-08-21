/**
 * QuizProgress Component
 * 
 * Displays current quiz progress and completion status
 * 
 * @param {number} props.currentProgress - Current number of completed prompts
 * @param {number} props.totalCountries - Total countries in current quiz set
 * @param {boolean} props.isQuizFinished - Whether quiz is complete
 * @returns {JSX.Element} Quiz progress display
 */
export function QuizProgress({ currentProgress, totalCountries, isQuizFinished }) {
    const progressPercentage = totalCountries > 0 ? (currentProgress / totalCountries) * 100 : 0;
    
    return (
        <div className="quiz-progress">
            <div className="progress-header">
                <h3>Quiz Progress</h3>
                <p className="progress-text">
                    {currentProgress} / {totalCountries} countries
                </p>
            </div>
            
            <div className="progress-bar-container">
                <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={currentProgress}
                    aria-valuemin={0}
                    aria-valuemax={totalCountries}
                ></div>
            </div>
            
            {isQuizFinished && (
                <div className="completion-message">
                    <p>🎉 All countries completed! 🎉</p>
                </div>
            )}
        </div>
    );
}
