/**
 * Profile page component displaying daily challenge statistics from local storage
 */
import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { loadAllUserData, getUserMetadata } from '../../services/storageService.js';
import { calculateOverallStats } from '../../services/statsService.js';
import { StatsCard, StatItem, ProgressBar } from './StatsCard.jsx';
import { getModalityName } from '../../types/dataSchemas.js';
import allCountryData from '../../data/country_data.json';
import { ProfileMap } from './ProfilePage/ProfileMap.jsx';
import { ScoreTimeline } from './ScoreTimeline.jsx';
import './ProfilePage.css';



// /**
//  * Map component for profile page showing country statistics
//  * @param {Object} props
//  * @param {Object} props.countryStats - Country statistics object keyed by country code
//  */
// function CountryStatsMap({ countryStats }) {
//   const [selectedCountry, setSelectedCountry] = useState(null);
//   const [hoveredCountry, setHoveredCountry] = useState(null);
//   const [viewWindow, setViewWindow] = useState({ coordinates: [0, 0], zoom: 1 });
//   const [resetKey, setResetKey] = useState(0);

//   const resetView = () => {
//     setViewWindow({ coordinates: [0, 0], zoom: 1 });
//     setResetKey(prev => prev + 1);
//   };

//   const handleCountryClick = (geo) => {
//     const countryCode = getCountryCode(geo);
//     if (countryCode) {
//       setSelectedCountry(countryCode === selectedCountry ? null : countryCode);
//     }
//   };

//   const getCountryStyle = (countryCode) => {
//     const hasData = countryStats && countryStats[countryCode];
//     const isSelected = countryCode === selectedCountry;
//     const isHovered = countryCode === hoveredCountry;
    
//     if (isSelected) {
//       return {
//         fill: 'var(--color-selected)',
//         stroke: 'var(--color-selected-outline)',
//         strokeWidth: 0.5,
//         outline: 'none',
//       };
//     }
    
//     if (isHovered) {
//       return {
//         fill: hasData ? 'var(--color-hover)' : 'var(--map-default)',
//         stroke: hasData ? 'var(--color-hover-outline)' : 'var(--map-default-outline)',
//         strokeWidth: 0.5,
//         outline: 'none',
//       };
//     }

//     return {
//       fill: hasData ? 'var(--color-correct)' : 'var(--map-default)',
//       stroke: hasData ? 'var(--color-correct-outline)' : 'var(--map-default-outline)',
//       strokeWidth: 0.3,
//       outline: 'none',
//       opacity: hasData ? 0.7 : 0.4,
//     };
//   };

//   const selectedCountryData = selectedCountry && countryStats && countryStats[selectedCountry];
//   const selectedCountryInfo = selectedCountry ? allCountryData.find(c => c.code === selectedCountry) : null;

//   return (
//     <div className="country-stats-map">
//       <div className="country-stats-map__header">
//         <div className="country-stats-map__legend">
//           <div className="country-stats-map__legend-item">
//             <span className="country-stats-map__legend-color" style={{ backgroundColor: 'var(--color-correct)' }}></span>
//             <span>Has data</span>
//           </div>
//           <div className="country-stats-map__legend-item">
//             <span className="country-stats-map__legend-color" style={{ backgroundColor: 'var(--map-default)', opacity: 0.4 }}></span>
//             <span>No data</span>
//           </div>
//         </div>
//         <button
//           onClick={resetView}
//           className="country-stats-map__reset-btn"
//         >
//           Reset View
//         </button>
//       </div>
//       <div className="country-stats-map__container">
//         <ComposableMap
//           projection="geoEqualEarth"
//           projectionConfig={{ scale: 147 }}
//           style={{ width: '100%', height: '100%' }}
//         >
//           <ZoomableGroup
//             key={resetKey}
//             center={viewWindow.coordinates}
//             maxZoom={12}
//             zoom={viewWindow.zoom}
//             onMoveEnd={({ zoom, coordinates }) => {
//               setViewWindow({ coordinates, zoom });
//             }}
//           >
//             <Geographies geography={mainGeoUrl}>
//               {({ geographies }) =>
//                 geographies.map((geo) => {
//                   const countryCode = getCountryCode(geo);
//                   if (!countryCode) return null;
                  
//                   const style = getCountryStyle(countryCode);
                  
//                   return (
//                     <Geography
//                       key={geo.rsmKey}
//                       geography={geo}
//                       fill={style.fill}
//                       stroke={style.stroke}
//                       strokeWidth={style.strokeWidth}
//                       style={{
//                         default: style,
//                         hover: style,
//                         pressed: style,
//                         outline: 'none',
//                       }}
//                       onClick={() => handleCountryClick(geo)}
//                       onMouseEnter={() => setHoveredCountry(countryCode)}
//                       onMouseLeave={() => setHoveredCountry(null)}
//                     />
//                   );
//                 })
//               }
//             </Geographies>
//           </ZoomableGroup>
//         </ComposableMap>
//       </div>
//       {selectedCountryData && selectedCountry && (
//         <div className="country-stats-map__details">
//           <h3 className="country-stats-map__details-title">
//             {selectedCountryInfo?.country || selectedCountry}
//           </h3>
//           <ModalityMatrixDisplay matrix={selectedCountryData.matrix} />
//         </div>
//       )}
//     </div>
//   );
// }

