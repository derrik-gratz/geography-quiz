import React, { useState, useEffect } from 'react';
import countryData from '@/data/country_data.json';
import './CountryTextEntry.css';
import AutoComplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material/Autocomplete';


export function CountryTextEntry({
  value,
  // onValueChange,
  // onCountryClick,
  // onCountryHover,
  // onCountryHoverLeave,
  // getSuggestionClassName,
  // disabled,
  handleChange,
  disabled,
  getSuggestionPriority,
  defaultText,
  // allowSuggestions,
}) {
  // const [internalInput, setInternalInput] = useState(value || '');
  // const [suggestions, setSuggestions] = useState([]);
  // const [internalShowSuggestions, setInternalShowSuggestions] = useState(false);

  // Use controlled value if provided, otherwise use internal state
  // const inputValue = value ? value : internalInput;

  // showSuggestions is true only if allowSuggestions is true AND we have suggestions to show
  // const showSuggestions =
  //   allowSuggestions && internalShowSuggestions && suggestions.length > 0;

  // Sync internal state with controlled value
  // useEffect(() => {
  //   if (value !== undefined) {
  //     setInternalInput(value);
  //   }
  // }, [value]);

  // useEffect(() => {
  //   if (disabled) {
  //     setSuggestions([]);
  //     setInternalShowSuggestions(false);
  //   }
  // }, [disabled]);

  // Reset internal show state when allowSuggestions becomes false
  // useEffect(() => {
  //   if (!allowSuggestions) {
  //     setInternalShowSuggestions(false);
  //   }
  // }, [allowSuggestions]);

  const normalizeText = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // const handleChange = (event, value) => {


  // const handleChange = (e) => {
  //   const newValue = e.target.value;

  //   // Update internal state
  //   setInternalInput(newValue);

  //   // Notify parent of value change
  //   if (onValueChange) {
  //     onValueChange(newValue);
  //   }

  //   // Filter and show suggestions
  //   if (newValue.length > 0) {
  //     const normalizedInput = normalizeText(newValue);
  //     let filtered = countryData.filter((c) => {
  //       const allAliases = [
  //         c.country,
  //         ...(Array.isArray(c.aliases) ? c.aliases : []),
  //       ].filter(Boolean);
  //       const matches = allAliases
  //         .map((name) => normalizeText(name))
  //         .some((name) => name.includes(normalizedInput));
  //       return matches;
  //     });

  //     // Apply custom sorting if provided
  //     if (getSuggestionPriority) {
  //       filtered = filtered.sort((a, b) => getSuggestionPriority(a, b));
  //     }

  //     filtered = filtered.slice(0, 10);
  //     setSuggestions(filtered);

  //     // Only show suggestions if allowed
  //     if (allowSuggestions) {
  //       setInternalShowSuggestions(true);
  //     }
  //   } else {
  //     setSuggestions([]);
  //     setInternalShowSuggestions(false);
  //   }
  // };

  // const handleFocus = () => {
  //   if (
  //     inputValue.length > 0 &&
  //     suggestions.length > 0 &&
  //     allowSuggestions !== false
  //   ) {
  //     setInternalShowSuggestions(true);
  //   }
  // };

  // const handleBlur = () => {
  //   setTimeout(() => {
  //     setInternalShowSuggestions(false);
  //   }, 100);
  // };

  //   const handleSuggestionClick = (country) => {
  //     if (onCountryClick) {
  //       onCountryClick(country);
  //     }
  //   };

  const customFiler = (options, { inputValue }) => {
    const normalizedInput = normalizeText(inputValue);
    return options.filter((option) => {
      return normalizeText(option.country).includes(normalizedInput) || option.aliases.some((alias) => normalizeText(alias).includes(normalizedInput));
    });
  };
  return (
    <AutoComplete
      options={countryData} //.map((country) => country.country + country.aliases.join(', '))}
      getOptionLabel={(option) => option.country}
      onChange={(event, value) => {
        handleChange(value);
      }}
      // isOptionEqualToValue={(option, value) => (option.country === value.country || option.aliases.includes(value.country)}
      sx={{
        width: '90%',
        backgroundColor: 'white',
        borderRadius: '4px',
      }}
      filterOptions={customFiler}
      disabled={disabled}
      renderOption={(props, option) => (
        <li {...props}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>{option.country}</div>
          {option.aliases && option.aliases.length > 0 && (
            <div className="country-text-entry__suggestion-aliases" style={{ paddingLeft: '1rem' }}>
              ({Array.isArray(option.aliases) ? option.aliases.join(', ') : option.aliases})
            </div>
          )}
          </div>
        </li>
      )}
      renderInput={(params) => <TextField {...params} placeholder={defaultText || 'Type a country...'} />}
    />
  )

  // return (
  //   <div className="country-text-entry">
  //     <input
  //       className="country-text-entry__input"
  //       type="text"
  //       value={inputValue}
  //       onChange={handleChange}
  //       placeholder={defaultText || 'Type a country name...'}
  //       disabled={disabled}
  //       onFocus={handleFocus}
  //       onBlur={handleBlur}
  //     />
  //     {showSuggestions && (
  //       <ul className="country-text-entry__suggestions">
  //         {suggestions.map((country) => (
  //           <li
  //             key={country.code}
  //             className={`country-text-entry__suggestion-item ${getSuggestionClassName(country)}`}
  //             onMouseDown={() => onCountryClick(country)}
  //             // style={getSuggestionItemStyle(country)}
  //             onMouseEnter={() => onCountryHover(country)}
  //             onMouseLeave={() => onCountryHoverLeave()}
  //           >
  //             <div>{country.country}</div>
  //             {country.aliases && country.aliases.length > 0 && (
  //               <div className="country-text-entry__suggestion-aliases">
  //                 Aliases:{' '}
  //                 {Array.isArray(country.aliases)
  //                   ? country.aliases.join(', ')
  //                   : country.aliases}
  //               </div>
  //             )}
  //           </li>
  //         ))}
  //       </ul>
  //     )}
  //   </div>
  // );
}
