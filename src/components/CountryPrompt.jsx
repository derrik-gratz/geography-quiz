import React, { useState, useEffect } from 'react';
import countries from '../data/countries.json';
import countryCoordinates from '../data/countryCoordinates.json';

// Define the available prompt types - coordinates are for helping locate countries on map
// Human prompt: "Now have the prompt just say 'find' with either the country name or the flag icon, and if it's a country, highlight the country on the map in green"
// Human prompt: "the option to prompt for map locations got removed. Add a checkbox option to prompt locations."
// Human prompt: "Can we add a ruler to the map with arbitrary coordinates (or better yet, latitude longitudes)? Then we can use the coordinates in the prompt box to help the user know where to look on the map"
// Human prompt: "the prompt wont be for coordinates, but for a location on a map. The coordinates are just to help the user find the highlighted country on the map in case it's small."
const PROMPT_TYPES = {
  TEXT: 'text',
  MAP: 'map',
  FLAG: 'flag'
};

function CountryPrompt({ onPromptGenerated, showNiceMessage = false, generatePromptRef }) {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [promptType, setPromptType] = useState(PROMPT_TYPES.TEXT);
  
  // Track which prompt types are enabled via checkboxes
  // Human prompt: "Let the user select the prompt type checkboxes for either name, flag, or map"
  const [enabledTypes, setEnabledTypes] = useState({
    [PROMPT_TYPES.TEXT]: true,
    [PROMPT_TYPES.MAP]: true,
    [PROMPT_TYPES.FLAG]: true
  });

  // Generate a random country and prompt type
  const generateRandomCountry = () => {
    // Only select from enabled prompt types (checked checkboxes)
    const enabledTypeKeys = Object.keys(enabledTypes).filter(type => enabledTypes[type]);
    
    if (enabledTypeKeys.length === 0) {
      // Fallback: if no types are enabled, default to text
      setPromptType(PROMPT_TYPES.TEXT);
      const randomIndex = Math.floor(Math.random() * countries.length);
      const country = countries[randomIndex];
      setCurrentCountry(country);
      if (onPromptGenerated) {
        onPromptGenerated(country, PROMPT_TYPES.TEXT);
      }
      return;
    }
    
    // Randomly select from enabled prompt types
    const randomType = enabledTypeKeys[Math.floor(Math.random() * enabledTypeKeys.length)];
    setPromptType(randomType);
    
    // Filter countries based on the selected prompt type
    let availableCountries = countries;
    if (randomType === PROMPT_TYPES.MAP) {
      // For map prompts, only use countries with coordinate data
      availableCountries = countries.filter(country => 
        countryCoordinates[country.Code]
      );
    }
    
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const country = availableCountries[randomIndex];
    setCurrentCountry(country);
    
    if (onPromptGenerated) {
      onPromptGenerated(country, randomType);
    }
  };

  // Set the generate function in the ref so parent can call it
  React.useEffect(() => {
    if (generatePromptRef) {
      generatePromptRef.current = generateRandomCountry;
    }
  }, [enabledTypes, promptType, generatePromptRef]);

  // Handle checkbox toggles for prompt types
  const handleTypeToggle = (type) => {
    const newEnabledTypes = {
      ...enabledTypes,
      [type]: !enabledTypes[type]
    };
    setEnabledTypes(newEnabledTypes);
    
    // If current prompt type is being disabled, generate new prompt immediately
    if (enabledTypes[type] && !newEnabledTypes[type] && promptType === type) {
      generateRandomCountry();
    }
  };

  // Don't auto-generate initial prompt - let user click "New Prompt" to start

  // Render the prompt content based on type (text name, map location, or flag icon)
  // Human prompt: "Now have the prompt just say 'find' with either the country name or the flag icon"
  // Human prompt: "no the coordinates should just be displayed as text where it says 'find'"
  const renderPromptContent = () => {
    if (showNiceMessage) {
      return <span style={{ color: '#4CAF50', fontSize: '2rem', fontWeight: 'bold' }}>Nice!</span>;
    }
    
    if (!currentCountry) {
      return <span style={{ color: '#666', fontStyle: 'italic' }}>Click "New Prompt" to start</span>;
    }
    
    if (promptType === PROMPT_TYPES.FLAG) {
      // For flag prompts: show "Find:" with the actual flag icon
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <span>Find:</span>
          <span 
            className={`fi fi-${currentCountry.Code.toLowerCase()}`}
            style={{
              fontSize: '2rem',
              border: '2px solid #333',
              borderRadius: '4px',
              padding: '0.2rem'
            }}
          />
        </div>
      );
    } else if (promptType === PROMPT_TYPES.MAP) {
      // For map prompts: show "Find:" with coordinates (map will be highlighted)
      const coords = countryCoordinates[currentCountry.Code];
      if (coords) {
        // Format coordinate display with correct direction logic
        const formatCoordinate = (coord, isLatitude) => {
          const absCoord = Math.abs(coord);
          let direction;
          if (isLatitude) {
            direction = coord >= 0 ? 'N' : 'S';
          } else {
            direction = coord >= 0 ? 'E' : 'W';
          }
          return `${absCoord.toFixed(1)}°${direction}`;
        };
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span>Find:</span>
            <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
              {formatCoordinate(coords.lat, true)}, {formatCoordinate(coords.lon, false)}
            </span>
          </div>
        );
      } else {
        // Fallback if no coordinates available (shouldn't happen with filtering)
        return <span>Find: {currentCountry.Name}</span>;
      }
    } else {
      // For text prompts: show "Find: [Country Name]"
      return <span>Find: {currentCountry.Name}</span>;
    }
  };

  return (
    // Main prompt container with fixed dimensions (300px width, 200px height)
    // Human prompt: "Make the prompt box not scale with the length of the name/flag. Have it have a fixed width, with the country name wrapping if necessary"
    // Human prompt: "similarily, have it be a fixed height. allow up to 3 lines for the text length. The 'prompt type: text' field can be removed"
    // Human prompt: "make the new prompt button stick to the bottom of the box, not float dynamically below the prompt text. Also, the text can get bumped weirdly when there are 3 lines of wrapping. Ensure there is enough space such that it won't get pushed out of the box"
    <div style={{
      padding: '1rem',
      border: '2px solid #646cff',
      borderRadius: '8px',
      background: '#f8f9ff',
      margin: '0 0 1rem 0', // Standardized margin
      textAlign: 'center',
      width: '300px', // Fixed width to prevent scaling with content
      height: '200px', // Fixed height for consistent layout
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Prompt text area - limited to 3 lines maximum with guaranteed space */}
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#333',
        wordWrap: 'break-word', // Allow long words to break
        overflowWrap: 'break-word', // Modern word wrapping
        hyphens: 'auto', // Add hyphens for better text flow
        lineHeight: '1.2', // Consistent line spacing
        height: '4.8rem', // Guaranteed space for 4 lines (4 * 1.2rem) to prevent overflow
        overflow: 'hidden', // Hide text that exceeds the allocated space
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically and horizontally
        marginBottom: '1rem' // Fixed spacing below text
      }}>
        {renderPromptContent()}
      </div>
      
      {/* Spacer div to push button to bottom */}
      <div style={{ flexGrow: 1 }}></div>
      
      {/* New Prompt button - positioned at bottom */}
      <button
        onClick={generateRandomCountry}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#646cff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          marginBottom: '1rem' // Fixed spacing above checkboxes
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#535bf2';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#646cff';
        }}
      >
        New Prompt
      </button>

      {/* Checkbox controls for prompt types - positioned at bottom */}
      {/* Human prompt: "move the prompt checkboxes below the new prompt button" */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap' // Allow wrapping on small screens
      }}>
        {/* Name checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#000' // Black text for better readability
          // Human prompt: "modify the css of the checkbox font to be black text"
        }}>
          <input
            type="checkbox"
            checked={enabledTypes[PROMPT_TYPES.TEXT]}
            onChange={() => handleTypeToggle(PROMPT_TYPES.TEXT)}
            style={{
              transform: 'scale(1.2)', // Slightly larger checkboxes
              cursor: 'pointer'
            }}
          />
          Name
        </label>
        
        {/* Map checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#000' // Black text for better readability
        }}>
          <input
            type="checkbox"
            checked={enabledTypes[PROMPT_TYPES.MAP]}
            onChange={() => handleTypeToggle(PROMPT_TYPES.MAP)}
            style={{
              transform: 'scale(1.2)', // Slightly larger checkboxes
              cursor: 'pointer'
            }}
          />
          Map
        </label>
        
        {/* Flag checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#000' // Black text for better readability
          // Human prompt: "modify the css of the checkbox font to be black text"
        }}>
          <input
            type="checkbox"
            checked={enabledTypes[PROMPT_TYPES.FLAG]}
            onChange={() => handleTypeToggle(PROMPT_TYPES.FLAG)}
            style={{
              transform: 'scale(1.2)', // Slightly larger checkboxes
              cursor: 'pointer'
            }}
          />
          Flag
        </label>
      </div>
    </div>
  );
}

export default CountryPrompt;
export { PROMPT_TYPES }; 