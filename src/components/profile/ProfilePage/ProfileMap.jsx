import React, { useState } from 'react';
import { BaseMap } from '../../base/BaseMap/BaseMap.jsx';

/**
 * Map component for profile page showing country statistics
 * @param {Object} props
 * @param {Object} props.countryStats - Country statistics object keyed by country code
 */
export function ProfileMap({ countryStats }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  
  const getCountryClassName = (countryCode) => {
    const hasData = countryStats && countryStats[countryCode];
    const isSelected = countryCode === selectedCountry;
    const isHovered = countryCode === hoveredCountry;
    
    if (isSelected) {
      return 'profile-map__country_selected';
    }
    if (isHovered) {
      return 'profile-map__country_hovered';
    }
    if (hasData) {
      return 'profile-map__country_data';
    }
    return 'profile-map__country_no-data';
  }

  const handleCountryClick = (countryCode) => {
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
        getCountryClassName={getCountryClassName}
        getSmallCountryPriority={getSmallCountryPriority}
        disabled={false}
        className="world-map__base-map"
        initialView={defaultViewWindow}
        showGraticule={true}
      />
    </div>
  );
}
