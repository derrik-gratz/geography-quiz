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
    console.log(`Invalid country code: ${geo.properties.ISO_A3} or ${geo.properties.GU_A3}`);
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

export function WorldMap({ lockedOn, onSubmitAnswer, disabled = false }) {
  const lockedOnCode = lockedOn?.lockedOn;
  
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
      if (!disabled) {
        console.log(geo.properties.NAME);
        setSelectedCountry(geo.properties.ISO_A3);
        setMapSelectedCountry(geo.properties.ISO_A3);
      }
    },
    
    handleCountryHover: (countryCode) => {
      setHoveredCountry(countryCode);
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
        fill: isSelected ? "#646cff" : "#D6D6DA",
        stroke: "#FFFFFF",
        strokeWidth: 0.5,
        outline: "none",
      },
      hover: {
        fill: isSelected ? "#535bf2" : "#F53",
      },
    }),
    
    getCircleStyle: (isSelected, isHovered) => ({
      fill: isHovered ? (
        isSelected ? "#535bf2" : "#F53"
      ) : (
        isSelected ? "#646cff" : "#FFA500"
      ),
    }),
    
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
        fill: lockedOnCode === countryCode ? "#008000" : "#D6D6DA",
        stroke: "#FFFFFF",
        strokeWidth: 0.5,
        outline: "none",
      },
      hover: {
        fill: lockedOnCode === countryCode ? "#008000" : "#D6D6DA",
      },
    }),
    
    getCircleStyle: (isSelected, isHovered, countryCode) => ({
      fill: lockedOnCode === countryCode ? "#008000" : "#FFA500",
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

  // Reset map selection when disabled or resetKey changes
  useEffect(() => {
    if (disabled || resetKey) {
      setMapSelectedCountry(null);
      setSelectedCountry(null);
    }
  }, [disabled, resetKey]);

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
    console.log('Evaluating selection:', countryCode);
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
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      onMouseEnter={() => handleCountryHover(countryCode)}
                      onMouseLeave={() => handleCountryHoverLeave()}
                      style={getCountryStyle(isSelected, isHovered, countryCode)}
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
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={() => handleCountryHover(countryCode)}
                    onMouseLeave={() => handleCountryHoverLeave()}
                    style={{
                      cursor: "pointer",
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