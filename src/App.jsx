import './App.css';
import React, { useState } from 'react';
import Score from './components/Score';
import FlagSelector from './components/Flags';
import TextCountryInput from './components/TextCountryInput';
import WorldMap from './components/WorldMap';
import CountryPrompt, { PROMPT_TYPES } from './components/CountryPrompt';

function App() {
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [promptType, setPromptType] = useState(null);

  const handlePromptGenerated = (country, type) => {
    setCurrentPrompt(country);
    setPromptType(type);
  };

  const handleFlagSelect = (code) => {
    console.log('Selected flag:', code);
    if (currentPrompt && currentPrompt.Code.toLowerCase() === code) {
      setCorrect(prev => prev + 1);
      console.log('Correct! Flag selected matches prompt.');
    } else {
      setIncorrect(prev => prev + 1);
      console.log('Incorrect flag selected.');
    }
  };

  const handleCountrySelect = (country) => {
    console.log('Selected country:', country);
    if (currentPrompt && currentPrompt.Code === country.Code) {
      setCorrect(prev => prev + 1);
      console.log('Correct! Country selected matches prompt.');
    } else {
      setIncorrect(prev => prev + 1);
      console.log('Incorrect country selected.');
    }
  };

  const handleMapCountrySelect = (country) => {
    console.log('Selected country from map:', country);
    if (currentPrompt && currentPrompt.Code === country.Code) {
      setCorrect(prev => prev + 1);
      console.log('Correct! Country selected from map matches prompt.');
    } else {
      setIncorrect(prev => prev + 1);
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
        <CountryPrompt onPromptGenerated={handlePromptGenerated} />
        <Score correct={correct} incorrect={incorrect} />
      </div>

      <div className="main-area">
        <div className="map">
          <WorldMap 
            onCountrySelect={handleMapCountrySelect} 
            highlightedCountry={shouldHighlightMap ? currentPrompt : null}
            showCoordinates={shouldShowCoordinates}
          />
        </div>
        <div className="sidebar">
          <FlagSelector 
            onSelect={handleFlagSelect} 
            highlightedCountry={shouldHighlightFlag ? currentPrompt : null}
          />
          <TextCountryInput onSelect={handleCountrySelect} />
        </div>
      </div>
    </div>
  );
}

export default App;
