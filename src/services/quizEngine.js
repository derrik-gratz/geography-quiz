
function checkSubmission(currentPrompt, submissionType, submissionValue){
    let isCorrect = false;
    if (submissionType === 'flag'){
        isCorrect = currentPrompt?.flagCode === submissionValue;
    } else if (submissionType === 'name'){
        isCorrect = currentPrompt?.country === submissionValue;
    } else if (submissionType === 'location'){
        isCorrect = currentPrompt?.code === submissionValue;
    }
    return { type: submissionType, value: submissionValue, isCorrect: isCorrect };
}

function checkPromptCompletion(quizContext){
    Object.values(quizContext.currentPromptStatus).forEach(status => {
        if (status.status === null || status.status === 'incorrect'){
            return false;
        } 
    });
    return true;
}

function generatePrompt(countryData, userConfig){
    const selectedSet = userConfig.quizSet;
    const seed = (selectedSet.name === 'Daily challenge') ? getDailySeed() : Date.now();
    const selectedPromptType = shuffleArray(countryData.availablePrompts, seed)[0];
    const prompt = selectedPromptType === 'location' ? countryData.location : selectedPromptType === 'name' ? countryData.country : countryData.flagCode;
    return { type: selectedPromptType, value: prompt };
}

function checkQuizCompletion(quizContext){
    return quizContext.quizHistory.length === quizContext.totalCountries;
}