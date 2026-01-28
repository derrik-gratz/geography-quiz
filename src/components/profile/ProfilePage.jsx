/**
 * Profile page component displaying daily challenge statistics from local storage
 */
import React, { useState, useEffect, useMemo } from 'react';
import { loadAllUserData, getUserMetadata } from '../../services/storageService.js';
import { calculatePerModalityStats } from '../../services/statsService.js';
import { StatsCard } from './StatsCard.jsx';
import allCountryData from '../../data/country_data.json';
// import { ProfileMap } from './ProfilePage/ProfileMap.jsx';
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

export function ProfilePage() {
  const [userData, setUserData] = useState(null);
  // const [statistics, setStatistics] = useState(null);
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
      // const stats = calculateOverallStats(data);
      // setStatistics(stats);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError('Failed to load profile data');
      setIsLoading(false);
    }
  };

  const perModalityStats = useMemo(() => {
    if (!userData) return null;
    return calculatePerModalityStats(userData);
  }, [userData]);

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString + 'T00:00:00');
  //   return date.toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };

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

  // if (!statistics) {
  //   return (
  //     <div className="profile-page">
  //       <div className="profile-page__empty">
  //         <h2>Profile</h2>
  //         <p>You haven't completed any daily challenges yet. Complete a daily challenge to see your statistics here!</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Daily Challenge Statistics</h1>
        {/* {userMetadata && (
          <p className="profile-page__metadata">
            Tracking since {formatDate(new Date(userMetadata.createdAt).toISOString().split('T')[0])}
          </p>
        )} */}
      </div>

      <div className="profile-page__content">
        <p>Current Streak: {userData.dailyChallenge.streak.current} days</p>
        {/* <StatsCard title="Streaks">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <StatItem label="Current Streak" value={statistics.streak.current} unit=" days" />
            <StatItem label="Longest Streak" value={statistics.streak.longest} unit=" days" />
          </div>
        </StatsCard> */}
        <p>Accuracy by Modality:</p>
        <p>Name: {perModalityStats.name?.accuracy}%</p>
        <p>Flag: {perModalityStats.flag?.accuracy}%</p>
        <p>Location: {perModalityStats.location?.accuracy}%</p>

        {userData?.dailyChallenge?.fullEntries && userData.dailyChallenge.fullEntries.length > 0 && (
          <StatsCard title="Score Timeline">
            <ScoreTimeline userData={userData} />
          </StatsCard>
        )}

        {/* {userData?.countries && Object.keys(userData.countries).length > 0 && (
          <StatsCard title="Country Statistics Map">
            <ProfileMap countryStats={userData.countries} />
          </StatsCard>
        )} */}

        {(!userData || !userData.dailyChallenge || !userData.dailyChallenge.scoreLog || userData.dailyChallenge.scoreLog.length === 0) && (
          <div className="profile-page__empty-state">
            <p>You haven't completed any daily challenges yet. Start a daily challenge to see your statistics here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
