import { checkModalityGuessLimit } from '@/utils/quizEngine';

/**
 * Guess state for a single modality (location, name, or flag).
 * @typedef {Object} ModalityGuessState
 * @property {string|null} status - 'prompted' | 'incomplete' | 'completed' | 'failed' | null
 *   - 'prompted': This type is the active prompt (user must answer)
 *   - 'incomplete': User hasn't answered yet (not the active prompt type)
 *   - 'completed': User answered correctly
 *   - 'failed': User answered incorrectly or gave up
 *   - null: No status yet (initial state)
 * @property {number} n_attempts - Number of attempts for this modality
 * @property {Array<{value: *, isCorrect: boolean}>} attempts - Attempts made for this modality
 */

/**
 * Guesses for the current prompt (all three modalities).
 * @typedef {Object} PromptGuesses
 * @property {ModalityGuessState} location
 * @property {ModalityGuessState} name
 * @property {ModalityGuessState} flag
 */

/**
 * History entry for one completed prompt (country + guess state per modality).
 * @typedef {Object} PromptHistoryEntry
 * @property {number} quizDataIndex - Index into quizData for the country that was quizzed
 * @property {string} countryCode - Country code for the country that was quizzed
 * @property {ModalityGuessState} location
 * @property {ModalityGuessState} name
 * @property {ModalityGuessState} flag
 */

/**
 * Creates the initial quiz state structure.
 *
 * @returns {QuizState} Initial quiz state with all fields set to default values
 */

/**
 * Full quiz state.
 * @typedef {Object} QuizState
 * @property {Object} config - Quiz configuration
 * @property {string|null} config.quizSet - Selected quiz set name (e.g., 'Europe', 'all', or null)
 * @property {string[]} config.selectedPromptTypes - Array of prompt types: 'location', 'name', 'flag'
 * @property {string|null} config.gameMode - Game mode: 'dailyChallenge' | 'quiz' | 'sandbox' | 'learning' | null
 *
 * @property {import('@/types/dataSchemas.js').CountryRecord[]} quizData - Filtered country data for current quiz set
 *
 * @property {Object} quiz - Current quiz state
 * @property {string} quiz.status - Quiz status: 'not_started' | 'active' | 'reviewing' | 'completed'
 * @property {string|null} quiz.reviewType - Review type when status is 'reviewing': 'auto' | 'learning' | 'history' | null
 *   - 'auto': Automatic review after prompt completion (with delays)
 *   - 'learning': Sandbox mode where user clicks inputs to see correct answers
 *   - 'history': User reviewing a past prompt from history
 * @property {number|null} quiz.reviewIndex - Index into quiz.history array when reviewType is 'history', null otherwise
 *
 * @property {Object} quiz.prompt - Current prompt state
 * @property {string|null} quiz.prompt.status - Prompt status: 'in_progress' | 'completed' | 'failed' | null
 * @property {string|null} quiz.prompt.type - Prompt type: 'location' | 'name' | 'flag' | null
 * @property {number} quiz.prompt.quizDataIndex - Index into quizData for current/selected country
 * @property {PromptGuesses} quiz.prompt.guesses - User guesses for current prompt
 *
 * @property {PromptHistoryEntry[]} quiz.history - Array of completed prompts
 */
export function createInitialQuizState() {
  return {
    config: {
      quizSet: null,
      selectedPromptTypes: ['location', 'name', 'flag'],
      gameMode: null,
    },
    quizData: [],
    quiz: {
      status: 'not_started',
      reviewType: null,
      reviewIndex: null,
      prompt: {
        status: null,
        type: null,
        quizDataIndex: 0,
        guesses: {
          location: { status: null, n_attempts: 0, attempts: [] },
          name: { status: null, n_attempts: 0, attempts: [] },
          flag: { status: null, n_attempts: 0, attempts: [] },
        },
      },
      history: [],
    },
  };
}

