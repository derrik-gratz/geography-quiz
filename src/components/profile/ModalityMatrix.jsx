import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';
import { getModalityName } from '../../types/dataSchemas.js';
import { calculatePerModalityStats } from '../../services/statsService.js';
// import { calculateAverageSkillScore } from '../../services/statsService.js';
import './ModalityMatrix.css';

/**
 * ModalityMatrix component
 * Displays a 3x3 heatmap showing accuracy for each input/prompted modality combination
 * 
 * @param {Object} props
 * @param {Object} props.userData - User data object containing country statistics
 */
export function ModalityMatrix({ userData }) {
  const modalityMatrix = calculatePerModalityStats(userData);
  const plotRef = useRef(null);

  useEffect(() => {
    if (!modalityMatrix || !plotRef.current) {
      return;
    }

    // Get computed CSS variable values for theming
    const getComputedColor = (variable) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim() || '#000000';
    };

    const textColor = getComputedColor('--text-primary');
    const borderColor = getComputedColor('--border-color');
    const lowColor = getComputedColor('--color-incorrect');
    const highColor = getComputedColor('--color-correct');
    const unknownColor = getComputedColor('--color-disabled');

    // Melt to long format
    const plotData = [];
    const modalityLabels = ['Name', 'Flag', 'Location'];

    for (let inputIdx = 0; inputIdx < 3; inputIdx++) {
      for (let promptedIdx = 0; promptedIdx < 3; promptedIdx++) {
        const cell = modalityMatrix[inputIdx] && modalityMatrix[inputIdx][promptedIdx];
        if (!cell) continue;

        // After averaging, accuracy and percision should be numbers
        // Handle edge cases where they might still be arrays or undefined
        const accuracy = typeof cell.accuracy === 'number' ? cell.accuracy : NaN;
        const precision = typeof cell.percision === 'number' ? cell.percision : NaN;

        plotData.push({
          x: modalityLabels[promptedIdx],
          y: modalityLabels[inputIdx],
          value: accuracy,
          precision: precision
        });
      }
    }

    // Create the heatmap
    const chart = Plot.plot({
      width: 500,
      height: 400,
      marginTop: 60,
      marginRight: 60,
      marginBottom: 60,
      marginLeft: 80,
      x: {
        label: 'Prompted Modality',
        domain: modalityLabels,
        axis: 'top'
      },
      y: {
        label: 'Input Modality',
        domain: [...modalityLabels].reverse(), // Reverse to show Name at top
        axis: 'right'
      },
      color: {
        type: 'linear',
        range: [lowColor, highColor],
        unknown: unknownColor,
        domain: [0, 1],
        label: 'Accuracy (%)',
        legend: true,
        tickFormat: (d) => (d * 100).toFixed(0) + '%'
      },
      marks: [
        Plot.cell(plotData, {
          x: 'x',
          y: 'y',
          fill: 'value',
          stroke: borderColor,
          strokeWidth: 1,
          title: (d) => {
            const inputLabel = d.y;
            const promptedLabel = d.x;
            const accuracy = (d.value * 100).toFixed(1);
            const precision = (d.precision * 100).toFixed(1);
            return `${inputLabel} → ${promptedLabel}\nAccuracy: ${accuracy}%\nPrecision: ${precision}%`;
          }
        }),
        Plot.text(plotData, {
          x: 'x',
          y: 'y',
          text: (d) => d.value > 0 ? (d.value * 100).toFixed(0) + '%' : '',
          fill: textColor,
          fontSize: 14,
          fontWeight: 'bold'
        })
      ],
      style: {
        background: 'transparent',
        color: textColor,
        fontSize: '12px'
      }
    });

    // Clear previous plot and append new one
    plotRef.current.innerHTML = '';
    plotRef.current.appendChild(chart);

    // Cleanup function
    return () => {
      if (plotRef.current) {
        plotRef.current.innerHTML = '';
      }
    };
  }, [modalityMatrix]);

  if (!modalityMatrix) {
    return <div className="modality-matrix__empty">No modality matrix data available</div>;
  }

  return (
    <div className="modality-matrix">
      <div ref={plotRef} className="modality-matrix__chart"></div>
    </div>
  );
}
