import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';
import './ScoreTimeline.css';

export function ScoreTimeline({ userData }) {
  const scoreLog = userData.dailyChallenge.fullEntries;
  const plotRef = useRef(null);

  useEffect(() => {
    if (!scoreLog || scoreLog.length === 0 || !plotRef.current) {
      return;
    }

    // Get computed CSS variable values
    const getComputedColor = (variable) => {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || '#000000'
      );
    };

    const scoreColor = getComputedColor('--color-selected');
    const skillColor = getComputedColor('--color-hover');
    const textColor = getComputedColor('--text-primary');
    const borderColor = getComputedColor('--border-color');

    // Sort by date (oldest first)
    const sortedLog = [...scoreLog].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // Transform data for Observable Plot
    // Plot expects dates as Date objects and values as numbers
    const plotData = sortedLog.map((entry) => ({
      date: new Date(entry.date + 'T00:00:00'),
      score: entry.score || 0,
      skillScore: entry.skillScore || 0,
    }));

    // Calculate domain for Y axis
    const allScores = plotData.flatMap((d) => [d.score, d.skillScore]);
    const minScore = Math.min(0, ...allScores);
    const maxScore = Math.max(...allScores, 1);

    // Create the plot
    const chart = Plot.plot({
      width: 600,
      height: 400,
      marginTop: 20,
      marginRight: 40,
      marginBottom: 40,
      marginLeft: 60,
      x: {
        type: 'time',
        label: null,
        tickFormat: (d) => {
          const date = new Date(d);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        },
        tickRotate: sortedLog.length <= 20 ? -45 : 0,
        ticks: sortedLog.length <= 20 ? sortedLog.length : 10,
      },
      y: {
        label: 'Score',
        domain: [minScore, maxScore],
        grid: true,
        tickFormat: (d) => d.toFixed(1),
      },
      marks: [
        Plot.line(plotData, {
          x: 'date',
          y: 'score',
          stroke: scoreColor,
          strokeWidth: 2,
          curve: 'linear',
        }),
        Plot.line(plotData, {
          x: 'date',
          y: 'skillScore',
          stroke: skillColor,
          strokeWidth: 2,
          curve: 'linear',
        }),
        Plot.dot(plotData, {
          x: 'date',
          y: 'score',
          fill: scoreColor,
          r: 4,
          title: (d) =>
            `${d.date.toLocaleDateString()}: Score ${d.score.toFixed(2)}`,
        }),
        Plot.dot(plotData, {
          x: 'date',
          y: 'skillScore',
          fill: skillColor,
          r: 4,
          title: (d) =>
            `${d.date.toLocaleDateString()}: Skill ${d.skillScore.toFixed(2)}`,
        }),
      ],
      style: {
        background: 'transparent',
        color: textColor,
        fontSize: '12px',
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
    // <div className="daily-challenge-stats" style={{display: 'flex', flexDirection: 'row'}}>
    <div
      className="score-timeline"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="score-timeline__legend"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <div className="score-timeline__legend-item">
          <span className="score-timeline__legend-line score-timeline__legend-line--score"></span>
          <span>Regular Score</span>
        </div>
        <div className="score-timeline__legend-item">
          <span className="score-timeline__legend-line score-timeline__legend-line--skill"></span>
          <span>Skill Score</span>
        </div>
      </div>
      <div ref={plotRef} className="score-timeline__chart"></div>
    </div>
    // </div>
  );
}
