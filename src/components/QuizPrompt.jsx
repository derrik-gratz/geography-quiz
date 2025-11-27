import React, { useMemo } from 'react'; // useState, useEffect,
import { useQuiz } from '../hooks/useQuiz';
import { useQuizActions } from '../hooks/useQuizActions';

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
    const { state, promptCompleted, isQuizFinished } = useQuiz();
    const { startQuiz, giveUpPrompt, resetQuiz } = useQuizActions();

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
        return state.quizStatus === 'not_started' && 
               (!state.quizSet || !state.selectedPromptTypes || state.selectedPromptTypes.length === 0);
    }, [state.quizStatus, state.quizSet, state.selectedPromptTypes]);   

    const successfulCompletion = useMemo(() => 
        Object.values(state.currentPromptStatus).every(
            input_type => input_type.status === 'prompted' || input_type.status === 'correct'
        ),
        [state.currentPromptStatus]
    );


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

    const promptContent = useMemo(() => {
        let promptText = '';
        if (state.quizStatus === 'not_started' && isStartDisabled) {
            promptText = 'Configure quiz settings';
        } else if (state.quizStatus === 'not_started' && !isStartDisabled) {
            promptText = 'Start quiz';
        } else if (state.quizStatus === 'in_progress' && promptCompleted) {
            if (successfulCompletion) {
                promptText = 'Prompt complete';
            } else {
                promptText = 'Prompt incorrect';
            }
        } else if (state.quizStatus === 'in_progress' && !promptCompleted) {
            if (state.currentPrompt) {
                promptText = displayPrompt(state.currentPrompt);
                return promptText;
            } else {
                promptText = 'Unknown prompt state';
            }
        } else if (state.quizStatus === 'completed') {
            promptText = 'Quiz Finished!';
        } else {
            promptText = 'Unknown prompt state';
        }
        return <span className="prompt-content__generic-text">{promptText}</span>;
    }, [state.quizStatus, state.currentPrompt, isStartDisabled, promptCompleted, successfulCompletion]);

    const promptButton = useMemo(() => {
        if (state.quizStatus === 'not_started') {
            return (
                <button 
                    className="quiz-prompt__start-quiz-button" 
                    onClick={startQuiz}
                    disabled={isStartDisabled}
                >
                    Start quiz
                </button>
            );
        } else if (state.quizStatus === 'in_progress') {
            return (
                <button 
                    className="quiz-prompt__give-up-button" 
                    onClick={giveUpPrompt}
                    disabled={promptCompleted}
                >
                    Give up
                </button>
            );
        } else if (state.quizStatus === 'completed') {
            return (
                <button 
                    className="quiz-config__reset-quiz-button" 
                    onClick={resetQuiz}
                >
                    Reset quiz
                </button>
            );
        }
        return null;
    }, [state.quizStatus, promptCompleted, isStartDisabled, startQuiz, giveUpPrompt, resetQuiz]);


    return (
        <div className="quiz-prompt">
            <div className="quiz-prompt__content">
                {promptContent}
            </div>
            <div className="quiz-prompt__button">
                {promptButton}
            </div>
        </div>
    );
}
