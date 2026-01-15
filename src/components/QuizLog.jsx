import React, { useState, useMemo } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useCollapsible } from '../hooks/useCollapsible.js';

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
    // promptHistory, 
    // attempts, 
    // answers, 
    // currentPrompt, 
    // requiredAnswerTypes = [], 
    // isComplete = false,
    // totalCountries,
    // isQuizFinished = false,
    // quizSetName = 'Geography Quiz'
}) {
    const { state } = useQuiz();
    const [exportSuccess, setExportSuccess] = useState(false);
    const [obscureNames, setObscureNames] = useState(true);
    const defaultCollapsed = useMemo(() => state.quiz.status === 'not_started', [state.quiz.status]);
    const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);

    const promptScore = (entry) => {
        const types = ['location', 'name', 'flag'];
        const completedCount = types.filter(type => entry[type]?.status === 'completed').length;
        return completedCount / 2;
    }
    
    // Always call useMemo - handle 'not_started' case inside
    const logEntries = useMemo(() => {
        // Return empty array if quiz hasn't started
        if (state.quiz.status === 'not_started') {
            return [];
        }
        // console.log(state.quiz.history);
        // console.log(state.quiz.prompt.guesses);
        const parseGuesses = (guesses) => {
            return {
                location: guesses.location.status === 'prompted' ? '-' :
                    guesses.location.status === 'incomplete' ? '?/' + guesses.location.attempts.length :
                    guesses.location.status === 'failed' ? '✗/' + guesses.location.attempts.length :
                    guesses.location.status === 'completed' ? '✓/' + guesses.location.attempts.length : '?',
                name: guesses.name.status === 'prompted' ? '-' :
                    guesses.name.status === 'incomplete' ? '?/' + guesses.name.attempts.length :
                    guesses.name.status === 'failed' ? '✗/' + guesses.name.attempts.length :
                    guesses.name.status === 'completed' ? '✓/' + guesses.name.attempts.length : '?',
                flag: guesses.flag.status === 'prompted' ? '-' :
                    guesses.flag.status === 'incomplete' ? '?/' + guesses.flag.attempts.length :
                    guesses.flag.status === 'failed' ? '✗/' + guesses.flag.attempts.length :
                    guesses.flag.status === 'completed' ? '✓/' + guesses.flag.attempts.length : '?'
            }
        }
        const pastPrompts = state.quiz.history.map((entry) => {
            const correctCountry = state.quizData[entry.quizDataIndex]?.country || '?';
            const score = promptScore(entry);
            const guesses = parseGuesses(entry);
            return { correctCountry, score, guesses };
        });
        if (state.quiz.status === 'active') {
            const currentPrompt = {
                correctCountry: '?',
                score: promptScore(state.quiz.prompt.guesses),
                guesses: parseGuesses(state.quiz.prompt.guesses),
            };
            return [ ...pastPrompts, currentPrompt ];
        }
        return pastPrompts;
    }, [state.quiz.history, state.quiz.status, state.quiz.prompt, state.quizData]);

    // Don't show quiz log if quiz hasn't started
    if (state.quiz.status === 'not_started') {
        return null;
    }

    const exportResults = () => {
        let exportText = `\`\`\`${state.config.quizSet} Results\n`;
        const score = logEntries.reduce((sum, entry) => {
            return sum + entry.score;
        }, 0);
        exportText += `Score: ${score} / ${state.quizData.length} countries`;
        if (state.config.quizSet === 'Daily Challenge') {
            const skillScore = logEntries.reduce((sum, entry) => {
                if (entry.guesses.flag.status === 'completed') {
                    sum += 5 - entry.guesses.flag.attempts.length;
                } else if (entry.guesses.name.status === 'completed') {
                    sum += 5 - entry.guesses.name.attempts.length;
                } else if (entry.guesses.location.status === 'completed') {
                    sum += 5 - entry.guesses.location.attempts.length;
                }
                return sum;
            }, 0);
            exportText += `\t(${skillScore}/50)\n\n`;
        } else {
            exportText += `\n\n`;
        }
        
        const entries = logEntries.slice(); //.reverse();

        const pad = (str, width) => String(str).padEnd(width, ' ');
        const countryCol = Math.max(
            'Country'.length,
            ...entries.map(e => (obscureNames ? String(entries.length).length : e.correctCountry.length))
        );
        const mapCol = Math.max('Map'.length, ...entries.map(e => e.guesses.location.length));
        const nameCol = Math.max('Name'.length, ...entries.map(e => e.guesses.name.length));
        const flagCol = Math.max('Flag'.length, ...entries.map(e => e.guesses.flag.length));
        
        // exportText += `| Country | Map | Name | Flag |\n`;
        // exportText += `|---------|-----|------|------|\n`;
        exportText += `| ${pad('Country', countryCol)} | ${pad('Map', mapCol)} | ${pad('Name', nameCol)} | ${pad('Flag', flagCol)} |\n`;
        exportText += `|${'-'.repeat(countryCol + 2)}|${'-'.repeat(mapCol + 2)}|${'-'.repeat(nameCol + 2)}|${'-'.repeat(flagCol + 2)}|\n`;
        
        entries.forEach((entry, index) => {
            const countryDisplay = obscureNames ? `${index + 1}` : entry.correctCountry;
            exportText += `| ${pad(countryDisplay, countryCol)} | ${pad(entry.guesses.location, mapCol)} | ${pad(entry.guesses.name, nameCol)} | ${pad(entry.guesses.flag, flagCol)} |\n`;
        });
        // logEntries.slice().reverse().forEach((entry, index) => {
        //     const countryDisplay = obscureNames ? `${index + 1}` : entry.correctCountry;
        //     exportText += `| ${countryDisplay} | ${entry.guesses.location} | ${entry.guesses.name} | ${entry.guesses.flag} |\n`;
        // });
        exportText += `\`\`\``;
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
        <div className={`quiz-log component-panel ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="component-panel__title-container">
                <button 
                    className="component-panel__toggle-button" 
                    onClick={toggleCollapsed}
                    aria-label={isCollapsed ? 'Expand Quiz Progress' : 'Collapse Quiz Progress'}
                >
                    {isCollapsed ? '▶ Quiz Progress' : '▼ Quiz Progress'}
                </button>
            </div>
            <div className="component-panel__content">
            {state.quiz.status === 'completed' && (
                <div className="quiz-log-export" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '4px', marginLeft: '10px' }}>
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
                        className="quiz-log__export-btn"
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
                            {logEntries.slice().reverse().map((entry, index) => (
                                <tr key={index} className="log-entry">
                                    <td className="country-name">
                                        {entry.correctCountry}
                                    </td>
                                    <td className="answer-cell">
                                        {entry.guesses.location}
                                    </td>
                                    <td className="answer-cell">
                                        {entry.guesses.name}
                                    </td>
                                    <td className="answer-cell">
                                        {entry.guesses.flag}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
