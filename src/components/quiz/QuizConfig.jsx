import React from 'react';
import { useQuiz } from '@/hooks/useQuiz';
import { useQuizActions } from '@/hooks/useQuizActions';
import { CollapsibleContainer } from '@/components/base/CollapsibleContainer.jsx';
import quizSets from '@/data/quiz_sets.json';
import './QuizConfig.css';

const PROMPT_TYPES = ['location', 'name', 'flag'];

export function QuizConfig() {
  const { state } = useQuiz();
  const { setQuizSet, handlePromptTypeChange, setGameMode } = useQuizActions();
  // Expand when quiz not started, collapse otherwise
  const defaultCollapsed = state.quiz.status !== 'not_started';

  const { quizSet, selectedPromptTypes, gameMode } = state.config;

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
                <label>
                  <input
                    type="radio"
                    name="game-mode"
                    className="quiz-config__game-mode-input"
                    value="dailyChallenge"
                    disabled={state.quiz.status !== 'not_started'}
                    checked={gameMode === 'dailyChallenge'}
                    onChange={(e) => setGameMode('dailyChallenge')}
                  />
                  Daily Challenge
                </label>
                <label>
                  <input
                    type="radio"
                    name="game-mode"
                    className="quiz-config__game-mode-input"
                    value="learning"
                    disabled={state.quiz.status !== 'not_started'}
                    checked={gameMode === 'learning'}
                    onChange={(e) => setGameMode('learning')}
                  />
                  Learning
                </label>
                <label>
                  <input
                    type="radio"
                    name="game-mode"
                    className="quiz-config__game-mode-input"
                    value="quiz"
                    disabled={state.quiz.status !== 'not_started'}
                    checked={gameMode === 'quiz'}
                    onChange={(e) => setGameMode('quiz')}
                  />
                  Normal
                </label>
                <label>
                  <input
                    type="radio"
                    name="game-mode"
                    className="quiz-config__game-mode-input"
                    value="sandbox"
                    disabled={state.quiz.status !== 'not_started'}
                    checked={gameMode === 'sandbox'}
                    onChange={(e) => setGameMode('sandbox')}
                  />
                  Sandbox
                </label>
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
                    onChange={(e) => setQuizSet(e.target.value || null)}
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
