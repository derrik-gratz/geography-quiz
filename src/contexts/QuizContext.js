export function createInitialQuizState() {
    return {
      quizSet: null,
      selectedPromptTypes: ['location', 'name', 'flag'],
      quizCountryData: [],
      quizCountryDataIndex: 0,
      totalCountries: 0,
      currentPrompt: null,
      currentPromptStatus: {
        location: { status: null, n_attempts: 0, attempts: [] },
        name: { status: null, n_attempts: 0, attempts: [] },
        flag: { status: null, n_attempts: 0, attempts: [] }
      },
      promptHistory: [],
      isQuizFinished: false
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
                totalCountries: action.payload.length,
                quizCountryDataIndex: 0 
            };
        case 'PROMPT_GENERATED':
            // type and country
            const { prompt } = action.payload;
            return { ...state,
                currentPrompt: prompt,
                currentPromptStatus: { 
                    location: { status: prompt.type === 'location' ? 'prompted' : null, n_attempts: 0, attempts: [] },
                    name: { status: prompt.type === 'name' ? 'prompted' : null, n_attempts: 0, attempts: [] }, 
                    flag: { status: prompt.type === 'flag' ? 'prompted' : null, n_attempts: 0, attempts: [] } 
                },
            };
        case 'ANSWER_SUBMITTED':
            // type, value, and isCorrect
            const { answer } = action.payload;
            return { ...state,
                currentPromptStatus: {
                    ...state.currentPromptStatus,
                    [answer.type]: { 
                        ...state.currentPromptStatus[answer.type],
                        status: answer.isCorrect ? 'correct' : 'incorrect',
                        n_attempts: state.currentPromptStatus[answer.type].n_attempts + 1,
                        attempts: [...state.currentPromptStatus[answer.type].attempts, { value: answer.value, isCorrect: answer.isCorrect }] 
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
            
            return { ...state,
                quizCountryDataIndex: state.quizCountryDataIndex + 1,
                promptHistory: [
                    ...state.promptHistory,
                    {
                        country: state.quizCountryData[state.quizCountryDataIndex].country,
                        ...statusEntries
                    }
                ]
            };
        case 'QUIZ_COMPLETED':
            return { ...state,
                isQuizFinished: true
            };
        case 'RESET_QUIZ':
            return createInitialQuizState();
        default:
            return state;
    }
  }