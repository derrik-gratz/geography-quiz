import React from 'react';

function GuessTable({ guesses, currentPromptType }) {
  // Get unique countries from guesses
  const uniqueCountries = [...new Set(guesses.map(guess => guess.country))];
  
  // Create a map to track results for each country
  const countryResults = {};
  
  guesses.forEach(guess => {
    if (!countryResults[guess.country]) {
      countryResults[guess.country] = {
        name: guess.country,
        code: guess.countryCode,
        nameAttempts: [],
        flagAttempts: [],
        mapAttempts: []
      };
    }
    
    // Add attempt to appropriate category
    if (guess.promptType === 'text') {
      countryResults[guess.country].nameAttempts.push(guess.correct);
    } else if (guess.promptType === 'flag') {
      countryResults[guess.country].flagAttempts.push(guess.correct);
    } else if (guess.promptType === 'map') {
      countryResults[guess.country].mapAttempts.push(guess.correct);
    }
  });

  // Helper function to check if a country is solved (has at least one successful guess)
  const isCountrySolved = (country) => {
    const hasSuccessfulGuess = country.nameAttempts.some(attempt => attempt === true) ||
                              country.flagAttempts.some(attempt => attempt === true) ||
                              country.mapAttempts.some(attempt => attempt === true);
    return hasSuccessfulGuess;
  };

  // Helper function to check if a country should be revealed (solved or has attempts)
  const shouldRevealCountry = (country) => {
    const isSolved = isCountrySolved(country);
    const hasAnyAttempts = country.nameAttempts.length > 0 || 
                          country.flagAttempts.length > 0 || 
                          country.mapAttempts.length > 0;
    return isSolved || hasAnyAttempts;
  };

  // Helper function to get status symbol and count
  const getStatusDisplay = (attempts, promptType, countryName) => {
    if (attempts.length === 0) {
      // Check if this specific country had this field provided
      const hasProvidedField = guesses.some(guess => 
        guess.country === countryName && 
        guess.promptType === promptType && 
        guess.correct === null
      );
      if (hasProvidedField) {
        return '📋'; // Provided field indicator (no count)
      }
      return '⚪/0'; // No attempts
    }
    
    // Check if any attempt is null (provided field)
    const hasProvidedField = attempts.some(attempt => attempt === null);
    if (hasProvidedField) {
      return '📋'; // Provided field indicator (no count)
    }
    
    const lastAttempt = attempts[attempts.length - 1];
    const emoji = lastAttempt ? '✅' : '❌'; // Success or failure
    return `${emoji}/${attempts.length}`;
  };

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#f9f9f9',
      flex: '0 0 auto' // Don't grow or shrink
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Guess History</h3>
      
      {uniqueCountries.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No guesses recorded yet.</p>
      ) : (
        <div style={{ 
          overflowX: 'auto',
          maxHeight: '120px', // Reduced from 300px to 120px (40% of original)
          overflowY: 'auto' // Enable vertical scrolling
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
            minWidth: '400px' // Ensure minimum table width
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#646cff',
                color: 'white'
              }}>
                <th style={{
                  padding: '0.5rem',
                  textAlign: 'left',
                  border: '1px solid #ddd',
                  minWidth: '150px' // Ensure minimum column width
                }}>
                  Country
                </th>
                <th style={{
                  padding: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  minWidth: '80px'
                }}>
                  Name
                </th>
                <th style={{
                  padding: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  minWidth: '80px'
                }}>
                  Flag
                </th>
                <th style={{
                  padding: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  minWidth: '80px'
                }}>
                  Map
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(countryResults).reverse().map((country, index) => (
                <tr key={index} style={{
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f5f5f5',
                  color: '#000',
                }}>
                  <td style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    fontWeight: 'bold',
                    minWidth: '150px'
                  }}>
                    {shouldRevealCountry(country) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span 
                          className={`fi fi-${country.code.toLowerCase()}`}
                          style={{
                            fontSize: '1.2rem',
                            border: '1px solid #ddd',
                            borderRadius: '2px'
                          }}
                        />
                        <div>{country.name}</div>
                      </div>
                    ) : (
                      '???'
                    )}
                  </td>
                  <td style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    fontSize: '1.2rem',
                    minWidth: '80px'
                  }}>
                    {getStatusDisplay(country.nameAttempts, 'text', country.name)}
                  </td>
                  <td style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    fontSize: '1.2rem',
                    minWidth: '80px'
                  }}>
                    {getStatusDisplay(country.flagAttempts, 'flag', country.name)}
                  </td>
                  <td style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    fontSize: '1.2rem',
                    minWidth: '80px'
                  }}>
                    {getStatusDisplay(country.mapAttempts, 'map', country.name)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GuessTable; 