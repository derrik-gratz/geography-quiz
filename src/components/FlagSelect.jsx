import React, { useState } from 'react';

/**
 * FlagSelect Component
 * 
 * Displays a grid of country flags for user selection
 * Returns country code when a flag is clicked
 * 
 * @param {Function} props.onSelect - Callback when a flag is selected
 * @param {Array} props.displayCountries - Array of countries to display
 * @returns {JSX.Element} Flag selection interface
 */

const availableColors = [
    { name: "red"   , color: "#FF0000" },
    { name: "white" , color: "#FFFFFF" },
    { name: "blue"  , color: "#0000FF" },
    { name: "green" , color: "#00FF00" },
    { name: "black" , color: "#000000" },
    { name: "yellow", color: "#FFFF00" },
    { name: "orange", color: "#ffa500" }
]

export function FlagSelect({ onSelect, displayCountries, incorrectCountries, clearHighlights }) {
    const [selectedColors, setSelectedColors] = useState([]);
    const handleFlagClick = (country) => {
        onSelect(country);
    };

    const handleColorClick = (color) => {
        setSelectedColors(prevColors => {
            if (prevColors.includes(color)) {
                return prevColors.filter(c => c !== color);
            }
            return [...prevColors, color];
        })
    }

    const filteredCountries = displayCountries.filter(country => {
        return selectedColors.length === 0 ?
            true :
            selectedColors.every(color => country.colors.includes(color));
    });

    return (
        <div className="flag-select">
            <div className="color-picker">
                <span className="color-filter">Filter by color:</span>
                {availableColors.map(color =>
                    <button 
                        key={color.name}
                        className={`color-filter-button ${selectedColors.includes(color.name) ? "selected" : ""}`}
                        onClick={() => handleColorClick(color.name)}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                    ></button>
                )}
            </div>
            <div className="flag-grid">
                {filteredCountries.map((country) => (
                    <span
                        key={country.code}
                        className={`flag-icon fi fi-${country.flagCode.toLowerCase()}`}
                        onClick={() => handleFlagClick(country)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${country.name || country.code} flag`}
                    />
                ))}
            </div>
        </div>
    );
}