/**
 * Profile page component displaying daily challenge statistics from local storage
 */
import React, { useEffect } from 'react';
import { useApp } from '@/state/AppProvider.jsx';
import { ScoreTimeline } from './components/ScoreTimeline.jsx';
import { DailyChallengeModalityMatrix } from './components/DailyChallengeModalityMatrix.jsx';
import { ProfileMap } from './components/ProfileStatsMap/ProfileMap.jsx';
import './ProfilePage.css';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { calculateAverageChallengePerformance, calculateLearningRateCoverage } from '@/utils/statsService.js';


export function ProfilePage() {
  const { userData, userDataLoading, refetchUserData } = useApp();

  useEffect(() => {
    refetchUserData();
  }, []);

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

//   const dataModeToggle = () => {
//     const [profileDataMode, setProfileDataMode] = React.useState('dailyChallenge');

//     const handleProfileDataMode = (event, newProfileDataMode) => {
//       setProfileDataMode(newProfileDataMode);
//     };

//   return (
//     <ToggleButtonGroup
//       value={profileDataMode}
//       exclusive
//       color="secondary"
//       onChange={handleProfileDataMode}
//       aria-label="profile data mode"
//     >
//       <ToggleButton value="dailyChallenge" aria-label="daily challenge">
//         Daily challenge
//       </ToggleButton>
//       <ToggleButton value="learningRate" aria-label="learning rate">
//         Learning rate
//       </ToggleButton>
//     </ToggleButtonGroup>
//   );
// }
  const averageChallengePerformance = calculateAverageChallengePerformance(userData.dailyChallenge.fullEntries);
  const learningRateCoverage = calculateLearningRateCoverage(userData.countries);

  return (
    <div className="profile-page">
      {/* <div className="profile-page__header">
        <h1 className="profile-page__title">User profile</h1>
      </div> */}
      {dataModeToggle()}
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
              <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', justifyContent: 'center' }}>
        <Card sx={{width: '30%'}}>
          <CardHeader 
          title="🔥" 
          subheader="Challenge streak" 
          slotProps={{subheader: {variant: 'subtitle2'}}} 
          sx={{padding: '1rem 0.5rem 0.5rem 0.5rem'}}
          />
          <CardContent sx={{margin: '0', padding: '0'}}>
            {userData.dailyChallenge.streak.current} days
          </CardContent>
        </Card>
        <Card sx={{width: '40%'}}>
          <CardHeader 
          title="🎯" subheader="Average challenge score" slotProps={{subheader: {variant: 'subtitle2'}}} 
          sx={{padding: '1rem 0.5rem 0.5rem 0.5rem'}}
          />
            <CardContent sx={{margin: '0', padding: '0'}}>
              Score: {averageChallengePerformance.score}<br />
              Skill score: {averageChallengePerformance.skillScore}
          </CardContent>
        </Card>
        <Card sx={{width: '30%'}}>
          <CardHeader 
          title="🌍" subheader="Learned countries" slotProps={{subheader: {variant: 'subtitle2'}}} 
          sx={{padding: '1rem 0.5rem 0.5rem 0.5rem'}}
          />
          <CardContent sx={{margin: '0', padding: '0'}}>
            {(learningRateCoverage * 100).toFixed(0)}%
          </CardContent>
        </Card>
    </div>
    {/* <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', justifyContent: 'center' }}>
      <Card sx={{width: '100%'}}>
        <CardContent>
          Badges coming soon
        </CardContent>
      </Card>
    </div> */}
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
