import React, { useState, useEffect } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule,
    ZoomableGroup
} from "react-simple-maps";
import countryData from '../data/country_data.json';

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

export function WorldMap({ lockedOn, onSubmitAnswer, incorrectCountries = [], correctCountries = [], disabled = false, promptResetKey }) {
  const lockedOnCode = lockedOn;
  
  // State management
  const [viewWindow, setViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  const [resetKey, setResetKey] = useState(0);
  const [mapSelectedCountry, setMapSelectedCountry] = useState(null);

  // UNLOCKED MODE BEHAVIORS
  const unlockedBehaviors = {
    getDefaultViewWindow: () => ({ coordinates: [0, 0], zoom: 1.5 }),
    
    handleCountryClick: (geo) => {
      if (!disabled && correctCountries.length === 0) {
        const countryCode = getCountryCode(geo);
        if (!incorrectCountries.includes(countryCode)) {
          // console.log(geo.properties.NAME);
          setSelectedCountry(countryCode);
          setMapSelectedCountry(countryCode);
        }
      }
    },
    
    handleCountryHover: (countryCode) => {
      if (!incorrectCountries.includes(countryCode) && correctCountries.length === 0) {
        setHoveredCountry(countryCode);
      }
    },
    
    handleCountryHoverLeave: () => {
      setHoveredCountry(null);
    },
    
    resetViewWindow: function() {
      setViewWindow(this.getDefaultViewWindow());
      setResetKey(prev => prev + 1);
    },
    
    getCountryStyle: (isSelected, isHovered, countryCode) => {
      const isIncorrect = incorrectCountries.includes(countryCode);
      const isCorrect = correctCountries.includes(countryCode);
      
      return {
        default: {
          fill: isCorrect ? "var(--color-correct)" : 
                isIncorrect ? "var(--color-incorrect)" :
                isSelected ? "var(--color-selected)" : "#D6D6DA",
          stroke: isCorrect ? "var(--color-correct-outline)" :
                 isIncorrect ? "var(--color-incorrect-outline)" : "#FFFFFF",
          strokeWidth: 0.5,
          outline: "none",
        },
        hover: {
          fill: isCorrect ? "var(--color-correct)" :
                isIncorrect ? "var(--color-incorrect)" :
                isSelected ? "var(--color-selected)" : "var(--color-hover)",
          stroke: isHovered && !isCorrect && !isIncorrect ? "var(--color-hover-outline)" : 
                 isCorrect ? "var(--color-correct-outline)" :
                 isIncorrect ? "var(--color-incorrect-outline)" : "#FFFFFF",
          strokeWidth: isHovered && !isCorrect && !isIncorrect ? 1 : 0.5,
        },
      };
    },
    
    getCircleStyle: (isSelected, isHovered, countryCode) => {
      const isIncorrect = incorrectCountries.includes(countryCode);
      const isCorrect = correctCountries.includes(countryCode);
      
      return {
        fill: isCorrect ? "var(--color-correct)" :
              isIncorrect ? "var(--color-incorrect)" :
              isHovered ? (
                isSelected ? "var(--color-selected)" : "var(--color-hover)"
              ) : (
                isSelected ? "var(--color-selected)" : "#FFA500"
              ),
      };
    },
    
    showSubmitButton: true,
  };

  // LOCKED MODE BEHAVIORS
  const lockedBehaviors = {
    getDefaultViewWindow: () => {
      if (lockedOnCode) {
        const country = countryData.find(country => country.code === lockedOnCode);
        if (country && country.location) {
          return { 
            coordinates: [country.location.long, country.location.lat], 
            zoom: 8
          };
        }
      }
      return { coordinates: [0, 0], zoom: 1 };
    },
    
    handleCountryClick: (geo) => {
      // No action in locked mode
    },
    
    handleCountryHover: (countryCode) => {
      // Disable hover effects in locked mode
      setHoveredCountry(null);
    },
    
    handleCountryHoverLeave: () => {
      setHoveredCountry(null);
    },
    
    resetViewWindow: function() {
      setViewWindow(this.getDefaultViewWindow());
      setResetKey(prev => prev + 1);
    },
    
    getCountryStyle: (isSelected, isHovered, countryCode) => ({
      default: {
        fill: lockedOnCode === countryCode ? "var(--color-correct)" : "#D6D6DA",
        stroke: lockedOnCode === countryCode ? "var(--color-correct-outline)" : "#FFFFFF",
        strokeWidth: lockedOnCode === countryCode ? 1 : 0.5,
        outline: "none",
      },
      // hover: {
      //   fill: lockedOnCode === countryCode ? "var(--color-correct)" : "#D6D6DA",
      // },
    }),
    
    getCircleStyle: (isSelected, isHovered, countryCode) => ({
      fill: lockedOnCode === countryCode ? "var(--color-correct)" : "#FFA500",
    }),
    
    showSubmitButton: false,
  };

  // Select behavior based on lock state
  const behaviors = lockedOnCode ? lockedBehaviors : unlockedBehaviors;

  // Update viewWindow when lockedOnCode changes
  useEffect(() => {
    const defaultView = behaviors.getDefaultViewWindow();
    setDefaultViewWindow(defaultView);
    setViewWindow(defaultView);
  }, [lockedOnCode]);

  // Reset map selection when disabled or promptResetKey changes
  useEffect(() => {
    if (disabled || promptResetKey) {
      setMapSelectedCountry(null);
      setSelectedCountry(null);
    }
  }, [disabled, promptResetKey]);

  // Handle map submission
  const handleMapSubmit = () => {
    if (mapSelectedCountry && onSubmitAnswer) {
      onSubmitAnswer(mapSelectedCountry);
    }
  };

  // Assign behavior functions
  const handleCountryClick = behaviors.handleCountryClick;
  const handleCountryHover = behaviors.handleCountryHover;
  const handleCountryHoverLeave = behaviors.handleCountryHoverLeave;
  const resetViewWindow = behaviors.resetViewWindow.bind(behaviors);
  const getCountryStyle = behaviors.getCountryStyle;
  const getCircleStyle = behaviors.getCircleStyle;
  const showSubmitButton = behaviors.showSubmitButton;

  function getCircleRadius(baseRadius = 4) {
    return baseRadius / Math.sqrt(viewWindow.zoom);
  }

  // Placeholder for evaluateSelection - you'll need to implement this
  const evaluateSelection = (countryCode) => {
    // TODO: Implement evaluation logic
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        display: 'flex',
        gap: '5px',
        zIndex: 1000
      }}>
        {!lockedOnCode && (
          <button
            onClick={handleMapSubmit}
            disabled={!mapSelectedCountry || disabled}
            style={{
              background: mapSelectedCountry && !disabled ? 'rgba(26, 168, 31, 0.8)' : 'rgba(128, 128, 128, 0.8)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              cursor: mapSelectedCountry && !disabled ? 'pointer' : 'not-allowed',
              opacity: mapSelectedCountry && !disabled ? 1 : 0.6
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
          key={resetKey}
          center={viewWindow.coordinates}
          zoom={viewWindow.zoom}
          onMoveEnd={({ zoom, coordinates }) => {
            if (!lockedOnCode) {
              setViewWindow({ coordinates, zoom });
            }
          }}
        >
          <Graticule stroke="#999" step={[20,20]} />
          <Geographies geography={mainGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo);
                const isHovered = hoveredCountry === countryCode;
                const isSelected = mapSelectedCountry === countryCode;
                
                if (countryData.find(country => country.code === countryCode)) {
                  const isIncorrect = incorrectCountries.includes(countryCode);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      onMouseEnter={() => handleCountryHover(countryCode)}
                      onMouseLeave={() => handleCountryHoverLeave()}
                      style={{
                        ...getCountryStyle(isSelected, isHovered, countryCode),
                        cursor: isIncorrect ? "not-allowed" : "pointer"
                      }}
                    />
                  );
                }
                return null;
              })
            }
          </Geographies>
          <Geographies geography={tinyGeoUrl}>
            {({ geographies, projection }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo);
                const isSelected = mapSelectedCountry === countryCode;
                const isHovered = hoveredCountry === countryCode;
                const [centroid_x, centroid_y] = getCentroid(geo);
                const [cx, cy] = projection([centroid_x, centroid_y]);

                return (
                  <circle
                    key={geo.rsmKey}
                    cx={cx}
                    cy={cy}
                    r={getCircleRadius()}
                    fill={getCircleStyle(isSelected, isHovered, countryCode).fill}
                    stroke="#fff"
                    strokeWidth={0.5}
                    onClick={() => {
                      if (!incorrectCountries.includes(countryCode)) {
                        handleCountryClick(geo);
                      }
                    }}
                    onMouseEnter={() => handleCountryHover(countryCode)}
                    onMouseLeave={() => handleCountryHoverLeave()}
                    style={{
                      cursor: incorrectCountries.includes(countryCode) ? "not-allowed" : "pointer",
                      outline: "none",
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}