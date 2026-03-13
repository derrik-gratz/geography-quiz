import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { useQuiz } from '../state/quizProvider.jsx';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import './QuizLogDisplay.css';
import { QuizLogTable, QuizProgressBar } from './QuizLogTable.jsx';

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
      <Box sx={{ mt:3, mx: 2, mb:2 }}>
            <QuizProgressBar />
      </Box>
      <QuizLogTable />
    </div>
  );
}

export function QuizLogMobile() {
  const state = useQuiz();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        keepMounted
        slotProps={{
          paper: {
            sx: {
              height: `calc(60dvh - ${drawerBleeding}px)`,
              overflow: 'visible',
            },
          },
        }}
      >
        <StyledBox
           sx={{
            position: 'absolute',
            top: -drawerBleeding,
            height: drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
        >
          <Box sx={{ mt: 2, px:3, flexShrink: 0 }}>
            <Puller />
            <QuizProgressBar />
          </Box>
        </StyledBox>
        <StyledBox sx={{ px: 1, pb: 1, pt:0, height: '100%', overflow: 'auto' }}>
        <QuizLogTable />
        </StyledBox>
      </SwipeableDrawer>
    </div>
  );
}