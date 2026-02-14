import { getDailySeed, shuffleArray } from '@/utils/RNG.js';

export function checkSubmission(
  promptCountryData,
  submissionType,
  submissionValue,
) {
  let isCorrect = false;
  if (submissionType === 'flag') {
    isCorrect = promptCountryData?.flagCode === submissionValue;
  } else if (submissionType === 'name') {
    isCorrect = promptCountryData?.country === submissionValue;
  } else if (submissionType === 'location') {
    isCorrect = promptCountryData?.code === submissionValue;
  }
  return isCorrect;
}

export function checkPromptCompletion(quizContext) {
  // Status values: 'prompted' | 'incomplete' | 'completed' | 'failed' | null
  return Object.values(quizContext.quiz.prompt.guesses).every(
    (status) =>
      // status.status !== null && status.status !== 'incomplete'
      status.status === 'completed' ||
      status.status === 'failed' ||
      status.status === 'prompted',
  );
}

export function generatePromptType(quizContext) {
  if (
    !quizContext.quizData ||
    quizContext.quiz.prompt.quizDataIndex >= quizContext.quizData.length
  ) {
    console.error('Error generating prompt type');
    console.error(quizContext);
    return null;
  }
  const countryData =
    quizContext.quizData[quizContext.quiz.prompt.quizDataIndex];
  let promptOptions = ['location', 'name', 'flag'];
  let seed;
  // select prompt type by quiz set, fixed for daily challenge and learning mode
  if (
    quizContext.config.gameMode === 'dailyChallenge' ||
    quizContext.config.gameMode === 'learning'
  ) {
    promptOptions = countryData.availablePrompts;
    if (quizContext.config.gameMode === 'dailyChallenge') {
      seed = getDailySeed() + quizContext.quiz.prompt.quizDataIndex * 1000;
    } else {
      seed = Date.now();
    }
  } else {
    promptOptions = countryData.availablePrompts.filter((prompt) =>
      quizContext.config.selectedPromptTypes.includes(prompt),
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
export function derivePromptValue(countryData, promptType) {
  if (!countryData || !promptType) {
    return null;
  }

  switch (promptType) {
    case 'location':
      return {
        code: countryData.code,
        lat: countryData.location.lat,
        long: countryData.location.long,
      };
    case 'name':
      return countryData.country;
    case 'flag':
      return countryData.flagCode;
    default:
      console.error('Error deriving prompt value');
      console.error(countryData, promptType);
      return null;
  }
}

export function checkQuizCompletion(quizContext) {
  // If no country data, quiz can't be finished
  if (!quizContext.quizData?.length) {
    console.error('Error checking quiz completion');
    console.error(quizContext);
    return false;
  }
  return quizContext.quiz.prompt.quizDataIndex >= quizContext.quizData.length;
}
