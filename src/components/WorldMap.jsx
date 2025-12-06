import React, { useState, useEffect, useMemo } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule,
    ZoomableGroup
} from "react-simple-maps";
import allCountryData from '../data/country_data.json';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizActions } from '../hooks/useQuizActions.js';

const mainGeoUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
const tinyGeoUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_admin_0_tiny_countries.geojson";

function isValidCountryCode(code) {
  return code && 
  code !== "-99" && 
  code.length === 3 && 
  /^[A-Z]{3}$/.test(code);
}

function getCountryCode(geo) {
  if (isValidCountryCode(geo.properties.ISO_A3)) {
    return geo.properties.ISO_A3.trim();
  } else if (isValidCountryCode(geo.properties.GU_A3)) {
    return geo.properties.GU_A3.trim();
  } else {
    return null;
  }
}

function getCentroid(geo){
  if (!geo || !geo.geometry) return null;
  if (geo.geometry.type === "Point") return geo.geometry.coordinates;
  
  // For Polygon or MultiPolygon, use simple centroid calculation
  if (geo.geometry.type === "Polygon") {
    const coords = geo.geometry.coordinates[0];
    let x = 0, y = 0, n = coords.length;
    coords.forEach(([lon, lat]) => { x += lon; y += lat; });
    return [x / n, y / n];
  }
  if (geo.geometry.type === "MultiPolygon") {
    // Use first polygon for centroid
    const coords = geo.geometry.coordinates[0][0];
    let x = 0, y = 0, n = coords.length;
    coords.forEach(([lon, lat]) => { x += lon; y += lat; });
    return [x / n, y / n];
  }
  return null;
}

