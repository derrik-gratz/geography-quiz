import { useApp, useAppDispatch } from '@/state/AppContext.jsx';

export function NavigationBar() {
  const appContext = useApp();
  const appDispatch = useAppDispatch();

  function setCurrentPage(page) {
    appDispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }

  return (
    <div className="navigation-bar">
      <nav>
        <button
          className={`navigation-bar__button ${appContext.currentPage === 'quiz' ? 'navigation-bar__button_selected' : ''}`}
          onClick={() => setCurrentPage('quiz')}
        >
          Quiz
        </button>
        <button
          className={`navigation-bar__button ${appContext.currentPage === 'profile' ? 'navigation-bar__button_selected' : ''}`}
          onClick={() => setCurrentPage('profile')}
        >
          Profile
        </button>
      </nav>
    </div>
  );
}