export function quizReducer(state, action) {
  const PROMPT_TYPES = ['location', 'name', 'flag'];
  switch (action.type) {
    case 'SET_QUIZ_SET':
      return {
        ...state,
        config: {
          ...state.config,
          quizSet: action.payload,
        },
      };
    case 'SET_GAME_MODE':
      return {
        ...state,
        config: {
          ...state.config,
          gameMode: action.payload,
        },
      };
    case 'SET_SELECTED_PROMPT_TYPES':
      return {
        ...state,
        config: {
          ...state.config,
          selectedPromptTypes: action.payload,
        },
      };
    case 'SET_QUIZ_DATA':
      return {
        ...state,
        quizData: action.payload,
        quiz: {
          ...state.quiz,
          prompt: {
            ...state.quiz.prompt,
            quizDataIndex: 0,
          },
        },
      };
    case 'PROMPT_GENERATED':
      const { promptType } = action.payload;
      return {
        ...state,
        quiz: {
          ...state.quiz,
          status: 'active',
          reviewType: null,
          reviewIndex: null,
          prompt: {
            status: 'in_progress',
            type: promptType,
            quizDataIndex: state.quiz.prompt.quizDataIndex,
            guesses: {
              location: {
                status: promptType === 'location' ? 'prompted' : 'incomplete',
                n_attempts: 0,
                attempts: [],
              },
              name: {
                status: promptType === 'name' ? 'prompted' : 'incomplete',
                n_attempts: 0,
                attempts: [],
              },
              flag: {
                status: promptType === 'flag' ? 'prompted' : 'incomplete',
                n_attempts: 0,
                attempts: [],
              },
            },
          },
        },
      };

    case 'START_QUIZ':
      return {
        ...state,
        quiz: {
          ...state.quiz,
          status: 'active',
          reviewType: null,
          reviewIndex: null,
        },
      };

    case 'ANSWER_SUBMITTED':
      const { type, value, isCorrect } = action.payload;
      const newNAttempts = state.quiz.prompt.guesses[type].n_attempts + 1;
      const newAttempts = [...state.quiz.prompt.guesses[type].attempts, value];

      let newStatus = isCorrect ? 'completed' :
      checkModalityGuessLimit(
        state.config.gameMode, 
        newAttempts
      ) ? 'failed' : 'incomplete';
      console.log('newStatus', newStatus);
      return {
        ...state,
        quiz: {
          ...state.quiz,
          prompt: {
            ...state.quiz.prompt,
            guesses: {
              ...state.quiz.prompt.guesses,
              [type]: {
                ...state.quiz.prompt.guesses[type],
                status: newStatus,
                n_attempts: newNAttempts,
                attempts: newAttempts,
              },
            },
          },
        },
      };
    case 'GIVE_UP': {
      const guesses = state.quiz.prompt.guesses;
      const updatedGuesses = {};
      PROMPT_TYPES.forEach((type) => {
        const currentStatus = guesses[type].status;
        const finalStatus =
          currentStatus === 'incomplete' || currentStatus === null
            ? 'failed'
            : currentStatus;
        updatedGuesses[type] = {
          ...guesses[type],
          status: finalStatus,
        };
      });

      return {
        ...state,
        quiz: {
          ...state.quiz,
          prompt: {
            ...state.quiz.prompt,
            guesses: updatedGuesses,
          },
        },
      };
    }

    case 'PROMPT_FINISHED':
      const guesses = state.quiz.prompt.guesses;
      const statusEntries = {};
      PROMPT_TYPES.forEach((type) => {
        statusEntries[type] = {
          status: guesses[type].status ?? 'failed',
          n_attempts: guesses[type].n_attempts,
          attempts: guesses[type].attempts,
        };
      });

      const currentCountry = state.quizData[state.quiz.prompt.quizDataIndex];
      if (!currentCountry) {
        console.error('Cannot finish prompt: invalid country index');
        return state;
      }

      const newHistoryEntry = {
        quizDataIndex: state.quiz.prompt.quizDataIndex,
        countryCode: currentCountry.code,
        ...statusEntries,
      };

      return {
        ...state,
        quiz: {
          ...state.quiz,
          status: 'reviewing',
          reviewType: 'auto',
          reviewIndex: state.quiz.history.length,
          prompt: {
            status: null,
            type: null,
            quizDataIndex: state.quiz.prompt.quizDataIndex + 1,
            guesses: {
              location: { status: null, n_attempts: 0, attempts: [] },
              name: { status: null, n_attempts: 0, attempts: [] },
              flag: { status: null, n_attempts: 0, attempts: [] },
            },
          },
          history: [...state.quiz.history, newHistoryEntry],
        },
      };
    case 'REVIEW_COMPLETED':
      return {
        ...state,
        quiz: {
          ...state.quiz,
          status: 'active',
          reviewType: null,
          reviewIndex: null,
        },
      };
    case 'MANUAL_REVIEW_INITIATED':
      return {
        ...state,
        quiz: {
          ...state.quiz,
          status: 'reviewing',
          reviewType: 'history',
          reviewIndex: action.payload,
        },
      };

    case 'QUIZ_COMPLETED':
      return {
        ...state,
        quiz: {
          ...state.quiz,
          status: 'completed',
          reviewType: null,
          reviewIndex: null,
          prompt: {
            status: null,
            type: null,
            quizDataIndex: 0,
            guesses: {
              location: { status: null, n_attempts: 0, attempts: [] },
              name: { status: null, n_attempts: 0, attempts: [] },
              flag: { status: null, n_attempts: 0, attempts: [] },
            },
          },
        },
      };

    case 'RESET_QUIZ':
      return createInitialQuizState();
    case 'SANDBOX_SELECT':
      const { inputType, countryValue } = action.payload;
      let selectedCountry = null;
      if (inputType === 'location') {
        selectedCountry = state.quizData.find((c) => c.code === countryValue);
      } else if (inputType === 'name') {
        selectedCountry = state.quizData.find(
          (c) => c.country === countryValue,
        );
      } else if (inputType === 'flag') {
        selectedCountry = state.quizData.find(
          (c) => c.flagCode === countryValue,
        );
      }
      if (selectedCountry) {
        return {
          ...state,
          quiz: {
            ...state.quiz,
            prompt: {
              ...state.quiz.prompt,
              quizDataIndex: state.quizData.indexOf(selectedCountry),
            },
          },
        };
      }
      return state; // Return unchanged state if not found
    default:
      return state;
  }
}
