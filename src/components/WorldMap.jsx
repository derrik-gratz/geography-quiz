import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  ZoomableGroup,
  Line
} from "react-simple-maps";
import countries from '../data/countries.json';
import countryCoordinates from '../data/countryCoordinates.json';

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap({ onCountrySelect, highlightedCountry, showCoordinates = false, clearInputsRef, guesses = [], currentPrompt = null }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Function to clear the selection
  const clearSelection = () => {
    setSelectedCountry(null);
  };

  // Set the clear function in the ref so parent can call it
  React.useEffect(() => {
    if (clearInputsRef) {
      // Store the current clear function
      const currentClear = clearInputsRef.current;
      clearInputsRef.current = () => {
        clearSelection();
        // Call any existing clear function
        if (currentClear) {
          currentClear();
        }
      };
    }
  }, [clearInputsRef]);

  // Create a mapping from country names to ISO codes for easier lookup
  const countryNameToCode = {};
  countries.forEach(country => {
    countryNameToCode[country.Name] = country.Code;
    // Also add aliases to the mapping
    if (country.Aliases && Array.isArray(country.Aliases)) {
      country.Aliases.forEach(alias => {
        countryNameToCode[alias] = country.Code;
      });
    }
  });

  const handleCountryClick = (geo) => {
    let countryName = geo.properties.name;
    if (!countryName) {
      // Try alternative property
      countryName = geo.properties.ADMIN;
    }
    // Log for debugging
    if (!countryName) {
      console.log('Region clicked: undefined', geo.properties);
    } else {
      console.log('Region clicked:', countryName);
    }
    const countryCode = countryNameToCode[countryName];
    
    if (countryCode) {
      setSelectedCountry(countryCode);
      if (onCountrySelect) {
        onCountrySelect({ Name: countryName, Code: countryCode });
      }
    }
  };

  // Generate coordinate grid lines
  const generateGridLines = () => {
    const lines = [];
    
    // Latitude lines (horizontal)
    for (let lat = -80; lat <= 80; lat += 20) {
      lines.push({
        coordinates: [
          [-180, lat],
          [180, lat]
        ],
        type: 'latitude',
        value: lat
      });
    }
    
    // Longitude lines (vertical)
    for (let lon = -180; lon <= 180; lon += 30) {
      lines.push({
        coordinates: [
          [lon, -90],
          [lon, 90]
        ],
        type: 'longitude',
        value: lon
      });
    }
    
    return lines;
  };

  const handleMouseMove = (event) => {
    if (!showCoordinates) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to geographic coordinates
    // This is a simplified conversion - in a real app you'd use proper projection math
    const lon = ((x / rect.width) * 360) - 180;
    const lat = 90 - ((y / rect.height) * 180);
    
    // Format coordinates with proper direction indicators
    const formatLatitude = (lat) => {
      const absLat = Math.abs(lat);
      const direction = lat >= 0 ? 'N' : 'S';
      return `${lat.toFixed(1)}°${direction}`;
    };
    
    const formatLongitude = (lon) => {
      const absLon = Math.abs(lon);
      const direction = lon >= 0 ? 'E' : 'W';
      return `${lon.toFixed(1)}°${direction}`;
    };
    
    setMousePosition({ 
      lat: formatLatitude(lat), 
      lon: formatLongitude(lon) 
    });
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  // Format coordinate display for highlighted country
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

  // Get coordinates for highlighted country
  const getHighlightedCountryCoords = () => {
    if (!highlightedCountry) return null;
    const coords = countryCoordinates[highlightedCountry.Code];
    if (!coords) return null;
    return `${formatCoordinate(coords.lat, true)}, ${formatCoordinate(coords.lon, false)}`;
  };

  // Use the new GeoJSON URLs for country boundaries
  const mainGeoUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
  const tinyGeoUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_admin_0_tiny_countries.geojson";

  // Helper to get centroid of a feature
  const getCentroid = (geo) => {
    if (!geo || !geo.geometry) return [0, 0];
    if (geo.geometry.type === "Point") return geo.geometry.coordinates;
    // For Polygon or MultiPolygon, use d3-geo centroid if available, else fallback
    if (geo.geometry.type === "Polygon") {
      // Simple centroid calculation for polygons
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
    return [0, 0];
  };

  // Circle radius scales down as zoom increases
  const baseCircleRadius = 3; // smaller default
  const getCircleRadius = () => baseCircleRadius / Math.sqrt(zoom);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Coordinate display overlay for mouse position */}
      {showCoordinates && mousePosition && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'monospace',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          {mousePosition.lat}, {mousePosition.lon}
        </div>
      )}
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 147
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <ZoomableGroup
          onMoveEnd={({ zoom }) => setZoom(zoom)}
          minZoom={1}
          maxZoom={20}
        >
          {/* Coordinate grid lines */}
          {showCoordinates && generateGridLines().map((line, index) => (
            <Line
              key={`grid-${index}`}
              coordinates={line.coordinates}
              stroke="#ddd"
              strokeWidth={0.5}
              strokeDasharray={line.type === 'latitude' ? "2,2" : "1,1"}
              style={{
                pointerEvents: 'none'
              }}
            />
          ))}
          {/* Main countries */}
          <Geographies geography={mainGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const countryCode = countryNameToCode[countryName];
                const isSelected = selectedCountry === countryCode;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: {
                        fill: isSelected ? "#646cff" : "#D6D6DA",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: isSelected ? "#535bf2" : "#F53",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#E42",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
          {/* Tiny countries overlay */}
          <Geographies geography={tinyGeoUrl}>
            {({ geographies, projection }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const countryCode = countryNameToCode[countryName];
                const isSelected = selectedCountry === countryCode;
                // Draw only a small circle at the centroid
                const [lon, lat] = getCentroid(geo);
                const [cx, cy] = projection([lon, lat]);
                return (
                  <circle
                    key={geo.rsmKey + '-tiny-circle'}
                    cx={cx}
                    cy={cy}
                    r={getCircleRadius()}
                    fill={isSelected ? "#646cff" : "#FF9800"}
                    stroke="#fff"
                    strokeWidth={0.7}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCountryClick(geo)}
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

export default WorldMap; 