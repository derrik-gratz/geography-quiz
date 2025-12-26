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
import { useCollapsible } from '../hooks/useCollapsible.js';
import { useComponentState } from '../hooks/useComponentState.js';

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

function getCountryViewWindow(countryCode) {
  const countryData = allCountryData.find(country => country.code === countryCode);
  if (countryData?.location) {
    return { 
      coordinates: [countryData.location.long, countryData.location.lat], 
      zoom: 8
    };
  }
  return { coordinates: [0, 0], zoom: 1 };
}

export function WorldMap() {
  const { state } = useQuiz();
  const { submitAnswer } = useQuizActions();
  const { guesses, correctValue, disabled, componentStatus, incorrectValues } = useComponentState('location');
  const defaultCollapsed = false; //useMemo(() => componentStatus === 'prompting', [componentStatus]);
  const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  const [viewWindow, setViewWindow] = useState(defaultViewWindow);
  const [resetKey, setResetKey] = useState(0);
  
  // Reset selection and view when disabled
  useEffect(() => {
    if (disabled) {
      setSelectedCountry(null);
      setViewWindow(defaultViewWindow);
    }
  }, [disabled, defaultViewWindow]);

  useEffect(() => {
    let view = { coordinates: [0, 0], zoom: 1 };
    if ((componentStatus === 'reviewing' || componentStatus === 'prompting') && correctValue) {
      view = getCountryViewWindow(correctValue);
    }
    setDefaultViewWindow(view);
    setViewWindow(view);
  }, [componentStatus, correctValue]);

  const handleCountryClick = (geo) => {
    if (disabled) return;
    const countryCode = getCountryCode(geo);
    if (countryCode && !incorrectValues.includes(countryCode)) {
      setSelectedCountry(countryCode);
    }
  };

  const getCountryStyle = (countryCode) => {
    const isIncorrect = incorrectValues.includes(countryCode);
    const isCorrect = countryCode === correctValue;
    const isSelected = countryCode === selectedCountry;
    const isHovered = countryCode === hoveredCountry;
    
    return {
      fill: (isCorrect && (componentStatus !== 'active')) ? "var(--input-option-correct)" :
            isIncorrect ? "var(--input-option-incorrect)" :
            isSelected ? "var(--input-option-selected)" :
            isHovered ? "var(--input-option-hover)" : "var(--input-option-neutral)",
      stroke: (isCorrect && (componentStatus !== 'active')) ? "var(--input-option-correct-stroke)" :
              isIncorrect ? "var(--input-option-incorrect-stroke)" : 
              isSelected ? "var(--input-option-selected-stroke)" :
              isHovered ? "var(--input-option-hover-stroke)" : "var(--map-default-outline)",
      strokeWidth: 0.3,
      outline: "none",
    };
  };

  const getCircleRadius = (baseRadius = 3) => {
    return baseRadius / Math.sqrt(viewWindow.zoom);
  };

  const resetViewWindow = () => {
    setViewWindow(defaultViewWindow);
    setResetKey(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (selectedCountry && !disabled) {
      submitAnswer('location', selectedCountry);
    }
  };

  const onMouseEnter = (countryCode) => {
    if (!disabled && !incorrectValues.includes(countryCode) && countryCode !== correctValue) {
      setHoveredCountry(countryCode);
    }
  };
  const onMouseLeave = () => {
    if (!disabled) {
      setHoveredCountry(null);
    }
  };
  
  return (
    <div className={`world-map component-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="component-panel__title-container">
        <button 
          className="component-panel__toggle-button" 
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expand World Map' : 'Collapse World Map'}
        >
          {isCollapsed ? '▶ World Map' : '▼ World Map'}
        </button>
      </div>
      <div className="component-panel__content">
      <div style={{
        // position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        gap: '5px',
        zIndex: 1000
      }}>
        {componentStatus === 'active' && guesses?.status === 'incomplete' && (
          <button
            onClick={handleSubmit}
            disabled={!selectedCountry || disabled}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              fontFamily: 'monospace',
              borderRadius: '4px',
              border: `1px solid ${selectedCountry && !disabled ? 'var(--color-submit-button-outline)' : 'var(--color-disabled)'}`,
              backgroundColor: selectedCountry && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)',
              color: selectedCountry && !disabled ? '#fff' : 'var(--text-primary)',
              cursor: selectedCountry && !disabled ? 'pointer' : 'not-allowed'
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
                
                
                if (allCountryData.find(country => country.code === countryCode)) {
                  const countryStyle = getCountryStyle(countryCode);
                  const isIncorrect = incorrectValues.includes(countryCode);
                  const isSelected = selectedCountry === countryCode;
                  const isCorrect = countryCode === correctValue;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      fill={countryStyle.fill}
                      stroke={countryStyle.stroke}
                      strokeWidth={0.5} /*{countryStyle.strokeWidth}*/
                      cursor={isIncorrect ? "not-allowed" : "pointer"}
                      style={{
                        default: { fill: countryStyle.fill },
                        hover: (!disabled && !isIncorrect && !isCorrect && !isSelected) ? { fill: "var(--input-option-hover)" } : { fill: countryStyle.fill },
                      }}
                    />
                  );
                }
                return null;
              })
            }
          </Geographies>
          <Geographies geography={tinyGeoUrl}>
            {({ geographies, projection }) => {
              const regularCircles = [];
              const specialCircles = [];
              
              geographies.forEach((geo) => {
                const countryCode = getCountryCode(geo);
                const isSelected = selectedCountry === countryCode;
                const isIncorrect = incorrectValues.includes(countryCode);
                const isCorrect = countryCode === correctValue;
                
                const [centroid_x, centroid_y] = getCentroid(geo);
                const [cx, cy] = projection([centroid_x, centroid_y]);
                const countryStyle = getCountryStyle(countryCode);
                
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
                    onMouseEnter={() => onMouseEnter(countryCode)}
                    onMouseLeave={() => onMouseLeave()}
                    style={{
                      cursor: isIncorrect ? "not-allowed" : "pointer",
                      outline: "none",
                    }}
                  />
                );
                if (isSelected || isCorrect) {
                  specialCircles.push(circleElement);
                } else {
                  regularCircles.push(circleElement);
                }
              });

              return [...regularCircles, ...specialCircles];
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      </div>
    </div>
  );
}