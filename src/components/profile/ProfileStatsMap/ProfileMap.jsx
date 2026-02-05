import React, { useState } from 'react';
import { BaseMap } from '../../base/BaseMap.jsx';
import { calculateCountryAccuracy, calculateCountryPrecision } from '../../../services/statsService.js';
import { SelectedCountryDisplay } from './SelectedCountryDisplay.jsx';
import './ProfileMap.css';

/**
 * Map component for profile page showing country statistics
 * @param {Object} props
 * @param {Object} props.countryStats - Country statistics object keyed by country code
 */
export function ProfileMap({ countryStats }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [defaultViewWindow, setDefaultViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
  const [displayMode, setDisplayMode] = useState('dailyChallengeAccuracy');
  
  const getCountryClassName = (countryCode) => {
    const hasData = countryStats && countryStats[countryCode];
    const isSelected = countryCode === selectedCountry;
    const isHovered = countryCode === hoveredCountry;
    let classes = 'profile-stats-map__country'
    if (isSelected) {
      classes += ' profile-stats-map__country_selected';
    }
    if (isHovered) {
      classes += ' profile-stats-map__country_hovered';
    }
    return classes;
    // if (hasData) {
    //   return 'profile-map__country_data';
    // }
    // return 'profile-map__country_no-data';
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
    if (hoveredCountry === countryCode) {
      return 1;
    }
    return 0;
  };
  
// Helper function to interpolate between two hex colors
const interpolateColor = (value, color1, color2, minValue = 0, maxValue = 1) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1; // Fallback if parsing fails

  // Use accuracy directly as interpolation factor (already 0-1)
  if (Number.isNaN(value)) {
    return 'var(--fill)';
  }
  let factor = (value - minValue) / (maxValue - minValue);
  factor = Math.max(0, Math.min(1, factor));
  // Interpolate each channel
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
};

const getCountryStyle = (countryCode) => {
  const avgAccuracy = calculateCountryAccuracy(countryStats[countryCode]);
  const avgPrecision = calculateCountryPrecision(countryStats[countryCode]);
  // Get computed CSS variable values
  const getComputedColor = (variable) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim() || '#000000';
  };

  const incorrectColor = getComputedColor('--color-incorrect');
  const correctColor = getComputedColor('--color-correct');
  
  // Clamp accuracy to 0-1 range
  // const clampedAccuracy = Math.max(0, Math.min(1, avgAccuracy || 0));
  // Interpolate: 0 = incorrect color, 1 = correct color
  // console.log(countryStats)
  let fillColor = 'var(--fill)';
  
  if (displayMode === 'dailyChallengeAccuracy') {
    fillColor = interpolateColor(avgAccuracy, incorrectColor, correctColor);
  } else if (displayMode === 'dailyChallengePrecision') {
    fillColor = interpolateColor(avgPrecision, incorrectColor, correctColor);
  } else if (displayMode === 'learningRate' && countryStats[countryCode]?.learningRate && countryStats[countryCode].lastChecked) {
    fillColor = interpolateColor(countryStats[countryCode].learningRate, incorrectColor, correctColor, 0, 64);
  } 
  return {
    default: {
      fill: countryCode === selectedCountry || countryCode === hoveredCountry ? 'var(--fill)': fillColor ,
      stroke: 'var(--stroke)',
      strokeWidth: 'var(--stroke-width)'
    },
    hover: {
      fill: 'var(--color-hover-outline)',
      stroke: 'var(--color-hover-outline)',
      strokeWidth: '0.8'
    }
  };
};
  const buttonBaseName = 'profile-stats-map__display-mode-selector-button';
  return (
    <div className={`profile-stats-map`}>
      {/* <div className="profile-stats-map__display-mode-selector">
        <button className={`${buttonBaseName} ${displayMode === 'dailyChallenge' ? `${buttonBaseName}-active` : ''}`} onClick={() => setDisplayMode('dailyChallenge')}>Daily challenge performance</button>
        <button className={`${buttonBaseName} ${displayMode === 'learningRate' ? `${buttonBaseName}-active` : ''}`} onClick={() => setDisplayMode('learningRate')}>Learning rate</button>
      </div> */}
      <div className="profile-stats-map__display">
        <div className="profile-stats-map__display-map">
          <BaseMap
            onCountryHover={onMouseEnter}
            onCountryHoverLeave={onMouseLeave}
            onCountryClick={handleCountryClick}
            getCountryClassName={getCountryClassName}
            getSmallCountryPriority={getSmallCountryPriority}
            getCountryStyle={getCountryStyle}
            disabled={false}
            className="world-map__base-map"
            initialView={defaultViewWindow}
            additionalControls={[
              <button className={`${buttonBaseName} ${displayMode === 'dailyChallengeAccuracy' ? `${buttonBaseName}-active` : ''}`} onClick={() => setDisplayMode('dailyChallengeAccuracy')}>Daily challenge accuracy</button>,
              <button className={`${buttonBaseName} ${displayMode === 'dailyChallengePrecision' ? `${buttonBaseName}-active` : ''}`} onClick={() => setDisplayMode('dailyChallengePrecision')}>Daily challenge precision</button>,
              <button className={`${buttonBaseName} ${displayMode === 'learningRate' ? `${buttonBaseName}-active` : ''}`} onClick={() => setDisplayMode('learningRate')}>Learning rate</button>
            ]}
            showGraticule={true}
          />
        </div>
        <div className="profile-stats-map__display-country-stats">
          <SelectedCountryDisplay selectedCountry={selectedCountry} countryStats={countryStats} displayMode={displayMode}/>
        </div>
      </div>
    </div>
  );
}
