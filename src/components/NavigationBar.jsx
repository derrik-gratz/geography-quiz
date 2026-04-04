import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { useApp, useAppDispatch } from '@/state/AppProvider.jsx';
import { AuthToolbarSection } from '@/components/AuthToolbarSection.jsx';

export function NavigationBar() {
  const appContext = useApp();
  const appDispatch = useAppDispatch();

  function setCurrentPage(page) {
    appDispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }
  return (

    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 2 }}
            onClick={() => setCurrentPage('quiz')}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <AuthToolbarSection />
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="profile"
            align="right"
            sx={{ ml: 2 }}
            onClick={() => setCurrentPage('profile')}
          >
            <PersonIcon />
          </IconButton>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Home
          </Typography>
          <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}



// import { useApp, useAppDispatch } from '@/state/AppProvider.jsx';

// export function NavigationBar() {
//   const appContext = useApp();
//   const appDispatch = useAppDispatch();

//   function setCurrentPage(page) {
//     appDispatch({ type: 'SET_CURRENT_PAGE', payload: page });
//   }

//   return (
//     <div className="navigation-bar">
//       <nav>
//         <button
//           className={`navigation-bar__button ${appContext.currentPage === 'quiz' ? 'navigation-bar__button_selected' : ''}`}
//           onClick={() => setCurrentPage('quiz')}
//         >
//           Quiz
//         </button>
//         <button
//           className={`navigation-bar__button ${appContext.currentPage === 'profile' ? 'navigation-bar__button_selected' : ''}`}
//           onClick={() => setCurrentPage('profile')}
//         >
//           Profile
//         </button>
//       </nav>
//     </div>
//   );
// }