export function WorldMap() {
  const {state } = useQuiz();
  const { submitAnswer } = useQuizActions();

  let disabled = true;
  let guesses = null;
  let correctCountry = null;

  if (state.config.gameMode === 'sandbox') {
    disabled = false;
  } else if (state.config.gameMode === 'quiz') {
    if (state.quiz.status === 'active') {
      guesses = state.quiz.prompt.guesses.location;
      disabled = guesses?.status !== 'incomplete';
      correctCountry = state.quizData[state.quiz.prompt.quizDataIndex]?.name;
    } else if (state.quiz.status === 'reviewing' && state.quiz.reviewIndex !== null) {
      const historyEntry = state.quiz.history[state.quiz.reviewIndex];
      guesses = historyEntry?.location;
      disabled = true;
      correctCountry = state.quizData[historyEntry.quizDataIndex]?.name;
    }
  }

  const incorrectCountries = useMemo(() => {
    if (!guesses || !guesses.attempts) return [];
    return guesses.attempts.filter(attempt => attempt !== correctCountry);
  }, [guesses?.attempts, correctCountry]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  // const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  const [viewWindow, setViewWindow] = useState(defaultViewWindow);
  // const [hoveredCountry, setHoveredCountry] = useState(null);
  // const [resetKey, setResetKey] = useState(0);
  // const [mapSelectedCountry, setMapSelectedCountry] = useState(null);

  React.useEffect(() => {
    if (disabled) {
      setSelectedCountry(null);
      setViewWindow(defaultViewWindow);
    }
  }, [disabled]);

  const handleCountryClick = (geo) => {
    if (!disabled) {
      const countryCode = getCountryCode(geo);
      if (!incorrectCountries.includes(countryCode)) {
        setSelectedCountry(countryCode);
      }
    }
  };

  // const handleCountryHover = (countryCode) => {
  //     if (!disabled && !incorrectCountries.includes(countryCode)) {
  //     setHoveredCountry(countryCode);
  //   }
  // };

  // const handleCountryHoverLeave = () => {
  //   setHoveredCountry(null);
  // };

  const getCountryStyle = (countryCode, selectedCountry, incorrectCountries, correctCountry) => {
    const isIncorrect = incorrectCountries.includes(countryCode);
    const isCorrect = countryCode === correctCountry;
    const isSelected = countryCode === selectedCountry;
    return {
      // default: {
      fill: isCorrect ? "var(--color-correct)" : 
            isIncorrect ? "var(--color-incorrect)" :
            isSelected ? "var(--color-selected)" : "#D6D6DA",
      stroke: isCorrect ? "var(--color-correct-outline)" :
              isIncorrect ? "var(--color-incorrect-outline)" : 
              isSelected ? "var(--color-selected-outline)" : "#FFFFFF",
      strokeWidth: 0.2,
      outline: "none",
      // },
      // hover: {
      //   fill: isCorrect ? "var(--color-correct)" :
      //         isIncorrect ? "var(--color-incorrect)" :
      //         isSelected ? "var(--color-selected)" : "var(--color-hover)",
      //   stroke: isHovered && !isCorrect && !isIncorrect ? "var(--color-hover-outline)" : 
      //          isCorrect ? "var(--color-correct-outline)" :
      //          isIncorrect ? "var(--color-incorrect-outline)" : "#FFFFFF",
      //   strokeWidth: isHovered && !isCorrect && !isIncorrect ? 1 : 0.5,
      // },
    };
  };
  const getCountryViewWindow = (countryCode) => {
    const countryData = allCountryData.find(country => country.code === countryCode);
    if (countryData && countryData.location) {
      return { 
        coordinates: [countryData.location.long, countryData.location.lat], 
        zoom: 8
      };
    };
    return { coordinates: [0, 0], zoom: 1 };
  };

  const componentStatus = useMemo(() => {
    if (state.config.gameMode === 'sandbox') {
      return 'sandbox';
    }  else if (state.config.gameMode === 'quiz') {
      if (state.quiz.status === 'not_started' || state.quiz.status === 'completed') {
        return 'disabled';
      } else if (state.quiz.status === 'reviewing' && state.quiz.reviewIndex !== null) {
        return 'reviewing';
      } else if (guesses && guesses.status === 'incomplete'){
        // guesses.attempts && guesses.attempts.length > 0 && guesses.attempts[guesses.attempts.length - 1] !== correctCountry) {
        return 'active';
      } else if (guesses && guesses.status === 'completed'){
        // guesses.attempts && guesses.attempts.length > 0 && guesses.attempts[guesses.attempts.length - 1] !== correctCountry) {
        return 'completed';
      } else if (guesses.status === 'prompted') {
        return 'prompting';
      }
    }
    return 'unknown';
  }, [state.quiz.status, state.quiz.reviewIndex, guesses?.status, guesses?.attempts, correctCountry]);

  useEffect(() => {
    let view = { coordinates: [0, 0], zoom: 1 };
    if (componentStatus === 'reviewing') {
      view = getCountryViewWindow(correctCountry)
    } else if (componentStatus === 'prompting') {
      view = getCountryViewWindow(correctCountry)
    }
    setDefaultViewWindow(view);
    setViewWindow(view);
  }, [componentStatus]);

  const resetViewWindow = () => {
    setViewWindow(defaultViewWindow);
    // setResetKey(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (selectedCountry && !disabled) {
      submitAnswer('location', selectedCountry);
    }
  };
  // LOCKED MODE BEHAVIORS
    
    // handleCountryClick: (geo) => {
    //   // No action in locked mode
    // },
    
    // handleCountryHover: (countryCode) => {
    //   // Disable hover effects in locked mode
    //   setHoveredCountry(null);


  // Select behavior based on lock state
 

  // Update viewWindow when lockedOnCode changes

  // Zoom to correct country when user gives up
  // useEffect(() => {
  //   if (giveUp && correctCountries.length > 0) {
  //     const correctCountryCode = correctCountries[correctCountries.length - 1]; // Get the most recent correct country
  //     const country = countryData.find(country => country.code === correctCountryCode);
  //     if (country && country.location) {
  //       const giveUpView = { 
  //         coordinates: [country.location.long, country.location.lat], 
  //         zoom: 8
  //       };
  //       setViewWindow(giveUpView);
  //       setResetKey(prev => prev + 1); // Force re-render to apply zoom
  //     }
  //   }
  // }, [giveUp, correctCountries]);

  // // Reset map selection when disabled or promptResetKey changes
  // useEffect(() => {
  //   if (disabled || promptResetKey) {
  //     setMapSelectedCountry(null);
  //     setSelectedCountry(null);
  //   }
  // }, [disabled, promptResetKey]);


function getCircleRadius(baseRadius = 3) {
  return baseRadius / Math.sqrt(viewWindow.zoom);
}


  return (
    <div >
      <div style={{
        // position: 'absolute',
        top: '5px',
        right: '5px',
        display: 'flex',
        gap: '5px',
        zIndex: 1000
      }}>
        {componentStatus === 'active' && guesses?.status === 'incomplete' && (
          <button
            onClick={handleSubmit}
            disabled={!selectedCountry || disabled}
            style={{
              background: selectedCountry && !disabled ? 'rgba(26, 168, 31, 0.8)' : 'rgba(128, 128, 128, 0.8)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              cursor: selectedCountry && !disabled ? 'pointer' : 'not-allowed',
              opacity: selectedCountry && !disabled ? 1 : 0.6
            }}
            title="Submit map selection"
          >
            Submit Map
          </button>
        )}
        <button
          onClick={resetViewWindow}
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            cursor: 'pointer'
          }}
          title="Reset view"
        >
          Reset View
        </button>
      </div>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 147
        }}
        // onMouseMove={handleMouseMove}
        // onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <ZoomableGroup
          // key={resetKey}
          center={viewWindow.coordinates}
          maxZoom={12}
          zoom={viewWindow.zoom}
          onMoveEnd={({ zoom, coordinates }) => {
            if (!disabled) {
              setViewWindow({ coordinates, zoom });
            }
          }}
        >
          <Graticule stroke="#999" step={[20,20]} />
          <Geographies geography={mainGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo);
                // const isHovered = hoveredCountry === countryCode;
                // const isSelected = selectedCountry === countryCode;
                
                if (allCountryData.find(country => country.code === countryCode)) {
                  // const isIncorrect = incorrectCountries.includes(countryCode);
                  const countryStyle = getCountryStyle(countryCode, selectedCountry, incorrectCountries, correctCountry);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      fill={countryStyle.fill}
                      stroke={countryStyle.stroke}
                      strokeWidth={countryStyle.strokeWidth}
                      // onMouseEnter={() => handleCountryHover(countryCode)}
                      // onMouseLeave={() => handleCountryHoverLeave()}
                      cursor={incorrectCountries.includes(countryCode) ? "not-allowed" : "pointer"}
                    />
                  );
                }
                return null;
              })
            }
          </Geographies>
          <Geographies geography={tinyGeoUrl}>
            {({ geographies, projection }) => {
              // Separate circles into regular and special (selected/prompted) groups
              const regularCircles = [];
              const specialCircles = [];
              
              geographies.forEach((geo) => {
                const countryCode = getCountryCode(geo);
                const isSelected = selectedCountry === countryCode;
                // const isHovered = hoveredCountry === countryCode;
                const isIncorrect = incorrectCountries.includes(countryCode);
                const isCorrect = countryCode === correctCountry;
                
                const [centroid_x, centroid_y] = getCentroid(geo);
                const [cx, cy] = projection([centroid_x, centroid_y]);
                const countryStyle = getCountryStyle(countryCode, selectedCountry, incorrectCountries, correctCountry);
                const circleElement = (
                  <circle
                    key={geo.rsmKey}
                    cx={cx}
                    cy={cy}
                    r={getCircleRadius()}
                    fill={countryStyle.fill}
                    stroke={countryStyle.stroke}
                    strokeWidth={countryStyle.strokeWidth}
                    onClick={() => {
                      if (!isIncorrect) {
                        handleCountryClick(geo);
                      }
                    }}
                    // onMouseEnter={() => handleCountryHover(countryCode)}
                    // onMouseLeave={() => handleCountryHoverLeave()}
                    style={{
                      cursor: isIncorrect ? "not-allowed" : "pointer",
                      outline: "none",
                    }}
                  />
                );

                // Add to special group if selected, hovered, or prompted
                if (isSelected || isCorrect) {
                  specialCircles.push(circleElement);
                } else {
                  regularCircles.push(circleElement);
                }
              });

              // Render regular circles first, then special circles on top
              return [...regularCircles, ...specialCircles];
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}