import './App.css';
import React, { useState } from 'react';
import FlagSelector from './components/Flags';
import TextCountryInput from './components/TextCountryInput';
import WorldMap from './components/WorldMap';
import CountryPrompt, { PROMPT_TYPES } from './components/CountryPrompt';
import GuessTable from './components/GuessTable';
import ExportModal from './components/ExportModal';

function App() {
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [promptType, setPromptType] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [showNiceMessage, setShowNiceMessage] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const generatePromptRef = React.useRef(null);
  const clearInputsRef = React.useRef(null);

  // Helper function to clear all inputs
  const clearAllInputs = () => {
    if (clearInputsRef.current) {
      clearInputsRef.current();
    }
  };

  // Handler for opening export modal
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Helper function to record a guess
  const recordGuess = (country, promptType, correct) => {
    // Check if there's already a correct guess for this country and prompt type
    const existingCorrectGuess = guesses.find(guess => 
      guess.country === country.Name && 
      guess.promptType === promptType && 
      guess.correct === true
    );
    
    // If there's already a correct guess for this field, don't add a new one
    if (existingCorrectGuess) {
      console.log(`Already have correct guess for ${country.Name} ${promptType}, ignoring new guess.`);
      return;
    }
    
    const newGuess = {
      country: country.Name,
      countryCode: country.Code,
      promptType: promptType,
      correct: correct,
      timestamp: new Date().toISOString()
    };
    setGuesses(prev => [...prev, newGuess]);
  };

  // Helper function to record a provided field (not guessed)
  const recordProvidedField = (country, promptType) => {
    const newGuess = {
      country: country.Name,
      countryCode: country.Code,
      promptType: promptType,
      correct: null, // null indicates provided field
      timestamp: new Date().toISOString()
    };
    setGuesses(prev => [...prev, newGuess]);
  };

  // Helper function to check if all missing values are correct
  const checkAllCorrect = (country, currentGuess = null) => {
    if (!country) return false;
    
    // Get all guesses for this country
    let countryGuesses = guesses.filter(guess => guess.country === country.Name);
    
    // If we have a current guess, add it to the list for checking
    if (currentGuess) {
      countryGuesses = [...countryGuesses, currentGuess];
    }
    
    // Determine which fields need to be guessed (not provided as prompt)
    const textNeeded = promptType !== PROMPT_TYPES.TEXT;
    const flagNeeded = promptType !== PROMPT_TYPES.FLAG;
    const mapNeeded = promptType !== PROMPT_TYPES.MAP;
    
    // Check if all required fields have correct guesses
    const textCorrect = !textNeeded || countryGuesses.some(guess => guess.promptType === 'text' && guess.correct === true);
    const flagCorrect = !flagNeeded || countryGuesses.some(guess => guess.promptType === 'flag' && guess.correct === true);
    const mapCorrect = !mapNeeded || countryGuesses.some(guess => guess.promptType === 'map' && guess.correct === true);
    
    const allCorrect = textCorrect && flagCorrect && mapCorrect;
    
    console.log('Checking all correct for:', country.Name);
    console.log('Text needed:', textNeeded, 'Text correct:', textCorrect);
    console.log('Flag needed:', flagNeeded, 'Flag correct:', flagCorrect);
    console.log('Map needed:', mapNeeded, 'Map correct:', mapCorrect);
    console.log('All correct:', allCorrect);
    
    return allCorrect;
  };

  const handlePromptGenerated = (country, type) => {
    setCurrentPrompt(country);
    setPromptType(type);
    // Record the provided field so it appears in the table
    if (country && type) {
      recordProvidedField(country, type);
    }
  };

  const handleFlagSelect = (code) => {
    console.log('Selected flag:', code);
    if (currentPrompt && currentPrompt.Code.toLowerCase() === code) {
      setCorrect(prev => prev + 1);
      
      // Create the current guess
      const currentGuess = promptType !== PROMPT_TYPES.FLAG ? {
        country: currentPrompt.Name,
        countryCode: currentPrompt.Code,
        promptType: 'flag',
        correct: true,
        timestamp: new Date().toISOString()
      } : null;
      
      // Only record flag guess if flag wasn't the prompt type
      if (promptType !== PROMPT_TYPES.FLAG) {
        recordGuess(currentPrompt, 'flag', true);
      }
      console.log('Correct! Flag selected matches prompt.');
      
      // Check if all missing values are now correct BEFORE clearing inputs
      if (checkAllCorrect(currentPrompt, currentGuess)) {
        setShowNiceMessage(true);
        setTimeout(() => {
          setShowNiceMessage(false);
          // Clear all inputs and generate new prompt
          clearAllInputs();
          if (generatePromptRef.current) {
            generatePromptRef.current();
          }
        }, 1000);
      }
    } else {
      setIncorrect(prev => prev + 1);
      if (currentPrompt && promptType !== PROMPT_TYPES.FLAG) {
        recordGuess(currentPrompt, 'flag', false);
      }
      console.log('Incorrect flag selected.');
    }
  };

  const handleCountrySelect = (country) => {
    console.log('Selected country:', country);
    if (currentPrompt && currentPrompt.Code === country.Code) {
      setCorrect(prev => prev + 1);
      
      // Create the current guess
      const currentGuess = promptType !== PROMPT_TYPES.TEXT ? {
        country: currentPrompt.Name,
        countryCode: currentPrompt.Code,
        promptType: 'text',
        correct: true,
        timestamp: new Date().toISOString()
      } : null;
      
      // Only record text guess if text wasn't the prompt type
      if (promptType !== PROMPT_TYPES.TEXT) {
        recordGuess(currentPrompt, 'text', true);
      }
      console.log('Correct! Country selected matches prompt.');
      
      // Check if all missing values are now correct BEFORE clearing inputs
      if (checkAllCorrect(currentPrompt, currentGuess)) {
        setShowNiceMessage(true);
        setTimeout(() => {
          setShowNiceMessage(false);
          // Clear all inputs and generate new prompt
          clearAllInputs();
          if (generatePromptRef.current) {
            generatePromptRef.current();
          }
        }, 1000);
      }
    } else {
      setIncorrect(prev => prev + 1);
      if (currentPrompt && promptType !== PROMPT_TYPES.TEXT) {
        recordGuess(currentPrompt, 'text', false);
      }
      console.log('Incorrect country selected.');
    }
  };

  const handleMapCountrySelect = (country) => {
    console.log('Selected country from map:', country);
    if (currentPrompt && currentPrompt.Code === country.Code) {
      setCorrect(prev => prev + 1);
      
      // Create the current guess
      const currentGuess = promptType !== PROMPT_TYPES.MAP ? {
        country: currentPrompt.Name,
        countryCode: currentPrompt.Code,
        promptType: 'map',
        correct: true,
        timestamp: new Date().toISOString()
      } : null;
      
      // Only record map guess if map wasn't the prompt type
      if (promptType !== PROMPT_TYPES.MAP) {
        recordGuess(currentPrompt, 'map', true);
      }
      console.log('Correct! Country selected from map matches prompt.');
      
      // Check if all missing values are now correct BEFORE clearing inputs
      if (checkAllCorrect(currentPrompt, currentGuess)) {
        setShowNiceMessage(true);
        setTimeout(() => {
          setShowNiceMessage(false);
          // Clear all inputs and generate new prompt
          clearAllInputs();
          if (generatePromptRef.current) {
            generatePromptRef.current();
          }
        }, 1000);
      }
    } else {
      setIncorrect(prev => prev + 1);
      if (currentPrompt && promptType !== PROMPT_TYPES.MAP) {
        recordGuess(currentPrompt, 'map', false);
      }
      console.log('Incorrect country selected from map.');
    }
  };

  // Determine which component should highlight the current country based on prompt type
  const shouldHighlightMap = promptType === PROMPT_TYPES.MAP;
  const shouldHighlightFlag = promptType === PROMPT_TYPES.FLAG;
  // Show coordinates all the time to help with navigation
  const shouldShowCoordinates = true;

  return (
    <div className="app">
      <header className="placeholder">Geography Quiz</header>

      <div className="top-bar">
        <CountryPrompt 
          onPromptGenerated={handlePromptGenerated} 
          showNiceMessage={showNiceMessage}
          generatePromptRef={generatePromptRef}
          clearInputsRef={clearInputsRef}
        />
        {/* Guess History Table moved to top */}
        <GuessTable guesses={guesses} currentPromptType={promptType} onExport={handleExport} />
      </div>

      <div className="main-area">
        <div className="map">
          <WorldMap 
            onCountrySelect={handleMapCountrySelect} 
            highlightedCountry={shouldHighlightMap ? currentPrompt : null}
            showCoordinates={shouldShowCoordinates}
            clearInputsRef={clearInputsRef}
            guesses={guesses}
            currentPrompt={currentPrompt}
          />
        </div>
        <div className="sidebar">
          <TextCountryInput 
            onSelect={handleCountrySelect} 
            clearInputsRef={clearInputsRef}
            guesses={guesses}
            currentPrompt={currentPrompt}
          />
          <FlagSelector 
            onSelect={handleFlagSelect} 
            highlightedCountry={shouldHighlightFlag ? currentPrompt : null}
            clearInputsRef={clearInputsRef}
            guesses={guesses}
            currentPrompt={currentPrompt}
          />
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        guesses={guesses}
        currentPromptType={promptType}
      />
    </div>
  );
}

export default App;
