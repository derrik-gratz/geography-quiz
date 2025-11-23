import { filterCountryData, shuffleArray } from './FilterCountryData.js';
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
    // haven't figured out how give ups will be handled. 
    // So far, possible state is null from default, prompted, incorrect, or correct.
    return Object.values(quizContext.currentPromptStatus).every(status => 
        status.status !== null && status.status !== 'incorrect'
    );
}

export function generatePrompt(quizContext){
    if (!quizContext.quizCountryData || quizContext.quizCountryDataIndex >= quizContext.quizCountryData.length) {
        return null;
    }
    const countryData = quizContext.quizCountryData[quizContext.quizCountryDataIndex];
    let promptOptions = ['location', 'name', 'flag'];
    let seed;
    // select prompt type by quiz set, fixed for daily challenge
    if (quizContext.quizSet === 'Daily challenge'){
        promptOptions = countryData.availablePrompts;
        seed = getDailySeed();
    } else {
        promptOptions = countryData.availablePrompts.filter(prompt => quizContext.selectedPromptTypes.includes(prompt));
        seed = Date.now();
    }

    const selectedPromptType = shuffleArray(promptOptions, seed)[0];

    switch (selectedPromptType) {
        case 'location':
            return { type: 'location', value: { code: countryData.code,lat: countryData.location.lat, long: countryData.location.long } };
        case 'name':
            return { type: 'name', value: countryData.country };
        case 'flag':
            return { type: 'flag', value: countryData.flagCode };
    }
}

export function checkQuizCompletion(quizContext){
    return quizContext.promptHistory.length === quizContext.totalCountries;
}