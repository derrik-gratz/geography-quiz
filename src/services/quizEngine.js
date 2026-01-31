import { filterCountryData, shuffleArray } from './filterCountryData.js';
import { getDailySeed } from './dailyRNG.js';

export function checkSubmission(promptCountryData, submissionType, submissionValue){
    let isCorrect = false;
    if (submissionType === 'flag'){
        isCorrect = promptCountryData?.flagCode === submissionValue;
    } else if (submissionType === 'name'){
        isCorrect = promptCountryData?.country === submissionValue;
    } else if (submissionType === 'location'){
        isCorrect = promptCountryData?.code === submissionValue;
    }
    return isCorrect;
}

export function checkPromptCompletion(quizContext){
    // Check if all guesses have a status that indicates completion
    // Status values: 'prompted' | 'incomplete' | 'completed' | 'failed' | null
    // A prompt is complete when all guesses are not null and not 'incomplete'
    return Object.values(quizContext.quiz.prompt.guesses).every(status => 
        status.status !== null && status.status !== 'incomplete'
    );
}

export function generatePromptType(quizContext){
    // Use new nested state structure
    if (!quizContext.quizData || quizContext.quiz.prompt.quizDataIndex >= quizContext.quizData.length) {
        return null;
    }
    const countryData = quizContext.quizData[quizContext.quiz.prompt.quizDataIndex];
    let promptOptions = ['location', 'name', 'flag'];
    let seed;
    // select prompt type by quiz set, fixed for daily challenge and learning mode
    if (quizContext.config.gameMode === 'dailyChallenge' || quizContext.config.gameMode === 'learning'){
        promptOptions = countryData.availablePrompts;
        if (quizContext.config.gameMode === 'dailyChallenge') {
            seed = getDailySeed() + quizContext.quiz.prompt.quizDataIndex * 1000;
        } else {
            seed = Date.now();
        }
    } else {
        promptOptions = countryData.availablePrompts.filter(prompt => 
            quizContext.config.selectedPromptTypes.includes(prompt)
        );
        seed = Date.now();
    }

    if (promptOptions.length === 0) {
        return null;
    }

    const selectedPromptType = shuffleArray(promptOptions, seed)[0];
    return selectedPromptType;
}

/**
 * Derives the prompt value from country data and prompt type.
 * 
 * @param {Object} countryData - Country data object
 * @param {string} promptType - Prompt type: 'location' | 'name' | 'flag'
 * @returns {Object|null} Prompt value object or null if invalid
 */
export function derivePromptValue(countryData, promptType){
    if (!countryData || !promptType) {
        return null;
    }
    
    switch (promptType) {
        case 'location':
            return { code: countryData.code, lat: countryData.location.lat, long: countryData.location.long };
        case 'name':
            return countryData.country;
        case 'flag':
            return countryData.flagCode;
        default:
            return null;
    }
}

export function checkQuizCompletion(quizContext){
    // If no country data, quiz can't be finished
    if (!quizContext.quizData?.length) {
        return false;
    }
    return quizContext.quiz.prompt.quizDataIndex >= quizContext.quizData.length;
}