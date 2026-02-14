import { createContext, useReducer, useEffect, useContext } from "react";
import { getDailySeed } from "@/utils/RNG.js";
import { getUserMetadata } from "@/utils/storageService.js";
import { initStorage } from "@/utils/storageService.js";

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

export function useApp() {
    const context = useContext(AppContext);
    if (context == null) {
      throw new Error('useApp must be used within AppProvider');
    }
    return context;
  }
  
export function useAppDispatch() {
    const context = useContext(AppDispatchContext);
    if (context == null) {
      throw new Error('useAppDispatch must be used within AppProvider');
    }
    return context;
}


const initialAppState = {
    currentPage: 'quiz',
    userID: null,
    dailySeed: null,
};

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialAppState, (init) => ({
        ...init,
        dailySeed: getDailySeed(),
      }));

    // Async loading of userID, will probably be replaced with oauth login eventually
    // userID requires initStorage to be successful with local storage
    useEffect(() => {
      async function init() {
        try {
          await initStorage();
        } catch (err) {
          console.error('Failed to initialize storage:', err);
          return; // optional: don't load user metadata if storage failed
        }
        try {
          const metadata = await getUserMetadata();
          dispatch({ type: 'SET_USER_ID', payload: metadata.localUserId });
        } catch (err) {
          console.error('Failed to get user metadata:', err);
        }
      }
      init();
    }, []);

    return (
        <AppContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppContext.Provider>
    );
}

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_CURRENT_PAGE': {
            return { ...state, currentPage: action.payload };
        }
        case 'SET_USER_ID': {
            return { ...state, userID: action.payload };
        }
        case 'SET_DAILY_SEED': {
            return { ...state, dailySeed: action.payload };
        }
        default: {
            console.error('Unknown action type:', action.type);
            return state;
        }
    }
}
