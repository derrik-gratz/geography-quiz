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

export function FlagSelect({ onSelect, displayCountries, incorrectCountries = [], correctCountries = [], disabled = false }) {
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    
    const handleFlagClick = (country) => {
        if (!disabled && !incorrectCountries.includes(country.code) && correctCountries.length === 0) {
            setSelectedCountry(country);
        }
    };

    // Reset when disabled (new prompt type) or when correct countries are submitted
    React.useEffect(() => {
        if (disabled || correctCountries.length > 0) {
            setSelectedCountry(null);
        }
    }, [disabled, correctCountries.length]);

    const handleSubmit = () => {
        if (selectedCountry && onSelect && correctCountries.length === 0) {
            onSelect(selectedCountry);
        }
        setSelectedCountry(null);
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

    const getFlagClassName = (country) => {
        let className = `flag-icon fi fi-${country.flagCode.toLowerCase()}`;
        
        if (selectedCountry?.code === country.code) {
            className += ' selected';
        }
        if (correctCountries.includes(country.code)) {
            className += ' correct';
        }
        if (incorrectCountries.includes(country.code)) {
            className += ' incorrect';
        }
        if (correctCountries.length > 0) {
            className += ' disabled';
        }
        
        return className;
    };

    return (
        <div className="flag-select">
            <div className="color-picker">
                <button
                    onClick={handleSubmit}
                    disabled={!selectedCountry || disabled || correctCountries.length > 0}
                    style={{
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: `1px solid ${selectedCountry && !disabled && correctCountries.length === 0 ? 'var(--color-selected)' : 'var(--color-disabled)'}`,
                        backgroundColor: selectedCountry && !disabled && correctCountries.length === 0 ? 'var(--color-selected)' : 'var(--color-disabled-bg)',
                        color: selectedCountry && !disabled && correctCountries.length === 0 ? '#fff' : 'var(--color-disabled)',
                        cursor: selectedCountry && !disabled && correctCountries.length === 0 ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap',
                        marginLeft: '10px'
                    }}
                >
                    Submit Flag
                </button>
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
                        className={getFlagClassName(country)}
                        onClick={() => handleFlagClick(country)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${country.name || country.code} flag`}
                        style={{
                            opacity: disabled || incorrectCountries.includes(country.code) || correctCountries.length > 0 ? 0.6 : 1,
                            cursor: disabled || incorrectCountries.includes(country.code) || correctCountries.length > 0 ? 'not-allowed' : 'pointer'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}