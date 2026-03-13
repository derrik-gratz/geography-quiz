import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { useQuiz } from '../state/quizProvider.jsx';
import Box from '@mui/material/Box';

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
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        keepMounted
        disableBackdropTransition={true}
        PaperProps={{
          sx: {
            height: `calc(60dvh - ${drawerBleeding}px)`,
            overflow: 'visible',
            margin: 0,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overscrollBehavior: 'contain',
          },
        }}
      >
        <StyledBox
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            right: 0,
            left: 0,
            height: drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
          }}
        >
          <Puller />
        </StyledBox>
        <StyledBox
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mt: 2, mx: 2, mb: 1, flexShrink: 0 }}>
            <QuizProgressBar />
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              overscrollBehavior: 'contain',
            }}
          >
            <QuizLogTable />
          </Box>
        </StyledBox>
      </SwipeableDrawer>
    </div>
  );
}