import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';
import './ScoreTimeline.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';


export function ScoreTimeline({ userData }) {
  const theme = useTheme();
  const scoreLog = userData.dailyChallenge.fullEntries;
  const plotRef = useRef(null);

  useEffect(() => {
    if (!scoreLog || scoreLog.length === 0 || !plotRef.current) {
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
      // width: 600,
      // height: 250,
      marginTop: 30,
      marginRight: 20,
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
        ticks: 9 //sortedLog.length <= 20 ? sortedLog.length : 10,
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
          stroke: 'metric',
          strokeWidth: 2,
          curve: 'linear',
        }),
        Plot.dot(plotData, {
          x: 'date',
          y: 'value',
          stroke: 'metric',
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
        legend: true
      },
      style: {
        background: 'transparent',
        color: theme.palette.text.primary,
        fontSize: '1rem',
      },
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
  }, [scoreLog]);

  if (!scoreLog || scoreLog.length === 0) {
    return <div className="score-timeline__empty">No data available</div>;
  }

  return (
    <Card>
      <CardHeader title="Score Timeline" slotProps={{ title: { style: { fontSize: '1rem', fontWeight: 'bold' }} }} />
      <CardContent style={{ padding: '0rem', margin: '0rem 0.5rem' }} ref={plotRef}/>
    </Card>
  );
}
