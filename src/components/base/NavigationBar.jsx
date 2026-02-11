export function NavigationBar({ currentPage, setCurrentPage }) {
  return (
    <div className="navigation-bar">
      <nav>
        <button
          className={`navigation-bar__button ${currentPage === 'quiz' ? 'navigation-bar__button_selected' : ''}`}
          onClick={() => setCurrentPage('quiz')}
        >
          Quiz
        </button>
        <button
          className={`navigation-bar__button ${currentPage === 'profile' ? 'navigation-bar__button_selected' : ''}`}
          onClick={() => setCurrentPage('profile')}
        >
          Profile
        </button>
      </nav>
    </div>
  );
}
