/**
 * Profile page component displaying daily challenge statistics from local storage
 */
import React from 'react';
import { useApp } from '@/state/AppProvider.jsx';
import { ScoreTimeline } from './components/ScoreTimeline.jsx';
import { DailyChallengeModalityMatrix } from './components/DailyChallengeModalityMatrix.jsx';
import { ProfileMap } from './components/ProfileStatsMap/ProfileMap.jsx';
import './ProfilePage.css';

export function ProfilePage() {
  const { userData, userDataLoading } = useApp();

  if (userDataLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">Loading profile...</div>
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
  const streakDisplay =
    userData.dailyChallenge.streak.current >= 5
      ? '🔥'
      : userData.dailyChallenge.streak.current >= 10
        ? '🔥🔥'
        : userData.dailyChallenge.streak.current >= 25
          ? '🥵'
          : userData.dailyChallenge.streak.current >= 50
            ? '🤯'
            : userData.dailyChallenge.streak.current >= 75
              ? '😱'
              : userData.dailyChallenge.streak.current >= 100
                ? '👑'
                : '';

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">User profile</h1>
      </div>
      {!userData || userData.dailyChallenge.fullEntries.length === 0 ? (
        <div className="profile-page__empty-state">
          <p>
            You haven't completed any daily challenges yet. Start a daily
            challenge to see your statistics here!
          </p>
        </div>
      ) : (
        <div
          className="profile-page__content"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <h4>Daily challenge performance</h4>
          <div style={{ justifyContent: 'center' }}>
            <span>
              Current streak: {userData.dailyChallenge.streak.current}
              {streakDisplay}
            </span>
          </div>
          <div className="profile-page__content-row">
            <ScoreTimeline userData={userData} />
            <DailyChallengeModalityMatrix
              userCountryData={userData.countries}
            />
          </div>
          <ProfileMap countryStats={userData.countries} />
        </div>
      )}
    </div>
  );
}
