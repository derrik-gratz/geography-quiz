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
            return { ...state,
                quizCountryDataIndex: state.quizCountryDataIndex + 1,
                promptHistory: [
                    ...state.quizCountryData[state.quizCountryDataIndex].country,    
                    ...Object.values(state.currentPromptStatus).map(status => ({
                        ...status,
                        // If they didn't make an attempt the status was null
                        status: status.status? status.status : 'incorrect',
                        n_attempts: status.n_attempts,
                        attempts: status.attempts
                    }))
                ]
            };
        case 'QUIZ_COMPLETED':
            return { ...state,
                isQuizFinished: true
            };
        case 'RESET_QUIZ':
            return structuredClone(createInitialQuizState());
        default:
            return state;
    }
  }