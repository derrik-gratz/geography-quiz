function quizEngine(countryData) {
    if (!countryData || countryData.length === 0) {
        return;
    }
    const [promptIndex, setPromptIndex] = useState(0);
    
}

function checkSubmission(submission, currentPrompt){
    if (submission.type === 'flag'){
        return currentPrompt?.flagCode === submission.value;
    } else if (submission.type === 'name'){
        return currentPrompt?.country === submission.value;
    } else if (submission.type === 'map'){
        return currentPrompt?.code === submission.value;
    }
}

function generatePrompt(countryData, userConfig){
    const selectedSet = userConfig.quizSet;
    const seed = (selectedSet.name === 'Daily challenge') ? getDailySeed() : Date.now();
    const selectedPromptType = shuffleArray(countryData.availablePrompts, seed)[0];
    return selectedPromptType;
}