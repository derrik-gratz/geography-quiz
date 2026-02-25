import { shuffleArray } from '@/utils/RNG.js';

/**
 * Returns the value of a modality for a country
 * @param {Object} countryData - country data
 * @param {string} modality - 'name' | 'flag' | 'location'
 * @returns {string|null} - the value of the modality
 */
export function countryModalityValue(countryData, modality) {
  const correctField =
    modality === 'name'
      ? 'country'
      : modality === 'flag'
        ? 'flagCode'
        : modality === 'location'
          ? 'code'
          : null;
  return countryData?.[correctField] ?? null;
}

/**
 * Checks if user's submitted answer matches prompt data for that modality
 * @param {CountryRecord} promptCountryData - The country data for the prompt
 * @param {string} submissionType - The type of submission: 'flag' | 'name' | 'location'
 * @param {string} submissionValue - The value of the submission
 * @returns {boolean} True if the submission is correct
 */

export function checkSubmission(
  promptCountryData,
  submissionType,
  submissionValue,
) {
  const correctValue = countryModalityValue(promptCountryData, submissionType);
  return correctValue === submissionValue;
}

/**
 * Checks if the guess limit has been reached for a modality.
 * @param {string} gameMode - The game mode: 'dailyChallenge' | 'learning' | 'quiz' | 'sandbox'
 * @param {Object} modalityGuesses - The guesses for the modality
 * @returns {boolean} True if the guess limit has been reached, false otherwise
 */
export function checkModalityGuessLimit(gameMode, modalityGuesses) {
  const currentAttempts = modalityGuesses?.n_attempts || 0;
  const currentStatus = modalityGuesses?.status;
  if (gameMode === 'dailyChallenge') {
    if (currentAttempts >= 5 && currentStatus === 'incomplete') {
      return true;
    }
  } else if (gameMode === 'learning') {
    if (currentAttempts >= 1 && currentStatus === 'incomplete') {
      return true;
    }
  }
  return false;
}

/**
 * Returns true when every modality (location, name, flag) has a terminal status (completed, failed, or prompted).
 * @param {import('@/features/quiz/state/quizContext.js').PromptGuesses} guesses
 * @returns {boolean}
 */
export function checkPromptCompletion(guesses) {
  return Object.values(guesses).every(
    (modalityGuess) =>
      modalityGuess.status === 'completed' ||
      modalityGuess.status === 'failed' ||
      modalityGuess.status === 'prompted',
  );
}

/**
 * Picks a single prompt type (location, name, or flag) for the current country.
 * Caller must pass a valid country and a deterministic seed for reproducible results (e.g. daily challenge).
 *
 * @param {import('@/types/dataSchemas.js').CountryRecord|null|undefined} countryData - Country at current prompt index
 * @param {string} gameMode - 'dailyChallenge' | 'learning' | 'quiz' | 'sandbox'
 * @param {string[]} selectedPromptTypes - Prompt types enabled for quiz mode
 * @param {number} seed - Seed for shuffle (e.g. getDailySeed() + index*1000 for dailyChallenge, Date.now() otherwise)
 * @returns {string|null} - 'location' | 'name' | 'flag' or null if invalid/empty options
 */
export function generatePromptType(
  countryData,
  gameMode,
  selectedPromptTypes,
  seed,
) {
  if (!countryData?.availablePrompts?.length) {
    return null;
  }

  const promptOptions =
    gameMode === 'dailyChallenge' || gameMode === 'learning'
      ? [...countryData.availablePrompts]
      : countryData.availablePrompts.filter((prompt) =>
          selectedPromptTypes.includes(prompt),
        );

  if (promptOptions.length === 0) {
    return null;
  }

  return shuffleArray(promptOptions, seed)[0];
}

/**
 * Derives the prompt value from country data and prompt type.
 * Different than countryModalityValue as this is the displayed value, not the value
 * used to check for correctness.
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

/**
 * Returns true when the current prompt index has reached or passed the end of the quiz data.
 * @param {import('@/types/dataSchemas.js').CountryRecord[]} quizData - Filtered country list for the quiz
 * @param {number} promptQuizDataIndex - Index into quizData for the current/next prompt
 * @returns {boolean}
 */
export function checkQuizCompletion(quizData, promptQuizDataIndex) {
  if (!quizData?.length) {
    return false;
  }
  return promptQuizDataIndex >= quizData.length;
}
