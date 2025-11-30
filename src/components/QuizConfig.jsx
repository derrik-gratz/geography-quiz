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
    const { setQuizSet, handlePromptTypeChange, setGameMode } = useQuizActions();

    const { quizSet, selectedPromptTypes, gameMode } = state.config;

    return (
        <div className="quiz-config">
            {state.quiz.status === 'not_started' && (
                <div className="quiz-config__game-mode-select">
                    <label htmlFor="game-mode-select">Game mode:</label>
                    <label>
                        <input
                            type="radio"
                            name="game-mode"
                            className="quiz-config__game-mode-input"
                            value="sandbox"
                            checked={gameMode === 'sandbox'}
                            onChange={(e) => setGameMode(e.target.checked ? 'sandbox' : 'quiz')}
                        />
                        Sandbox
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="game-mode"
                            className="quiz-config__game-mode-input"
                            value="quiz"
                            checked={gameMode === 'quiz'}
                            onChange={(e) => setGameMode(e.target.checked ? 'quiz' : 'sandbox')}
                        />
                        Normal
                    </label>
                </div>
            )}
            <div className="quiz-config__quiz-set">              
                <label htmlFor="quiz-set-select">Quiz Set:</label>
                <select 
                    id="quiz-set-select"
                    className="quiz-config__quiz-set-dropdown"
                    value={quizSet || (gameMode === 'quiz' ? 'Daily challenge' : 'all') || ''} 
                    onChange={(e) => setQuizSet(e.target.value || null)}
                >
                    {gameMode === 'quiz' ? (
                        <>
                            <option value="Daily challenge">
                                Daily challenge
                            </option>
                            {quizSets.map(set => (
                                <option key={set.name} value={set.name}>
                                    {set.name}
                                </option>
                            ))}
                            <option value="all">All countries</option>
                        </>
                    ) : (gameMode === 'sandbox' ? (
                        <>
                            <option value="all">
                                All countries
                            </option>
                            {quizSets.map(set => (
                                <option key={set.name} value={set.name}>
                                    {set.name}
                                </option>
                            ))}
                        </>
                    ) : (null))}
                
                </select>
            </div>
            <div className="quiz-config__prompt-types">
                {quizSet && quizSet !== 'Daily challenge' && gameMode === 'quiz' &&(
                    <>
                        <label htmlFor="prompt-types-select">Prompt types:</label>
                        {state.config.selectedPromptTypes.length === 0 && (
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
                                        checked={state.config.selectedPromptTypes.includes(type)}
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