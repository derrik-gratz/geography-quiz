import React, { useState, useMemo, useEffect } from 'react';

import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Global } from '@emotion/react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { useQuiz } from '../state/quizProvider.jsx';

import './QuizLogDisplay.css';
import { QuizLogTable } from './QuizLogTable.jsx';

const drawerBleeding = 56;

const StyledBox = styled('div')(({ theme }) => ({
  backgroundColor: grey[50],
  ...theme.applyStyles('dark', {
    backgroundColor: grey[800],
  }),
}));

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[900],
  }),
}));

export function QuizLogDesktop({ children }) {
  const theme = useTheme();
  const state = useQuiz();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  if (!isDesktop || state.quiz.status === 'not_started') {
    return null;
  }
  return (
    <div className="quiz-log-desktop">
      <QuizLogTable />
    </div>
  );
}

export function QuizLogMobile() {
  const state = useQuiz();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (newOpen) => () => setDrawerOpen(newOpen);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (state.quiz.status === 'completed') {
      setDrawerOpen(true);
    }
  }, [state.quiz.status]);

  if (!isMobile || state.quiz.status === 'not_started') {
    return null;
  }

  return (
    <div className="quiz-log-mobile">
        <Global
            styles={{
            // eslint-disable-next-line
            '.MuiDrawer-root > .MuiPaper-root': {
                height: `calc(60% - ${drawerBleeding}px)`,
                overflow: 'visible',
                // padding: '1rem',
                margin: '0rem',
            },
            }}
        />
  <SwipeableDrawer
    anchor="bottom"
    open={drawerOpen}
    onClose={toggleDrawer(false)}
    onOpen={toggleDrawer(true)}
    swipeAreaWidth={drawerBleeding}
    disableSwipeToOpen={false}
    keepMounted
  >
    <StyledBox
      sx={{
        position: 'absolute',
        top: -drawerBleeding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        visibility: 'visible',
        right: 0,
        left: 0,
      }}
    >
      <Puller />
      <QuizLogTable />
    </StyledBox>
  </SwipeableDrawer>
  </div>
  );
}