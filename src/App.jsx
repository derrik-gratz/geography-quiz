import './App.css';
import React, { useState } from 'react';
import Score from './components/Score';
import FlagSelector from './components/Flags';
import TextCountryInput from './components/TextCountryInput';
import WorldMap from './components/WorldMap';

function App() {
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);

  const handleFlagSelect = (code) => {
    console.log('Selected flag:', code);
  };

  const handleCountrySelect = (country) => {
    console.log('Selected country:', country);
  };

  const handleMapCountrySelect = (country) => {
    console.log('Selected country from map:', country);
  };

  return (
    <div className="app">
      <header className="placeholder">Geography Quiz</header>

      <div className="top-bar">
        <div className="placeholder">Prompt Type Selector</div>
        <Score correct={correct} incorrect={incorrect} />
      </div>

      <div className="main-area">
        <div className="map">
          <WorldMap onCountrySelect={handleMapCountrySelect} />
        </div>
        <div className="sidebar">
          <FlagSelector onSelect={handleFlagSelect} />
          <TextCountryInput onSelect={handleCountrySelect} />
        </div>
      </div>
    </div>
  );
}

export default App;
