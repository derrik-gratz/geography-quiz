import React, { useRef, useEffect, useState } from 'react';
import * as Plot from '@observablehq/plot';
import './ScoreTimeline.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';

const PLOT_FONT_SIZE_PX = 14;

export function ScoreTimeline({ userData }) {
  const theme = useTheme();
  const scoreLog = userData.dailyChallenge.fullEntries;
  const containerRef = useRef(null);
  const lastDimensionsRef = useRef({ width: 0, height: 0 });
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  // Observe container size; only update state when dimensions actually change to avoid extra renders
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) return;
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);
      const last = lastDimensionsRef.current;
      if (roundedWidth === last.width && roundedHeight === last.height) return;
      lastDimensionsRef.current = { width: roundedWidth, height: roundedHeight };
      setDimensions({ width: roundedWidth, height: roundedHeight });
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!scoreLog || scoreLog.length === 0 || !containerRef.current || dimensions.width <= 0 || dimensions.height <= 0) {
      return;
    }

    const sortedLog = [...scoreLog].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const plotData = sortedLog.flatMap((entry) => [
      {
        date: new Date(entry.date + 'T00:00:00'),
        metric: 'General score',
        value: entry.score || 0,
      }, {
        date: new Date(entry.date + 'T00:00:00'),
        metric: 'Skill score',
        value: entry.skillScore || 0,
      }
    ]);

    const chart = Plot.plot({
      width: dimensions.width,
      height: dimensions.height,
      marginTop: 10,
      marginRight: 10,
      marginBottom: 40,
      marginLeft: 40,
      x: {
        type: 'time',
        label: null,
        grid: true,
        tickFormat: (d) => {
          const date = new Date(d);
          return date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            // year: 'numeric',
          });
        },
        tickRotate: sortedLog.length <= 3 ? -45 : 0,
        ticks: 5 //sortedLog.length <= 20 ? sortedLog.length : 10,
      },
      y: {
        label: 'Score',
        labelAnchor: 'center',
        labelArrow: 'none',
        domain: [0, 5],
        grid: true,
        ticks: 6,
        tickFormat: (d) => d.toFixed(0),
      },
      marks: [
        Plot.ruleY([0]),
        Plot.ruleX([Math.min(...plotData.map(d => d.date))]),
        Plot.line(plotData, {
          x: 'date',
          y: 'value',
          z: null,
          stroke: 'metric',
          strokeWidth: 2,
          curve: 'linear',
        }),
        Plot.dot(plotData, {
          x: 'date',
          y: 'value',
          stroke: 'metric',
          z: null,
          r: 4,
          title: (d) =>
            `${d.date.toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
            })} ${d.metric}: ${d.value.toFixed(2)}`,
        }),
      ],
      color: {
        type: "categorical",
        domain: ['General score', 'Skill score'],
        range: [theme.palette.primary.main, theme.palette.secondary.main],
        legend: true,
        className: 'score-timeline__legend',
      },
      style: {
        background: 'transparent',
        color: theme.palette.text.primary,
        fontSize: `${PLOT_FONT_SIZE_PX}px`,
      },
    });
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(chart);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [scoreLog, dimensions, theme.palette.primary.main, theme.palette.secondary.main, theme.palette.text.primary]);

  if (!scoreLog || scoreLog.length === 0) {
    return <div className="score-timeline__empty">No data available</div>;
  }

  return (
    <Card style={{ minHeight: '200px', minWidth: '200px', flex: 1 }}>
      <CardHeader title="Score Timeline" slotProps={{ title: { style: { fontSize: '1rem', fontWeight: 'bold', marginBottom: '0', paddingBottom: '0' }} }} />
      <CardContent style={{ padding: '0', margin: '0' }}/>
        <div ref={containerRef} style={{ width: '100%', display: 'block' }} />
      {/* </CardContent> */}
    </Card>
  );
}
