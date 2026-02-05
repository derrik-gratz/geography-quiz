import React, { useMemo, useState, useEffect } from 'react';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useQuizActions } from '../../hooks/useQuizActions.js';
import { calcTimeDelta, formatTimeDelta } from 'react-countdown';

import { derivePromptValue } from '../../services/quizEngine.js';
import { CollapsibleContainer } from '../base/CollapsibleContainer.jsx';
import { loadAllUserData } from '../../services/storageService.js';
import { dailyChallengeCompletedToday } from '../../services/statsService.js';
import { getCountriesDueForReview } from '../../services/spacedRepetitionEngine.js';
import './QuizPrompt.css';
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
    const { state, promptCompleted, isQuizFinished, currentPromptData } = useQuiz();
    const { startQuiz, giveUpPrompt, resetQuiz } = useQuizActions();
    const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
    const [checkingDailyChallenge, setCheckingDailyChallenge] = useState(false);
    const [learningModeHasCountries, setLearningModeHasCountries] = useState(true);
    const [checkingLearningMode, setCheckingLearningMode] = useState(false);
    // Expand when quiz not started, collapse otherwise
    const defaultCollapsed = false; //state.quiz.status !== 'not_started';

    // Check if daily challenge is already completed
    useEffect(() => {
        if (state.config.gameMode === 'dailyChallenge' && state.quiz.status === 'not_started') {
            setCheckingDailyChallenge(true);
            loadAllUserData()
                .then(userData => {
                    const completed = dailyChallengeCompletedToday(userData);
                    setDailyChallengeCompleted(completed);
                })
                .catch(error => {
                    console.error('Failed to check daily challenge status:', error);
                    setDailyChallengeCompleted(false);
                })
                .finally(() => {
                    setCheckingDailyChallenge(false);
                });
        } else {
            setDailyChallengeCompleted(false);
        }
    }, [state.config.gameMode, state.quiz.status]);

    useEffect(() => {
        if (state.config.gameMode === 'learning' && state.quiz.status === 'not_started') {
            setCheckingLearningMode(true);
            loadAllUserData()
                .then(userData => {
                    // Check if there are countries due for review
                    
                    const dueCountries = getCountriesDueForReview(userData);
                    setLearningModeHasCountries(dueCountries.length > 0);
                })
                .catch(error => {
                    console.error('Failed to check learning mode countries:', error);
                    setLearningModeHasCountries(false);
                })
                .finally(() => {
                    setCheckingLearningMode(false);
                });
        } else {
            setLearningModeHasCountries(true);
        }
    }, [state.config.gameMode, state.quiz.status]);

    // Reset give up state when prompt changes
    // useEffect(() => {
    //     setHasGivenUp(false);
    // }, [currentPrompt?.countryCode]);

    // const handleGiveUp = () => {
    //     setHasGivenUp(true);
        
    //     // Notify parent component about give up
    //     if (onGiveUp) {
    //         onGiveUp(currentPrompt);
    //     }
        
    //     // Auto-generate next prompt after delay
    //     setTimeout(() => {
    //         generatePrompt();
    //     }, 4000);
    // };
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

    const isStartDisabled = useMemo(() => {
        if (state.config.gameMode === 'sandbox') {
            return false;
        }
        if (state.config.gameMode === 'dailyChallenge' && dailyChallengeCompleted) {
            return true;
        }
        if (state.config.gameMode === 'learning' && !learningModeHasCountries) {
            return true;
        }
        return state.quiz.status === 'not_started' && 
               (!state.config.quizSet || !state.config.selectedPromptTypes || state.config.selectedPromptTypes.length === 0);
    }, [state.quiz.status, state.config.quizSet, state.config.selectedPromptTypes, state.config.gameMode, dailyChallengeCompleted, learningModeHasCountries]);   

    const successfulCompletion = useMemo(() => 
        Object.values(state.quiz.prompt.guesses).every(
            guess => guess.status === 'prompted' || guess.status === 'completed'
        ),
        [state.quiz.prompt.guesses]
    );
    
    // Reconstruct prompt object from state for display
    const currentPrompt = useMemo(() => {
        if (!state.quiz.prompt.type || !currentPromptData) {
            return null;
        }
        const promptValue = derivePromptValue(currentPromptData, state.quiz.prompt.type);
        if (!promptValue) {
            return null;
        }
        return {
            type: state.quiz.prompt.type,
            value: promptValue
        };
    }, [state.quiz.prompt.type, currentPromptData]);


    const displayPrompt = (prompt) => {
        switch (prompt.type) {
            case 'location':
                return <span className="prompt-location">{formatLatitude(prompt.value.lat)}, {formatLongitude(prompt.value.long)}</span>;
            case 'name':
                return <span className="prompt-name">{prompt.value}</span>;
            case 'flag':
                return <span className={`prompt-flag fi fi-${prompt.value.toLowerCase()}`}></span>;
        }
    }

    const getTimeUntilNextDay = () => {
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
        tomorrow.setHours(0, 0, 0, 0);
        return formatTimeDelta(calcTimeDelta(tomorrow, new Date()));
    }

    const promptContent = useMemo(() => {
        let promptText = '';
        if (state.config.gameMode === 'sandbox') {
            promptText = 'Click any input to explore country data';
        } else if (state.config.gameMode === 'dailyChallenge' && dailyChallengeCompleted) {
            const timeUntilNextDay = getTimeUntilNextDay();
            return (
                <span className="prompt-content__generic-text">
                    You completed today's daily challenge!<br />
                    Next challenge in {timeUntilNextDay.hours}h:{timeUntilNextDay.minutes}m.
                </span>
            );
            // promptText = `You have already completed today\'s daily challenge!<br />Next challenge in ${timeUntilNextDay.hours}h:${timeUntilNextDay.minutes}m.`;
        } else if (state.quiz.status === 'not_started' && isStartDisabled) {
            promptText = 'Configure quiz settings';
        } else if (state.quiz.status === 'not_started' && !isStartDisabled) {
            promptText = 'Start quiz';
        } else if (state.quiz.status === 'active' && promptCompleted) {
            if (successfulCompletion) {
                promptText = 'Prompt complete';
            } else {
                promptText = 'Prompt incorrect';
            }
        } else if (state.quiz.status === 'active' && !promptCompleted) {
            if (currentPrompt) {
                return displayPrompt(currentPrompt);
            } else {
                promptText = 'Unknown prompt state';
            }
        } else if (state.quiz.status === 'reviewing') {
            // Review mode - show appropriate content based on reviewType
            if (state.quiz.reviewType === 'auto' && currentPrompt) {
                return displayPrompt(currentPrompt);
            } else if (state.quiz.reviewType === 'history' && state.quiz.reviewIndex !== null) {
                const historyEntry = state.quiz.history[state.quiz.reviewIndex];
                if (historyEntry && currentPromptData) {
                    return <span className="prompt-name">{currentPromptData.country}</span>;
                }
                promptText = 'Reviewing past prompt';
            } else if (state.quiz.reviewType === 'learning' && currentPromptData) {
                return <span className="prompt-name">{currentPromptData.country}</span>;
            } else {
                promptText = 'Review mode';
            }
        } else if (state.config.gameMode === 'learning' && !learningModeHasCountries) {
            promptText = 'No countries due for review';
        } else if (state.quiz.status === 'completed') {
            promptText = 'Quiz Finished!';
        } else {
            promptText = 'Unknown prompt state';
        }
        return <span className="prompt-content__generic-text">{promptText}</span>;
    }, [state.config.gameMode, state.quiz.status, state.quiz.reviewType, state.quiz.reviewIndex, state.quiz.history, currentPrompt, currentPromptData, isStartDisabled, promptCompleted, successfulCompletion]);

    const promptButton = useMemo(() => {
        if (state.config.gameMode === 'sandbox') {
            return null;
        }
        if (state.quiz.status === 'not_started') {
            if (state.config.gameMode === 'dailyChallenge' && dailyChallengeCompleted) {
                return null;
            } else {
                return (
                    <button 
                        className="quiz-prompt__start-quiz-button" 
                        onClick={startQuiz}
                        disabled={isStartDisabled || checkingDailyChallenge}
                    >
                        {'Start quiz'}
                    </button>
                );
            }
        } else if (state.quiz.status === 'active') {
            return (
                <button 
                    className="quiz-prompt__give-up-button" 
                    onClick={giveUpPrompt}
                    disabled={promptCompleted}
                >
                    Give up
                </button>
            );
        } else if (state.quiz.status === 'completed') {
            return (
                <button 
                    className="quiz-config__reset-quiz-button" 
                    onClick={resetQuiz}
                >
                    Reset quiz
                </button>
            );
        }
        // Review mode - no button shown
        return null;
    }, [state.quiz.status, state.config.gameMode, promptCompleted, isStartDisabled, dailyChallengeCompleted, checkingDailyChallenge, startQuiz, giveUpPrompt, resetQuiz]);


    return (
        <CollapsibleContainer defaultCollapsed={defaultCollapsed} title="Quiz Prompt" content={
            <div className="quiz-prompt">
                <div className="quiz-prompt__content">
                    {promptContent}
                </div>
                <div className="quiz-prompt__button">
                    {promptButton}
                </div>
            </div>
        }/>
    );
}
