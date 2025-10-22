import React, { useState } from 'react';

/**
 * QuizLog Component
 * 
 * Displays a scrollable table showing quiz progress with attempts per country
 * 
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
    totalCountries,
    isQuizFinished = false,
    quizSetName = 'Geography Quiz'
}) {
    const [exportSuccess, setExportSuccess] = useState(false);
    const [obscureNames, setObscureNames] = useState(false);
    // Create log entries for history
    // Treat all but the last history item as completed; the last one is the current prompt
    // If quiz is finished, all items should be completed
    const historyEntries = promptHistory.map((prompt, index) => {
        const isLast = index === promptHistory.length - 1;
        return {
            country: prompt.countryData?.country || prompt.countryCode,
            promptType: prompt.promptType,
            status: (isLast && !isQuizFinished) ? 'in_progress' : 'completed',
            completionStatus: prompt.completionStatus || 'unknown',
            answerCompletionStatus: prompt.answerCompletionStatus || { map: 'unanswered', text: 'unanswered', flag: 'unanswered' },
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
            // Use per-type completion status instead of overall completion status
            const answerKey = typeToKey[type];
            const typeStatus = entry.answerCompletionStatus?.[answerKey];
            
            if (typeStatus === 'correct') {
                return '✓';
            } else if (typeStatus === 'incorrect') {
                return '✗';
            } else if (typeStatus === 'unanswered') {
                // If the prompt is completed but a category is unanswered, treat it as incorrect
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

    // Export function to create simplified text format of results
    const exportResults = () => {
        const completedEntries = allEntries.filter(entry => entry.status === 'completed');
        
        let exportText = `${quizSetName} Results\n`;
        // Count countries where at least 2 out of 3 categories were answered correctly
        const correctCountries = completedEntries.filter(entry => {
            const answerCompletionStatus = entry.answerCompletionStatus || { map: 'unanswered', text: 'unanswered', flag: 'unanswered' };
            const correctCount = Object.values(answerCompletionStatus).filter(status => status === 'correct').length;
            return correctCount >= 2;
        }).length;
        
        
        exportText += `Correct: ${correctCountries} / ${totalCountries} countries\n\n`;
        
        exportText += `| Country | Map | Name | Flag |\n`;
        exportText += `|---------|-----|------|------|\n`;
        
        completedEntries.forEach((entry, index) => {
            const mapStatus = getAnswerStatus(entry, 'location');
            const nameStatus = getAnswerStatus(entry, 'name');
            const flagStatus = getAnswerStatus(entry, 'flag');
            
            const mapAttempts = getAttemptsDisplay(entry, 'map');
            const nameAttempts = getAttemptsDisplay(entry, 'text');
            const flagAttempts = getAttemptsDisplay(entry, 'flag');
            
            // Use index number if obscuring names, otherwise use country name
            const countryDisplay = obscureNames ? `${index + 1}` : entry.country;
            
            exportText += `| ${countryDisplay} | ${mapStatus}(${mapAttempts}) | ${nameStatus}(${nameAttempts}) | ${flagStatus}(${flagAttempts}) |\n`;
        });
        
        return exportText;
    };

    // Copy results to clipboard
    const copyResultsToClipboard = async () => {
        try {
            const resultsText = exportResults();
            await navigator.clipboard.writeText(resultsText);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 1000); // Hide success message after 3 seconds
            return true;
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            return false;
        }
    };


    return (
        <div className="quiz-log">
            <div className="quiz-log-header">
                <h3>Quiz Progress</h3>
                <div className="progress-summary">
                    {isQuizFinished 
                        ? `${promptHistory.length} / ${totalCountries} completed`
                        : `${Math.max(0, promptHistory.length - 1 + (isComplete ? 1 : 0))} / ${totalCountries} completed`
                    }
                </div>
                {isQuizFinished && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginLeft: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={obscureNames}
                                onChange={(e) => setObscureNames(e.target.checked)}
                                style={{ margin: 0 }}
                            />
                           Hide country names
                        </label>
                        <button 
                            onClick={copyResultsToClipboard}
                            className="export-results-btn"
                            style={{
                                backgroundColor: exportSuccess ? '#28a745' : '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {exportSuccess ? '✓ Copied!' : 'Export Results'}
                        </button>
                    </div>
                )}
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
