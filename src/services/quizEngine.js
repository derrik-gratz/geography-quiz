import { filterCountryData, shuffleArray } from './filterCountryData';
import { getDailySeed } from './dailyRNG';

export function checkSubmission(promptCountryData, submissionType, submissionValue){
    let isCorrect = false;
    if (submissionType === 'flag'){
        isCorrect = promptCountryData?.flagCode === submissionValue;
    } else if (submissionType === 'name'){
        isCorrect = promptCountryData?.country === submissionValue;
    } else if (submissionType === 'location'){
        isCorrect = promptCountryData?.code === submissionValue;
    }
    return { type: submissionType, value: submissionValue, isCorrect: isCorrect };
}

export function checkPromptCompletion(quizContext){
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
            return { type: 'location', value: countryData.location };
        case 'name':
            return { type: 'name', value: countryData.country };
        case 'flag':
            return { type: 'flag', value: countryData.flagCode };
    }
}

export function checkQuizCompletion(quizContext){
    return quizContext.promptHistory.length === quizContext.totalCountries;
}