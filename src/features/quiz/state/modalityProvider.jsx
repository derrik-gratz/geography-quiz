import { createInitialModalityState, modalityReducer } from './modalityState.js';
import { createContext, useContext, useReducer } from 'react';

const ModalityContext = createContext(null);
const ModalityDispatchContext = createContext(null);

export function useModalityState() {
  const context = useContext(ModalityContext);
  if (context == null) {
    throw new Error('useModalityState must be used within ModalityContextProvider');
  }
  return context;
}

export function useModalityStateDispatch() {
  const context = useContext(ModalityDispatchContext);
  if (context == null) {
    throw new Error('useModalityStateDispatch must be used within ModalityDispatchProvider');
  }
  return context;
}

export function ModalityProvider({ children, modalityType }) {
  const [state, dispatch] = useReducer(modalityReducer, modalityType, createInitialModalityState);
  return (
    <ModalityContext.Provider value={state}>
      <ModalityDispatchContext.Provider value={dispatch}>
        {children}
      </ModalityDispatchContext.Provider>
    </ModalityContext.Provider>
  );
}
