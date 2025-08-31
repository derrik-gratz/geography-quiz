import React, { useState } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule
} from "react-simple-maps";
import { geoPath } from "d3-geo";


const mainGeoUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
const tinyGeoUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_admin_0_tiny_countries.geojson";

function handleCountryClick(geo) {
  console.log(geo.properties.NAME);
}

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
  if (!geo || !geo.geometry) return null; //[0, 0];
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
  return null; //[0, 0];
};

// function handleMapMouseMove(e) {
//   if (!projection) return;
  
//   const rect = e.currentTarget.getBoundingClientRect();
//   const mouseX = e.clientX - rect.left;
//   const mouseY = e.clientY - rect.top;
  
//   try {
//     const [longitude, latitude] = projection.invert([mouseX, mouseY]);
//     console.log(`Mouse at: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
//   } catch (error) {
//     console.log('Could not convert coordinates');
//   }
// }

export function WorldMap() {
    return(
        <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 147
        }}
        // onMouseMove={handleMapMouseMove}
        // onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <Graticule stroke="#999" />
        <Geographies geography={mainGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // const countryName = geo.properties.name;
                // Some ISO_A3 are missing
                const countryCode = getCountryCode(geo);
                // const countryCode = countryNameToCode[countryName];
                // const isSelected = selectedCountry === countryCode;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: {
                        fill: "#D6D6DA", //isSelected ? "#646cff" : "#D6D6DA",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#535bf2", //isSelected ? "#535bf2" : "#F53",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    //   pressed: {
                    //     fill: "#E42",
                    //     stroke: "#FFFFFF",
                    //     strokeWidth: 0.5,
                    //     outline: "none",
                    //   },
                    }}
                  />
                );
              })
            }
          </Geographies>
          <Geographies geography={tinyGeoUrl}>
            {({ geographies, projection }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo);
                const [centroid_x, centroid_y] = getCentroid(geo);
                const [cx, cy] = projection([centroid_x, centroid_y]);

                return (
                  <circle
                    key={geo.rsmKey}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="red"
                    stroke="#fff"
                    strokeWidth={0.5}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      cursor: "pointer"
                    }}
                  />
                )
            })}
          </Geographies>
        </ComposableMap>
    )
}