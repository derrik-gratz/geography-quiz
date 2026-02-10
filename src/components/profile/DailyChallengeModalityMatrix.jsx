import { ModalityHeatmap } from '@/components/base/ModalityHeatmap.jsx';
import { calculatePerModalityStats } from '@/services/statsService.js';
import './DailyChallengeModalityMatrix.css';
/**
 * ModalityMatrix component
 * Displays a 3x3 heatmap showing accuracy for each input/prompted modality combination
 *
 * @param {Object} props
 * @param {Object} props.userData - User data object containing country statistics
 */
export function DailyChallengeModalityMatrix({ userCountryData }) {
  // Melt to long format
  const modalityMatrix = calculatePerModalityStats(userCountryData);
  const plotData = [];
  const modalityLabels = ['Name', 'Flag', 'Location'];

  for (let inputIdx = 0; inputIdx < 3; inputIdx++) {
    for (let promptedIdx = 0; promptedIdx < 3; promptedIdx++) {
      const cell =
        modalityMatrix[inputIdx] && modalityMatrix[inputIdx][promptedIdx];
      if (!cell) continue;

      const accuracy = typeof cell.accuracy === 'number' ? cell.accuracy : NaN;
      const precision =
        typeof cell.precision === 'number' ? cell.precision : NaN;

      plotData.push({
        x: modalityLabels[promptedIdx],
        y: modalityLabels[inputIdx],
        value: accuracy,
        precision: precision,
      });
    }
  }

  if (!plotData) {
    return (
      <div className="modality-matrix__empty">
        No modality matrix data available
      </div>
    );
  }
  return (
    <div className="daily-challenge-modality-matrix">
      <ModalityHeatmap plotData={plotData} />
    </div>
  );
}
