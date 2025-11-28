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
    // haven't figured out how give ups will be handled. 
    // So far, possible state is null from default, prompted, incorrect, or correct.
    return Object.values(quizContext.quiz.prompt.guesses).every(status => 
        status.status !== null && status.status !== 'incomplete'
    );
}

export function generatePrompt(quizContext){
    // Use new nested state structure
    if (!quizContext.quizData || quizContext.quiz.prompt.quizDataIndex >= quizContext.quizData.length) {
        return null;
    }
    const countryData = quizContext.quizData[quizContext.quiz.prompt.quizDataIndex];
    let promptOptions = ['location', 'name', 'flag'];
    let seed;
    // select prompt type by quiz set, fixed for daily challenge
    if (quizContext.config.quizSet === 'Daily challenge'){
        promptOptions = countryData.availablePrompts;
        seed = getDailySeed();
    } else {
        promptOptions = countryData.availablePrompts.filter(prompt => 
            quizContext.config.selectedPromptTypes.includes(prompt)
        );
        seed = Date.now();
    }

    const selectedPromptType = shuffleArray(promptOptions, seed)[0];

    switch (selectedPromptType) {
        case 'location':
            return { type: 'location', value: { code: countryData.code, lat: countryData.location.lat, long: countryData.location.long } };
        case 'name':
            return { type: 'name', value: countryData.country };
        case 'flag':
            return { type: 'flag', value: countryData.flagCode };
    }
}

export function checkQuizCompletion(quizContext){
    // If no country data, quiz can't be finished
    if (!quizContext.quizData?.length) {
        return false;
    }
    return quizContext.quiz.prompt.quizDataIndex >= quizContext.quizData.length;
}