/**
 * Display component for the 3x3 modality matrix
 * @param {Object} props
 * @param {Array} props.matrix - 3x3 modality matrix
 */
function ModalityMatrixDisplay({ matrix }) {
  if (!matrix) {
    return <div>No matrix data available</div>;
  }

  const modalityLabels = ['Name', 'Flag', 'Map'];

  return (
    <div className="modality-matrix">
      <div className="modality-matrix__header">
        <div className="modality-matrix__header-cell"></div>
        {modalityLabels.map((label, idx) => (
          <div key={idx} className="modality-matrix__header-cell">
            Prompted: {label}
          </div>
        ))}
      </div>
      {/* Matrix is [input][prompted], so we iterate over input (rows) first */}
      {modalityLabels.map((inputLabel, inputIdx) => (
        <div key={inputIdx} className="modality-matrix__row">
          <div className="modality-matrix__row-header">
            Input: {inputLabel}
          </div>
          {/* Then iterate over prompted (columns) */}
          {modalityLabels.map((promptedLabel, promptedIdx) => {
            const cell = matrix[inputIdx] && matrix[inputIdx][promptedIdx];
            if (!cell) return null;
            
            return (
              <div key={promptedIdx} className="modality-matrix__cell">
                <div className="modality-matrix__cell-content">
                  <div className="modality-matrix__cell-section">
                    <strong>Testing:</strong>
                    {cell.testing && cell.testing.length > 0 ? (
                      <div className="modality-matrix__scores">
                        {cell.testing.map((score, i) => (
                          <span key={i} className="modality-matrix__score">
                            {score.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="modality-matrix__empty">No data</div>
                    )}
                  </div>
                  <div className="modality-matrix__cell-section">
                    <strong>Learning:</strong>
                    <div className="modality-matrix__learning">
                      {cell.learning.lastCorrect ? (
                        <div>Last correct: {cell.learning.lastCorrect}</div>
                      ) : (
                        <div className="modality-matrix__empty">No data</div>
                      )}
                      {cell.learning.learningRate !== null && (
                        <div>Rate: {cell.learning.learningRate}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [userMetadata, setUserMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [data, metadata] = await Promise.all([
        loadAllUserData(),
        getUserMetadata()
      ]);
      
      setUserData(data);
      setUserMetadata(metadata);
      
      // Calculate statistics
      const stats = calculateOverallStats(data);
      setStatistics(stats);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError('Failed to load profile data');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-page__error">{error}</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="profile-page">
        <div className="profile-page__empty">
          <h2>Profile</h2>
          <p>You haven't completed any daily challenges yet. Complete a daily challenge to see your statistics here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Daily Challenge Statistics</h1>
        {userMetadata && (
          <p className="profile-page__metadata">
            Tracking since {formatDate(new Date(userMetadata.createdAt).toISOString().split('T')[0])}
          </p>
        )}
      </div>

      <div className="profile-page__content">
        <StatsCard title="Streaks">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <StatItem label="Current Streak" value={statistics.streak.current} unit=" days" />
            <StatItem label="Longest Streak" value={statistics.streak.longest} unit=" days" />
          </div>
        </StatsCard>

        {statistics.perModality && (
          <StatsCard title="Accuracy by Modality">
            <div style={{ maxWidth: '500px' }}>
              <ProgressBar
                value={statistics.perModality.name?.accuracy || 0}
                label="Name"
                showValue={true}
              />
              <ProgressBar
                value={statistics.perModality.flag?.accuracy || 0}
                label="Flag"
                showValue={true}
              />
              <ProgressBar
                value={statistics.perModality.map?.accuracy || 0}
                label="Map"
                showValue={true}
              />
            </div>
          </StatsCard>
        )}

        {statistics.scoreOverTime && statistics.scoreOverTime.length > 0 && (
          <StatsCard title="Recent Daily Challenges">
            <div className="profile-page__recent-list">
              {statistics.scoreOverTime.slice(-10).reverse().map((entry, index) => (
                <div key={index} className="profile-page__recent-item">
                  <div className="profile-page__recent-date">
                    {formatDate(entry.date)}
                  </div>
                  <div className="profile-page__recent-score">
                    Score: {entry.score.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </StatsCard>
        )}

        {userData?.dailyChallenge?.scoreLog && userData.dailyChallenge.scoreLog.length > 0 && (
          <StatsCard title="Score Timeline">
            <ScoreTimeline scoreLog={userData.dailyChallenge.scoreLog} />
          </StatsCard>
        )}

        {userData?.countries && Object.keys(userData.countries).length > 0 && (
          <StatsCard title="Country Statistics Map">
            <ProfileMap countryStats={userData.countries} />
          </StatsCard>
        )}

        {(!userData || !userData.dailyChallenge || !userData.dailyChallenge.scoreLog || userData.dailyChallenge.scoreLog.length === 0) && (
          <div className="profile-page__empty-state">
            <p>You haven't completed any daily challenges yet. Start a daily challenge to see your statistics here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
