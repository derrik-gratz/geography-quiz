import React from 'react';

/**
 * QuizLog Component
 * 
 * Displays a scrollable table showing quiz progress with attempts per country
 * Shows last 2-3 countries by default, can scroll to see full history
 * 
 * @param {Array} props.promptHistory - Array of completed prompts
 * @param {Object} props.attempts - Current question attempts { map: number, text: number, flag: number }
 * @param {Object} props.answers - Current question answers { map?: code, text?: code, flag?: code }
 * @param {Object} props.currentPrompt - Current active prompt
 * @param {Array} props.requiredAnswerTypes - Types user must answer for current question
 * @param {boolean} props.isComplete - Whether current question is complete
 * @param {number} props.totalCountries - Total countries in quiz set
 * @returns {JSX.Element} Quiz log table interface
 */
export function QuizLog({ 
    promptHistory, 
    attempts, 
    answers, 
    currentPrompt, 
    requiredAnswerTypes = [], 
    isComplete = false,
    totalCountries 
}) {
    // Create log entries for history
    // Treat all but the last history item as completed; the last one is the current prompt
    const historyEntries = promptHistory.map((prompt, index) => {
        const isLast = index === promptHistory.length - 1;
        return {
            country: prompt.countryData?.country || prompt.countryCode,
            promptType: prompt.promptType,
            status: isLast ? 'in_progress' : 'completed',
            completionStatus: prompt.completionStatus || 'unknown',
            attempts: prompt.finalAttempts || { map: 0, text: 0, flag: 0 },
            answers: prompt.finalAnswers || {}
        };
    });

    // Current question entry
    const currentEntry = currentPrompt ? {
        country: currentPrompt.countryData?.country || currentPrompt.countryCode,
        promptType: currentPrompt.promptType,
        status: isComplete ? 'completed' : 'in_progress',
        attempts,
        answers,
        requiredTypes: requiredAnswerTypes
    } : null;

    // Combine entries without duplicating current prompt
    let allEntries = historyEntries;
    if (currentEntry) {
        const lastIsSame = promptHistory.length > 0 &&
            (promptHistory[promptHistory.length - 1]?.countryCode === currentPrompt.countryCode);
        if (lastIsSame) {
            // Replace the last history row with the current live row
            allEntries = [
                ...historyEntries.slice(0, Math.max(0, historyEntries.length - 1)),
                currentEntry
            ];
        } else {
            allEntries = [...historyEntries, currentEntry];
        }
    }

    const getStatusIcon = (entry) => {
        if (entry.status === 'completed') {
            return '✅';
        } else if (entry.status === 'in_progress') {
            return '🔄';
        }
        return '⏳';
    };

    const getAnswerStatus = (entry, type) => {
        // Map prompt types to answer keys
        const typeToKey = {
            'location': 'map',
            'name': 'text', 
            'flag': 'flag'
        };
        
        if (type === entry.promptType) {
            return '📋';
        }
        if (entry.status === 'completed') {
            // Show different indicators based on completion status
            if (entry.completionStatus === 'correct') {
                return '✓';
            } else if (entry.completionStatus === 'incorrect') {
                return '✗';
            }
            return '?';
        }
        
        const answerKey = typeToKey[type];
        if (entry.answers && entry.answers[answerKey]) {
            return '✓';
        }
        
        if (entry.requiredTypes && entry.requiredTypes.includes(type)) {
            return '?';
        }
        
        return '-';
    };

    const getAttemptsDisplay = (entry, type) => {
        if (entry.status === 'completed') {
            return entry.attempts?.[type] || '-';
        }
        
        return entry.attempts?.[type] || '-';
    };

    return (
        <div className="quiz-log">
            <div className="quiz-log-header">
                <h3>Quiz Progress</h3>
                <div className="progress-summary">
                    {Math.max(0, promptHistory.length - 1 + (isComplete ? 1 : 0))} / {totalCountries} completed
                </div>
            </div>
            
            <div className="quiz-log-table-container">
                <table className="quiz-log-table">
                    <thead>
                        <tr>
                            <th>Country</th>
                            {/* <th>Prompt</th> */}
                            {/* <th>Status</th> */}
                            <th>Map</th>
                            <th>Name</th>
                            <th>Flag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allEntries.reverse().map((entry, index) => (
                            <tr key={index} className={`log-entry ${entry.status} ${entry.completionStatus || ''}`}>
                                <td className="country-name">
                                    {entry.status === 'in_progress' ? "?" : entry.country}
                                </td>
                                {/* <td className="prompt-type">
                                    {entry.promptType}
                                </td> */}
                                {/* <td className="status">
                                    {getStatusIcon(entry)}
                                </td> */}
                                <td className="answer-cell">
                                    <span className="answer-status">
                                        {getAnswerStatus(entry, 'location')}
                                    </span>
                                    <span className="attempts">
                                        ({getAttemptsDisplay(entry, 'map')})
                                    </span>
                                </td>
                                <td className="answer-cell">
                                    <span className="answer-status">
                                        {getAnswerStatus(entry, 'name')}
                                    </span>
                                    <span className="attempts">
                                        ({getAttemptsDisplay(entry, 'text')})
                                    </span>
                                </td>
                                <td className="answer-cell">
                                    <span className="answer-status">
                                        {getAnswerStatus(entry, 'flag')}
                                    </span>
                                    <span className="attempts">
                                        ({getAttemptsDisplay(entry, 'flag')})
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {allEntries.length === 0 && (
                <div className="no-entries">
                    <p>No quiz questions yet. Click "Generate Prompt" to start!</p>
                </div>
            )}
        </div>
    );
}
