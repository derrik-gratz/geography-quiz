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
import { DailyChallengeModalityMatrix } from './DailyChallengeModalityMatrix.jsx';
import { ProfileMap } from './ProfileStatsMap/ProfileMap.jsx';
import fakeUserData from '../../types/dummyUserData.js';
import './ProfilePage.css';


export function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [userMetadata, setUserMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Use dummy data for testing
      // setUserData(fakeUserData);
      // Optionally load real metadata
      const [data, metadata] = await Promise.all([
        loadAllUserData(),
        getUserMetadata()
      ]);
      setUserData(data);
      setUserMetadata(metadata);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError('Failed to load profile data');
      setIsLoading(false);
    }
  };


  // const perModalityStats = useMemo(() => {
  //   if (!userData) return null;
  //   return calculatePerModalityStats(userData);
  // }, [userData]);

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
  const streakDisplay = (
    userData.dailyChallenge.streak.current >= 5 ? '🔥' : 
    userData.dailyChallenge.streak.current >= 10 ? '🔥🔥' :
    userData.dailyChallenge.streak.current >= 25 ? '🥵' :
    userData.dailyChallenge.streak.current >= 50 ? '🤯' :
    userData.dailyChallenge.streak.current >= 75 ? '😱' :
    userData.dailyChallenge.streak.current >= 100 ? '👑' :
    ''
  );

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">User profile</h1>
      </div>
        {(!userData || userData.dailyChallenge.fullEntries.length === 0) ? (
          <div className="profile-page__empty-state">
            <p>You haven't completed any daily challenges yet. Start a daily challenge to see your statistics here!</p>
          </div>
        ) : (
          <div className="profile-page__content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4>Daily challenge performance</h4>
            <div style={{ justifyContent: 'center' }}>
              <span>Current streak: {userData.dailyChallenge.streak.current}{streakDisplay}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
              <ScoreTimeline userData={userData} />
              <DailyChallengeModalityMatrix userCountryData={userData.countries} />
            </div>
            <ProfileMap countryStats={userData.countries} />
          </div>
        )}
    </div>
  );
}
