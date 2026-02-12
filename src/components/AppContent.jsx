import { QuizPage } from '@/features/quiz/QuizPage.jsx';
import { ProfilePage } from '@/features/profile/ProfilePage.jsx';
import { useApp } from '@/state/AppContext.jsx';

export function AppContent() {
  const appContext = useApp();
  return (
    <div className="app-content">
      {appContext.currentPage === 'quiz' ? <QuizPage /> : <ProfilePage />}
    </div>
  );
}