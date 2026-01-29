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
import { ModalityMatrix } from './ModalityMatrix.jsx';
import './ProfilePage.css';


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

  console.log(perModalityStats);

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
        <ModalityMatrix userData={userData} />
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
