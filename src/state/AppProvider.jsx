import { createContext, useReducer, useEffect, useContext, useMemo, useCallback } from "react";
import { getDailySeed } from "@/utils/RNG.js";
import { getUserMetadata, loadAllUserData } from "@/services/storageService.js";
import { initStorage } from "@/services/storageService.js";
import { dailyChallengeCompletedToday } from "@/utils/statsService.js";
import { getCountriesDueForReview } from "@/utils/spacedRepetitionEngine.js";

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
    userData: null,
    userDataLoading: true,
};

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialAppState, (init) => ({
        ...init,
        dailySeed: getDailySeed(),
      }));

    // Async loading of userID and userData
    // Requires initStorage to be successful with local storage
    useEffect(() => {
      async function init() {
        try {
          await initStorage();
        } catch (err) {
          console.error('Failed to initialize storage:', err);
          dispatch({ type: 'SET_USER_DATA_LOADING', payload: false });
          return;
        }
        try {
          const metadata = await getUserMetadata();
          dispatch({ type: 'SET_USER_ID', payload: metadata.localUserId });
        } catch (err) {
          console.error('Failed to get user metadata:', err);
        }
        try {
          const userData = await loadAllUserData();
          dispatch({ type: 'SET_USER_DATA', payload: userData });
        } catch (err) {
          console.error('Failed to load user data:', err);
        }
        dispatch({ type: 'SET_USER_DATA_LOADING', payload: false });
      }
      init();
    }, []);

    const refetchUserData = useCallback(async () => {
      dispatch({ type: 'SET_USER_DATA_LOADING', payload: true });
      try {
        const userData = await loadAllUserData();
        dispatch({ type: 'SET_USER_DATA', payload: userData });
      } catch (err) {
        console.error('Failed to refetch user data:', err);
      }
      dispatch({ type: 'SET_USER_DATA_LOADING', payload: false });
    }, []);

    const dailyChallengeCompleted = useMemo(() => {
      if (!state.userData) return false;
      return dailyChallengeCompletedToday(state.userData);
    }, [state.userData]);

    const learningModeCountriesDue = useMemo(() => {
      if (!state.userData) return [];
      return getCountriesDueForReview(state.userData);
    }, [state.userData]);

    const appState = useMemo(() => ({
      ...state,
      dailyChallengeCompleted,
      learningModeCountriesDue,
      refetchUserData,
    }), [state, dailyChallengeCompleted, learningModeCountriesDue, refetchUserData]);

    return (
        <AppContext.Provider value={appState}>
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
        case 'SET_USER_DATA': {
            return { ...state, userData: action.payload };
        }
        case 'SET_USER_DATA_LOADING': {
            return { ...state, userDataLoading: action.payload };
        }
        default: {
            console.error('Unknown action type:', action.type);
            return state;
        }
    }
}
