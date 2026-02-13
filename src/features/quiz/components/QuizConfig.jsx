import React from 'react';
import { useQuiz, useQuizDispatch, useQuizThunks } from '../state/quizProvider.jsx';
import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
import quizSets from '@/data/quiz_sets.json';
import './QuizConfig.css';

const PROMPT_TYPES = ['location', 'name', 'flag'];

export function QuizConfig() {
  const state = useQuiz();
  const dispatch = useQuizDispatch();
  const { switchGameMode } = useQuizThunks();
  const defaultCollapsed = state.quiz.status !== 'not_started';

  const { quizSet, selectedPromptTypes, gameMode } = state.config;


  const handlePromptTypeChange = (type, checked) => {
    const next = checked
      ? [...state.config.selectedPromptTypes, type]
      : state.config.selectedPromptTypes.filter((t) => t !== type);
    dispatch({ type: 'SET_SELECTED_PROMPT_TYPES', payload: next });
  };

  const handleQuizSetChange = (quizSet) => {
    dispatch({ type: 'SET_QUIZ_SET', payload: quizSet });
  };

  const handleGameModeChange = (gameMode) => {
    switchGameMode(gameMode);
  };

  const gameModeOptions = [
    { value: 'dailyChallenge', label: 'Daily Challenge' },
    { value: 'learning', label: 'Learning' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'sandbox', label: 'Sandbox' },
  ];

  return (
    <CollapsibleContainer
      defaultCollapsed={defaultCollapsed}
      title="Quiz Configuration"
      content={
        <div className="quiz-config">
          {state.quiz.status === 'not_started' ? (
            <>
              <div className="quiz-config__game-mode-select">
                <label htmlFor="game-mode">Game mode:</label>
                {gameModeOptions.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="game-mode"
                      className="quiz-config__game-mode-input"
                      value={option.value}
                      disabled={state.quiz.status !== 'not_started'}
                      checked={gameMode === option.value}
                      onChange={(e) => handleGameModeChange(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {gameMode !== 'dailyChallenge' && gameMode !== 'learning' && (
                <div className="quiz-config__quiz-set-select">
                  <label htmlFor="quiz-set-select">Quiz Set:</label>
                  <select
                    id="quiz-set-select"
                    className="quiz-config__quiz-set-dropdown"
                    value={
                      quizSet || (gameMode === 'quiz' ? 'all' : 'all') || ''
                    }
                    onChange={(e) => handleQuizSetChange(e.target.value || null)}
                  >
                    {gameMode === 'quiz' ? (
                      <>
                        {quizSets.map((set) => (
                          <option key={set.name} value={set.name}>
                            {set.name}
                          </option>
                        ))}
                        <option value="all">All countries</option>
                      </>
                    ) : gameMode === 'sandbox' ? (
                      <>
                        <option value="all">All countries</option>
                        {quizSets.map((set) => (
                          <option key={set.name} value={set.name}>
                            {set.name}
                          </option>
                        ))}
                      </>
                    ) : null}
                  </select>
                </div>
              )}
              <div className="quiz-config__prompt-types-select">
                {gameMode === 'quiz' && (
                  <>
                    <label htmlFor="prompt-types-select">Prompt types:</label>
                    <div className="quiz-config__prompt-types-select-content">
                      {state.config.selectedPromptTypes.length === 0 && (
                        <div className="quiz-config__warning">
                          <p className="quiz-config__warning-text">
                            Select at least one prompt type.
                          </p>
                        </div>
                      )}
                      <div className="quiz-config__prompt-types-checkbox">
                        {PROMPT_TYPES.map((type) => (
                          <label
                            key={type}
                            className="quiz-config__prompt-types-checkbox-label"
                          >
                            <input
                              type="checkbox"
                              className="quiz-config__prompt-types-checkbox-input"
                              checked={state.config.selectedPromptTypes.includes(
                                type,
                              )}
                              onChange={(e) => {
                                handlePromptTypeChange(type, e.target.checked);
                              }}
                            />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <p>Quiz in progress</p>
          )}
        </div>
      }
    />
  );
}
