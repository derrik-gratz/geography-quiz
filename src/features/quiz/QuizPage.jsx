import React from 'react';
import { QuizConfig } from './components/QuizConfig.jsx';
import { QuizPrompt } from './components/QuizPrompt.jsx';
import { QuizLogMobile, QuizLogDesktop } from './components/QuizLogDisplay.jsx';
import { QuizTextInput } from './components/TextInput.jsx';
import { QuizFlagSelect } from './components/FlagSelect.jsx';
import { QuizWorldMap } from './components/WorldMap.jsx';
import { QuizProvider } from './state/quizProvider.jsx';
import { ModalityProvider } from './state/modalityProvider.jsx';
import './QuizPage.css';
// import Accordion from '@mui/material/Accordion';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * QuizPage component
 * Main quiz interface with configuration, prompt, input methods, and log
 */
export function QuizPage() {
  return (
    <QuizProvider>
      <main className="app-main">
        <div className="left-column">
          <div className="quiz-page__config">
            <QuizConfig />
          </div>
          <div className="quiz-page__prompt">
            <QuizPrompt />
          </div>
          <div className="quiz-page__log">
            <QuizLogDesktop />
            </div>
        </div>
        <div className="right-column">
            <ModalityProvider modalityType="name">
              <QuizTextInput />
            </ModalityProvider>
            <ModalityProvider modalityType="flag">
              <QuizFlagSelect />
            </ModalityProvider>
            <ModalityProvider modalityType="location">
              <QuizWorldMap />
            </ModalityProvider>
        </div>
      </main>
      <QuizLogMobile />
    </QuizProvider>
  );
}
