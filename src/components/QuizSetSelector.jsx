import React, { useState } from 'react';
import quizSets from '../data/quizSets.json';
import comprehensiveCountries from '../data/comprehensiveCountries.json';

function QuizSetSelector({ onSetChange, currentSet = null, isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);

  // Create a mapping from country codes to names for display
  const countryCodeToName = {};
  comprehensiveCountries.forEach(country => {
    countryCodeToName[country.code] = country.name;
  });

  // Get all available sets
  const availableSets = Object.entries(quizSets.sets).map(([key, set]) => ({
    key,
    ...set,
    countryCount: set.countries.length
  }));

  const handleSetSelect = (setKey) => {
    onSetChange(setKey);
    setIsOpen(false);
  };

  const currentSetData = currentSet ? quizSets.sets[currentSet] : null;

  // Mobile dropdown mode
  if (isMobile) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Mobile Current Set Display */}
        <div style={{
          padding: '0.25rem 0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
        }}
        onClick={() => setIsOpen(!isOpen)}
        >
          <div style={{ color: '#333', fontWeight: 'bold' }}>
            {currentSetData ? currentSetData.name : 'All Countries'}
          </div>
          <span style={{ fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {/* All Countries Option */}
            <div
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: !currentSet ? '#f0f8ff' : 'transparent',
                fontSize: '0.8rem',
              }}
              onClick={() => handleSetSelect(null)}
            >
              <div style={{ fontWeight: 'bold', color: '#333' }}>All Countries</div>
            </div>

            {/* Quiz Sets */}
            {availableSets.map((set) => (
              <div
                key={set.key}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: currentSet === set.key ? '#f0f8ff' : 'transparent',
                  fontSize: '0.8rem',
                }}
                onClick={() => handleSetSelect(set.key)}
              >
                <div style={{ fontWeight: 'bold', color: '#333' }}>{set.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Desktop mode (original implementation)
  return (
    <div style={{ position: 'relative' }}>
      {/* Current Set Display */}
      <div style={{
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <div style={{ fontWeight: 'bold', color: '#333' }}>
            {currentSetData ? currentSetData.name : 'All Countries'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            {currentSetData ? `${currentSetData.countries.length} countries` : 'All available countries'}
          </div>
        </div>
        <span style={{ fontSize: '1.2rem' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {/* All Countries Option */}
          <div
            style={{
              padding: '0.75rem',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              backgroundColor: !currentSet ? '#f0f8ff' : 'transparent',
            }}
            onClick={() => handleSetSelect(null)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
            onMouseLeave={(e) => e.target.style.backgroundColor = !currentSet ? '#f0f8ff' : 'transparent'}
          >
            <div style={{ fontWeight: 'bold', color: '#333' }}>All Countries</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              All available countries
            </div>
          </div>

          {/* Quiz Sets */}
          {availableSets.map((set) => (
            <div
              key={set.key}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: currentSet === set.key ? '#f0f8ff' : 'transparent',
              }}
              onClick={() => handleSetSelect(set.key)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = currentSet === set.key ? '#f0f8ff' : 'transparent'}
            >
              <div style={{ fontWeight: 'bold', color: '#333' }}>{set.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                {set.description} • {set.countryCount} countries
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default QuizSetSelector; 