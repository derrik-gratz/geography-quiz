import React, { useRef, useEffect, useState } from 'react';
import * as Plot from '@observablehq/plot';
import './ModalityHeatmap.css';
import { useTheme } from '@mui/material/styles';

const ASPECT_RATIO = 7 / 4;
const PLOT_FONT_SIZE_PX = 14;

/**
 * ModalityMatrix component
 * Displays a 3x3 heatmap showing accuracy for each input/prompted modality combination
 *
 * @param {Object} props
 * @param {Object} props.plotData - Plot data in long format containing accuracy and precision for each input/prompted modality combination
 */
export function ModalityHeatmap({ plotData }) {
  const theme = useTheme();
  const containerRef = useRef(null);
  const legendRef = useRef(null);
  const chartRef = useRef(null);
  const lastWidthRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  // Observe plot container size; only update state when width actually changes to avoid extra renders
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width <= 0) return;
      const roundedWidth = Math.round(width);
      if (roundedWidth === lastWidthRef.current) return;
      lastWidthRef.current = roundedWidth;
      setDimensions({
        width: roundedWidth,
        height: Math.round(width / ASPECT_RATIO),
      });
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [plotData]);

  useEffect(() => {
    if (!plotData || !chartRef.current || !legendRef.current || dimensions.width <= 0) return;

    const getComputedColor = (variable) => {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || '#000000'
      );
    };

    const borderColor = getComputedColor('--border-color');

    const colorScale = {
      type: 'linear',
      range: [theme.palette.error.main, theme.palette.success.main],
      unknown: '#6e6e6e',
      domain: [0, 1],
      label: 'Accuracy (%)',
      tickFormat: (d) => (d * 100).toFixed(0) + '%',
    };

    const plot = Plot.plot({
      width: dimensions.width,
      height: dimensions.height,
      marginTop: 0,
      marginRight: 20,
      marginBottom: 50,
      marginLeft: 90,
      x: {
        label: 'Prompted Modality',
        domain: ['Name', 'Flag', 'Location'],
        axis: 'bottom',
        labelOffset: 40,
      },
      y: {
        label: 'Input Modality',
        domain: ['Name', 'Flag', 'Location'].reverse(),
        axis: 'left',
        labelOffset: 80,
      },
      color: {
        ...colorScale,
        legend: false,
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
          },
        }),
        Plot.text(plotData, {
          x: 'x',
          y: 'y',
          text: (d) =>
            Number.isNaN(d.value) ? '' : (d.value * 100).toFixed(0) + '%',
          fill: theme.palette.primary.contrastText,
          fontSize: PLOT_FONT_SIZE_PX,
          // fontWeight: 'bold',
        }),
      ],
      style: {
        background: 'transparent',
        fontSize: `${PLOT_FONT_SIZE_PX}px`,
      },
    });

    const legend = Plot.legend({
      color: colorScale,
      width: dimensions.width * 0.4,
    });

    chartRef.current.innerHTML = '';
    chartRef.current.append(plot);
    legendRef.current.innerHTML = '';
    legendRef.current.append(legend);

    return () => {
      plot.remove();
      legend.remove();
    };
  }, [plotData, dimensions, theme.palette.error.main, theme.palette.success.main, theme.palette.primary.contrastText]);

  if (!plotData) {
    return (
      <div className="modality-matrix__empty">
        No modality matrix data available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="modality-matrix__chart">
      <div ref={legendRef} className="modality-matrix__legend" />
      <div ref={chartRef} className="modality-matrix__plot" />
    </div>
  );
}
