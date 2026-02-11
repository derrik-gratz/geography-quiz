import { SelectedCountryModalityMatrix } from './SelectedCountryModalityMatrix.jsx';
import allCountryData from '@/data/country_data.json';
import './SelectedCountryDisplay.css';

export function SelectedCountryDisplay({
  selectedCountry,
  countryStats,
  displayMode,
}) {
  const dailyChallengeDataAvailable =
    selectedCountry && countryStats[selectedCountry] !== undefined
      ? (() => {
          const matrix = countryStats[selectedCountry].matrix;
          if (!matrix) return false;

          // Check if any cell has any scores
          return matrix.some((row) =>
            row?.some((cell) => cell && cell.length > 0),
          );
        })()
      : false;

  const learningRateDataAvailable =
    selectedCountry &&
    countryStats[selectedCountry] !== undefined &&
    countryStats[selectedCountry].lastChecked !== undefined;

  const displayModeText =
    displayMode === 'dailyChallengeAccuracy'
      ? 'daily challenge accuracy'
      : displayMode === 'dailyChallengePrecision'
        ? 'daily challenge skill score'
        : 'learning rate';
  let displayText = '';
  if (!selectedCountry) {
    displayText = 'Select a country for extended stats';
  } else if (
    (displayMode === 'dailyChallengeAccuracy' &&
      !dailyChallengeDataAvailable) ||
    (displayMode === 'dailyChallengePrecision' &&
      !dailyChallengeDataAvailable) ||
    (displayMode === 'learningRate' && !learningRateDataAvailable)
  ) {
    displayText = `No ${displayModeText} data for this country`;
  } else {
    displayText = `${displayModeText} performance`;
  }

  const countryData = allCountryData.find(
    (country) => country.code === selectedCountry,
  );
  const countryFlag = countryData ? (
    <span
      className={`selected-country-display__flag fi fi-${countryData.flagCode.toLowerCase()}`}
    />
  ) : (
    ''
  );
  const countryName = countryData ? (
    <span className="selected-country-display__name">{`${countryData.country}`}</span>
  ) : (
    ''
  );
  return (
    <div className="selected-country-display">
      <div className="selected-country-display__header">
        <div className="selected-country-display__info">
          {countryFlag}
          {countryName}
        </div>
        <div className="selected-country-display__header-text">
          {displayText}
        </div>
      </div>
      <div className="selected-country-display__body">
        {(displayMode === 'dailyChallengeAccuracy' ||
          displayMode === 'dailyChallengePrecision') &&
          dailyChallengeDataAvailable && (
            <SelectedCountryModalityMatrix
              userCountryData={countryStats[selectedCountry]}
              mode={
                displayMode === 'dailyChallengeAccuracy'
                  ? 'accuracy'
                  : displayMode === 'dailyChallengePrecision'
                    ? 'precision'
                    : ''
              }
            />
          )}
        {displayMode === 'learningRate' && learningRateDataAvailable && (
          <div className="selected-country-display__body-text">
            Learning rate: {countryStats[selectedCountry].learningRate} days{' '}
            <br /> Last checked: {countryStats[selectedCountry].lastChecked}
          </div>
        )}
      </div>
    </div>
  );
}
