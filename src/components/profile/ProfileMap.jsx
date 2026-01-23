import React, { useState } from 'react';
import { BaseMap } from '../base/BaseMap.jsx';

/**
 * Map component for profile page showing country statistics
 * @param {Object} props
 * @param {Object} props.countryStats - Country statistics object keyed by country code
 */
export function ProfileMap({ countryStats }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  
  // color country based on state
  const getCountryStyle = (countryCode) => {
    const hasData = countryStats && countryStats[countryCode];
    const isSelected = countryCode === selectedCountry;
    const isHovered = countryCode === hoveredCountry;
    
    if (isSelected) {
      return {
        fill: 'var(--color-selected)',
        stroke: 'var(--color-selected-outline)',
        strokeWidth: 0.5,
        outline: 'none',
      };
    }
    
    if (isHovered) {
      return {
        fill: hasData ? 'var(--color-hover)' : 'var(--map-default)',
        stroke: hasData ? 'var(--color-hover-outline)' : 'var(--map-default-outline)',
        strokeWidth: 0.5,
        outline: 'none',
      };
    }

    return {
      fill: hasData ? 'var(--color-correct)' : 'var(--map-default)',
      stroke: hasData ? 'var(--color-correct-outline)' : 'var(--map-default-outline)',
      strokeWidth: 0.3,
      outline: 'none',
      opacity: hasData ? 0.7 : 0.4,
    };
  };

  const handleCountryClick = (geo) => {
    const countryCode = getCountryCode(geo);
    if (countryCode) {
      setSelectedCountry(countryCode === selectedCountry ? null : countryCode);
    }
  };

  const onMouseEnter = (countryCode) => {
    setHoveredCountry(countryCode);
  };
  const onMouseLeave = () => {
    setHoveredCountry(null);
  };

  const getSmallCountryPriority = (countryCode) => {
    if (selectedCountry === countryCode) {
      return 1;
    }
    return 0;
  };
  
  return (
    <div className={`profile-mapworld-map`}>
      <BaseMap
        onCountryHover={onMouseEnter}
        onCountryHoverLeave={onMouseLeave}
        onCountryClick={handleCountryClick}
        getCountryStyle={getCountryStyle}
        getSmallCountryPriority={getSmallCountryPriority}
        disabled={false}
        className="world-map__base-map"
        initialView={defaultViewWindow}
        showGraticule={true}
      />
    </div>
  );
}
