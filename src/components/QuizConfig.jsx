/**
 * QuizConfig Component
 * 
 * Renders a dropdown for selecting quiz sets and manages quiz configuration
 * 
 * @param {string|null} props.quizSet - Currently selected quiz set
 * @param {Function} props.setQuizSet - Function to update quiz set selection
 * @param {Array} props.availableQuizSets - Array of available quiz sets
 * @returns {JSX.Element} Quiz configuration interface
 */
export function QuizConfig({ quizSet, setQuizSet, availableQuizSets }) {
    return (
        <div className="quiz-config">
            <label htmlFor="quiz-set">Select Quiz Set: </label>
            <select 
                id="quiz-set"
                value={quizSet || ''} 
                onChange={(e) => setQuizSet(e.target.value || null)}
            >
                <option value="all">All countries</option>
                {availableQuizSets.map(set => (
                    <option key={set.name} value={set.name}>
                        {set.name}
                    </option>
                ))}
            </select>
        </div>
    );
}