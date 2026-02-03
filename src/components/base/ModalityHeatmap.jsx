import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';
import './ModalityHeatmap.css';

/**
 * ModalityMatrix component
 * Displays a 3x3 heatmap showing accuracy for each input/prompted modality combination
 * 
 * @param {Object} props
 * @param {Object} props.plotData - Plot data in long format containing accuracy and precision for each input/prompted modality combination
 */
export function ModalityHeatmap({ plotData }) {
  const containerRef = useRef(null);
  const legendRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!plotData) return;

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

    const colorScale = {
      type: 'linear',
      range: [lowColor, highColor],
      unknown: unknownColor,
      domain: [0, 1],
      label: 'Accuracy (%)',
      tickFormat: (d) => (d * 100).toFixed(0) + '%'
    };

    const plot = Plot.plot({
      width: 500,
      height: 400,
      marginTop: 0,
      marginRight: 60,
      marginBottom: 40,
      marginLeft: 80,
      x: {
        label: 'Prompted Modality',
        domain: ['Name', 'Flag', 'Location'],
        axis: 'bottom'
      },
      y: {
        label: 'Input Modality',
        domain: ['Name', 'Flag', 'Location'].reverse(),
        axis: 'left'
      },
      color: {
        ...colorScale,
        legend: false
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
          text: (d) => Number.isNaN(d.value) ? '' : (d.value * 100).toFixed(0) + '%',
        //   fill: textColor,
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

    const legend = Plot.legend({
      color: colorScale,
    });

    if (chartRef.current) {
      chartRef.current.append(plot);
    }
    if (legendRef.current) {
      legendRef.current.append(legend);
    }

    return () => {
      plot.remove();
      legend.remove();
    };
  }, [plotData]);

  if (!plotData) {
    return <div className="modality-matrix__empty">No modality matrix data available</div>;
  }

  return (
    <div ref={containerRef} className="modality-matrix__chart">
      <div ref={legendRef} className="modality-matrix__legend"/>
      <div ref={chartRef} className="modality-matrix__plot"/>
    </div>
  );
}