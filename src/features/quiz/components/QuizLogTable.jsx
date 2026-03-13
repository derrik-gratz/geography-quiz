import React, { useState, useMemo } from 'react';
import { useQuiz } from '../state/quizProvider.jsx';
// import { CollapsibleContainer } from '@/components/CollapsibleContainer.jsx';
// import { calculateSkillScore } from '@/types/dataSchemas.js';
import './QuizLogTable.css';
import { promptScore, promptSkillScore } from '@/utils/quizEngine.js';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// import { Global } from '@emotion/react';
import Box from '@mui/material/Box';
// import SwipeableDrawer from '@mui/material/SwipeableDrawer';
// import { styled } from '@mui/material/styles';
// import { grey } from '@mui/material/colors';
import LinearProgress from '@mui/material/LinearProgress';

const logIcon = (status) => {
  switch (status) {
    case 'prompted':
      return '-';
    case 'incomplete':
      return '?/';
    case 'failed':
      return '✗/';
    case 'completed':
      return '✓/';
    default:
      return 'x?x';
  }
}
const parseGuesses = (guesses) => {
  return {
    name:
      logIcon(guesses.name.status) +
      (guesses.name.status !== 'prompted' ? guesses.name.attempts.length : ''),
    flag:
      logIcon(guesses.flag.status) +
      (guesses.flag.status !== 'prompted' ? guesses.flag.attempts.length : ''),
    location:
      logIcon(guesses.location.status) +
      (guesses.location.status !== 'prompted'? guesses.location.attempts.length : ''),
  };
};

function exportResults(gameMode, nCountries, quizSet, logEntries, obscureNames) {
  const prefix = gameMode === 'dailyChallenge' ? 'Daily Challenge' : quizSet;
  let exportText = `\`\`\`${prefix} Results\n`;
  const score = logEntries.reduce((sum, entry) => {
    return sum + entry.score;
  }, 0).toFixed(1);
  exportText += `Score: ${score} / ${nCountries} countries`;
  if (gameMode === 'dailyChallenge') {
    const skillScore = logEntries.reduce((sum, entry) => {
      return sum + entry.skillScore;
    }, 0).toFixed(1);
    exportText += `\t${skillScore}/5.0)\n\n`;
  } else {
    exportText += `\n\n`;
  }

  const entries = logEntries.slice(); //.reverse();

  const pad = (str, width) => String(str).padEnd(width, ' ');
  const countryCol = Math.max(
    'Country'.length,
    ...entries.map((e) =>
      obscureNames ? String(entries.length).length : e.correctCountry.length,
    ),
  );
  const mapCol = Math.max(
    'Map'.length,
    ...entries.map((e) => e.guesses.location.length),
  );
  const nameCol = Math.max(
    'Name'.length,
    ...entries.map((e) => e.guesses.name.length),
  );
  const flagCol = Math.max(
    'Flag'.length,
    ...entries.map((e) => e.guesses.flag.length),
  );

  // exportText += `| Country | Map | Name | Flag |\n`;
  // exportText += `|---------|-----|------|------|\n`;
  exportText += `| ${pad('Country', countryCol)} | ${pad('Map', mapCol)} | ${pad('Name', nameCol)} | ${pad('Flag', flagCol)} |\n`;
  exportText += `|${'-'.repeat(countryCol + 2)}|${'-'.repeat(mapCol + 2)}|${'-'.repeat(nameCol + 2)}|${'-'.repeat(flagCol + 2)}|\n`;

  entries.forEach((entry, index) => {
    const countryDisplay = obscureNames
      ? `${index + 1}`
      : entry.correctCountry;
    exportText += `| ${pad(countryDisplay, countryCol)} | ${pad(entry.guesses.location, mapCol)} | ${pad(entry.guesses.name, nameCol)} | ${pad(entry.guesses.flag, flagCol)} |\n`;
  });
  exportText += `\`\`\``;
  return exportText;
};

const logTable = (logEntries) => {
      return (
        <TableContainer
          component={Paper}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            // WebkitOverflowScrolling: 'touch',
          }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell key="correctCountry">Country</TableCell>
                <TableCell key="location">Map</TableCell>
                <TableCell key="name">Name</TableCell>
                <TableCell key="flag">Flag</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {logEntries
              .slice()
              .reverse()
              .map((entry, index) => (
                <TableRow key={index}>
                  <TableCell key="correctCountry">{entry.correctCountry}</TableCell>
                  <TableCell key="location">{entry.guesses.location}</TableCell>
                  <TableCell key="name">{entry.guesses.name}</TableCell>
                  <TableCell key="flag">{entry.guesses.flag}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    };

export function QuizProgressBar() {
  const state = useQuiz();
  const progressValue =  useMemo(() => (
    state.quiz.status === 'completed' ?
        100 :
      (state.quiz.prompt?.quizDataIndex ?? 0) / (state.quizData?.length || 1) * 100
  ), [state.quiz.status, state.quiz.prompt?.quizDataIndex, state.quizData?.length]);
  return (
    <LinearProgress variant="determinate" value={progressValue} sx={{ height: 8, borderRadius: 1 }} />
  );
}

export function QuizLogTable() {
  const state = useQuiz();
  const [exportSuccess, setExportSuccess] = useState(false);
  const [obscureNames, setObscureNames] = useState(true);

  const logEntries = useMemo(() => {
    if (state.quiz.status === 'not_started') {
      return [];
    }
    const pastPrompts = state.quiz.history.map((entry) => {
      const correctCountry =
        state.quizData[entry.quizDataIndex]?.country || '?';
      const score = promptScore(entry);
      const guesses = parseGuesses(entry);
      const skillScore = promptSkillScore(entry);
      return { correctCountry, score, guesses, skillScore };
    });
    if (state.quiz.status === 'active') {
      const currentPrompt = {
        correctCountry: '?',
        score: promptScore(state.quiz.prompt.guesses),
        guesses: parseGuesses(state.quiz.prompt.guesses),
      };
      return [...pastPrompts, currentPrompt];
    }
    return pastPrompts;
  }, [
    state.quiz.history,
    state.quiz.status,
    state.quiz.prompt,
    state.quizData,
  ]);

  const copyResultsToClipboard = async () => {
    try {
      const resultsText = exportResults(state.config.gameMode, state.quizData.length, state.config.quizSet, logEntries, obscureNames);
      await navigator.clipboard.writeText(resultsText);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 1000);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  };

  

  const exportSettings = () => {
    return (
      <div className="quiz-log__export">
        Quiz complete!
        <button
          onClick={copyResultsToClipboard}
          style={{
            backgroundColor: exportSuccess ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-primary-main)',
          }}
        >
          {exportSuccess ? '✓ Copied!' : 'Copy to clipboard'}
        </button>
        <label>
          <input type="checkbox" checked={obscureNames} onChange={(e) => setObscureNames(e.target.checked)} />
          Hide country names
        </label>
      </div>
    );
  }

  if (state.quiz.status === 'not_started') {
    return null;
  }

  // const progressValue =  useMemo(() => (
  //   state.quiz.status === 'completed' ?
  //       100 :
  //     (state.quiz.prompt?.quizDataIndex ?? 0) / (state.quizData?.length || 1) * 100
  // ), [state.quiz.status, state.quiz.prompt?.quizDataIndex, state.quizData?.length]);

  return (
    <div
      className="quiz-log"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          mx: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          // minHeight: 0,
        }}
      >
        {state.quiz.status === 'completed' && exportSettings()}
        {logTable(logEntries)}
      </Box>
  </div>
  );
}