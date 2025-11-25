export function createInitialQuizState() {
    return {
      quizSet: null,
      selectedPromptTypes: ['location', 'name', 'flag'],
      quizCountryData: [],
      quizCountryDataIndex: 0,
    //   totalCountries: 0,
      currentPrompt: null,
      currentPromptStatus: {
        location: { status: null, n_attempts: 0, attempts: [] },
        name: { status: null, n_attempts: 0, attempts: [] },
        flag: { status: null, n_attempts: 0, attempts: [] }
      },
      promptHistory: [],
      quizStatus: 'not_started'
    };
  }

export function quizReducer(state, action){
    switch(action.type){
        case 'SET_QUIZ_SET':
            return { ...state, quizSet: action.payload };
        case 'SET_SELECTED_PROMPT_TYPES':
            return { ...state, selectedPromptTypes: action.payload };
        case 'SET_QUIZ_DATA':
            return { ...state,
                quizCountryData: action.payload,
                // totalCountries: action.payload.length,
                quizCountryDataIndex: 0 
            };
        case 'PROMPT_GENERATED':
            const { prompt } = action.payload;
            return { ...state,
                currentPrompt: prompt,
                currentPromptStatus: { 
                    location: { status: prompt.type === 'location' ? 'prompted' : null, n_attempts: 0, attempts: [] },
                    name: { status: prompt.type === 'name' ? 'prompted' : null, n_attempts: 0, attempts: [] }, 
                    flag: { status: prompt.type === 'flag' ? 'prompted' : null, n_attempts: 0, attempts: [] } 
                },
            };
        case 'START_QUIZ':
            return { ...state,
                quizStatus: 'in_progress'
            };
        case 'ANSWER_SUBMITTED':
            // type, value, and isCorrect
            const { type, value, isCorrect } = action.payload;
            return { ...state,
                currentPromptStatus: {
                    ...state.currentPromptStatus,
                    [type]: { 
                        ...state.currentPromptStatus[type],
                        status: isCorrect ? 'correct' : 'incorrect',
                        n_attempts: state.currentPromptStatus[type].n_attempts + 1,
                        attempts: [...state.currentPromptStatus[type].attempts, { value, isCorrect }] 
                    }
                },
            };
        case 'PROMPT_FINISHED':
            const status = state.currentPromptStatus;
            const promptTypes = ['location', 'name', 'flag'];
            const statusEntries = {};
            promptTypes.forEach(type => {
                statusEntries[type] = {
                    status: status[type].status ?? 'incorrect',
                    n_attempts: status[type].n_attempts,
                    attempts: status[type].attempts
                };
            });
            
            const newIndex = state.quizCountryDataIndex + 1;
            const currentCountry = state.quizCountryData[state.quizCountryDataIndex];
            if (!currentCountry) {
                console.error('Cannot finish prompt: invalid country index');
                return state; // Return unchanged state
            }
            const newPromptHistory = [
                ...state.promptHistory,
                {
                    country: currentCountry.country,
                    ...statusEntries
                }
            ];
            
            
            return {
                ...state,
                quizCountryDataIndex: newIndex,
                promptHistory: newPromptHistory,
                currentPrompt: null,
                currentPromptStatus: {
                    location: { status: null, n_attempts: 0, attempts: [] },
                    name: { status: null, n_attempts: 0, attempts: [] },
                    flag: { status: null, n_attempts: 0, attempts: [] }
                },
            };
        case 'QUIZ_COMPLETED':
            return { ...state,
                quizStatus: 'completed'
            };
        case 'RESET_QUIZ':
            return createInitialQuizState();
        default:
            return state;
    }
  }