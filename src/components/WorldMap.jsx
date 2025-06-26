import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import countries from '../data/countries.json';

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap({ onCountrySelect }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

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
    const countryName = geo.properties.name;
    const countryCode = countryNameToCode[countryName];
    
    if (countryCode) {
      setSelectedCountry(countryCode);
      if (onCountrySelect) {
        onCountrySelect({ Name: countryName, Code: countryCode });
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 147
        }}
      >
        <ZoomableGroup>
          {/* <Geographies geography={process.env.PUBLIC_URL + '/geographies.json'}> */}
          <Geographies geography={`${import.meta.env.BASE_URL}geographies.json`}>
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
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export default WorldMap; 