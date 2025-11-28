import React from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { useQuizActions } from '../hooks/useQuizActions';
import quizSets from '../data/quiz_sets.json';

/**
 * QuizConfig Component
 * 
 * Renders configuration options for quiz sets and prompt types
 * 
 * @returns {JSX.Element} Quiz configuration interface
 */

const PROMPT_TYPES = ['location', 'name', 'flag'];

export function QuizConfig() {
    const { state } = useQuiz();
    const { setQuizSet, setSelectedPromptTypes } = useQuizActions();

    const { quizSet, selectedPromptTypes } = state.config;

    const handlePromptTypeChange = (type, checked) => {
        if (checked) {
            setSelectedPromptTypes([...selectedPromptTypes, type]);
        } else {
            setSelectedPromptTypes(selectedPromptTypes.filter(t => t !== type));
        }
    };
    return (
        <div className="quiz-config">
            <div className="quiz-config__quiz-set">              
                <label htmlFor="quiz-set-select">Quiz Set:</label>
                <select 
                    id="quiz-set-select"
                    className="quiz-config__quiz-set-dropdown"
                    value={quizSet || ''} 
                    onChange={(e) => setQuizSet(e.target.value || null)}
                >
                    <option value="Daily challenge">Daily challenge</option>
                    {quizSets.map(set => (
                        <option key={set.name} value={set.name}>
                            {set.name}
                        </option>
                    ))}
                    <option value="all">All countries</option>
                </select>
            </div>
            <div className="quiz-config__prompt-types">
                {quizSet && quizSet !== 'Daily challenge' && (
                    <>
                        <label htmlFor="prompt-types-select">Prompt types:</label>
                        {selectedPromptTypes.length === 0 && (
                            <div className="quiz-config__warning">
                                <p className="quiz-config__warning-text">Select at least one prompt type.</p>
                            </div>
                        )}
                        <div className="quiz-config__checkbox-group">
                            {PROMPT_TYPES.map(type => (
                                <label key={type} className="quiz-config__checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="quiz-config__checkbox-input"
                                        checked={selectedPromptTypes.includes(type)}
                                        onChange={(e) => {handlePromptTypeChange(type, e.target.checked)}}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}