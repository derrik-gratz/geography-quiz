/**
 * QuizConfig Component
 * 
 * Renders configuration options for quiz sets and prompt types
 * 
 * @param {string|null} props.quizSet - Currently selected quiz set
 * @param {Function} props.setQuizSet - Function to update quiz set selection
 * @param {Array} props.availableQuizSets - Array of available quiz sets
 * @param {Array} props.selectedPromptTypes - Currently selected prompt types
 * @param {Function} props.setSelectedPromptTypes - Function to update prompt type selection
 * @param {Array} props.PROMPT_TYPES - Available prompt type constants
 * @returns {JSX.Element} Quiz configuration interface
 */
export function QuizConfig({ 
    quizSet, 
    setQuizSet, 
    availableQuizSets, 
    selectedPromptTypes, 
    setSelectedPromptTypes, 
    PROMPT_TYPES 
}) {
    return (
        <div className="quiz-config">
            <div className="config-row">
                {quizSet !== 'Daily challenge' && (
                    <div className="config-group">
                        <label>Prompt types:</label>
                        <div className="prompt-types">
                            {selectedPromptTypes.length === 0 && (
                                <div className="warning-message">
                                    <p>Select at least one prompt type.</p>
                                </div>
                            )}
                            {PROMPT_TYPES.map(type => (
                                <label key={type} className="prompt-type-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedPromptTypes.includes(type)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPromptTypes([...selectedPromptTypes, type]);
                                            } else {
                                                setSelectedPromptTypes(selectedPromptTypes.filter(t => t !== type));
                                            }
                                        }}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="config-group">
                    <label htmlFor="quiz-set">Quiz Set:</label>
                    <select 
                        id="quiz-set"
                        value={quizSet || ''} 
                        onChange={(e) => setQuizSet(e.target.value || null)}
                    >
                        <option value="Daily challenge">Daily challenge</option>
                        {availableQuizSets.map(set => (
                            <option key={set.name} value={set.name}>
                                {set.name}
                            </option>
                        ))}
                        <option value="all">All countries</option>
                    </select>
                </div>
            </div>
        </div>
    );
}