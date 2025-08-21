import React from 'react';

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

const countryColorMap = {
    
}

export function FlagSelect({ onSelect, displayCountries }) {
    const handleFlagClick = (countryCode) => {
        onSelect(countryCode);
    };

    return (
        <div className="flag-select">
            <div className="flag-grid">
                {displayCountries.map((country) => (
                    <span
                        key={country.code}
                        className={`flag-icon fi fi-${country.flagCode.toLowerCase()}`}
                        onClick={() => handleFlagClick(country.flagCode)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${country.name || country.code} flag`}
                    />
                ))}
            </div>
        </div>
    );
}