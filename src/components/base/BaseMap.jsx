import React, { useState, useEffect, useMemo } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule,
    ZoomableGroup
} from "react-simple-maps";
import allCountryData from '../../data/country_data.json';
// import { useQuiz } from '../hooks/useQuiz.js';
// import { useQuizActions } from '../hooks/useQuizActions.js';
// import { useCollapsible } from '../hooks/useCollapsible.js';
// import { useComponentState } from '../hooks/useComponentState.js';

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

// circle location for small countries
function getCentroid(geo){
  if (!geo || !geo.geometry) return null;
  if (geo.geometry.type === "Point") return geo.geometry.coordinates;
  
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

export function BaseMap({
  onCountryHover,
  onCountryHoverLeave,
  onCountryClick,
  getCountryStyle,
  disabled,
  getSmallCountryPriority,
  className,
  initialView = { coordinates: [0, 0], zoom: 1 },
  additionalControls = [],
  showGraticule = true
}){
  const [viewWindow, setViewWindow] = useState(initialView);
  const [resetKey, setResetKey] = useState(0);
  
  const getCircleRadius = (baseRadius = 3) => {
    return baseRadius / Math.sqrt(viewWindow.zoom);
  };

  const resetViewWindow = () => {
    setViewWindow(initialView);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className={`base-map ${className}`}>
      <div className="base-map__controls" style={{
        // position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        gap: '5px',
        zIndex: 1000
      }}>
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
        {additionalControls.map((control, index) => (
          <React.Fragment key={`control-${index}`}>
            {control}
          </React.Fragment>
        ))}
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
          center={initialView.coordinates}
          maxZoom={12}
          zoom={initialView.zoom}
          onMoveEnd={({ zoom, coordinates }) => {
            // if (!disabled) {
              setViewWindow({ coordinates, zoom });
            // }
          }}
        >
          {showGraticule && <Graticule stroke="#999" step={[20,20]} />}
          <Geographies geography={mainGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo);
                
                if (allCountryData.find(country => country.code === countryCode)) {
                  const countryStyle = getCountryStyle(countryCode);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => onCountryClick(countryCode)}
                      onMouseEnter={() => onCountryHover(countryCode)}
                      onMouseLeave={() => onCountryHoverLeave()}
                    //   strokeWidth={countryStyle.strokeWidth || 0.5}
                    //   fill={countryStyle.fill}
                    //   stroke={countryStyle.stroke}
                    //   cursor={countryStyle.cursor}
                      style={{
                        default: {...countryStyle},
                        hover: {...countryStyle}
                      }}
                    />
                  );
                }
              })
            }
          </Geographies>
          <Geographies geography={tinyGeoUrl}>
            {({ geographies, projection }) => {
                let lowPriorityCircles = [];
                let regularCircles = [];
                let specialCircles = [];
                const currentRadius = getCircleRadius();
                geographies.forEach((geo) => {
                    const countryCode = getCountryCode(geo);
                    const [centroid_x, centroid_y] = getCentroid(geo);
                    const [cx, cy] = projection([centroid_x, centroid_y]);
                    const countryStyle = getCountryStyle(countryCode);
                    const circleElement = (
                        <circle
                            key={`${geo.rsmKey}-${viewWindow.zoom}`}
                            // geography={geo}
                            cx={cx}
                            cy={cy}
                            fill={countryStyle.fill}
                            stroke={countryStyle.stroke}
                            strokeWidth={countryStyle.strokeWidth}
                            r={currentRadius}
                            onClick={() => onCountryClick(countryCode)}
                            onMouseEnter={() => onCountryHover(countryCode)}
                            onMouseLeave={() => onCountryHoverLeave()}
                            style={{
                                outline: "none"
                            }}
                        />
                    );
                    const priority = getSmallCountryPriority ? getSmallCountryPriority(countryCode) : 'regular';
                    if (priority === -1) {
                    lowPriorityCircles.push(circleElement);
                    } else if (priority === 1) {
                    specialCircles.push(circleElement);
                    } else {
                    regularCircles.push(circleElement);
                    }
                });
            return [...lowPriorityCircles, ...regularCircles, ...specialCircles];
          }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}