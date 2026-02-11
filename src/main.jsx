import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import 'flag-icons/css/flag-icons.min.css';
import App from './App.jsx';
import { clearAllData } from './services/storageService.js';

// Expose clearAllData for development/testing
if (import.meta.env.DEV) {
  window.clearQuizData = async () => {
    if (
      confirm(
        '⚠️ This will delete ALL quiz data (daily challenges, country stats, etc.). Are you sure?',
      )
    ) {
      try {
        await clearAllData();
        console.log('✅ All quiz data cleared successfully!');
        alert('Database cleared! Refresh the page to see the changes.');
      } catch (error) {
        console.error('❌ Failed to clear data:', error);
        alert('Failed to clear data. Check console for details.');
      }
    }
  };
  console.log(
    '💡 Dev helper: Call window.clearQuizData() to wipe the database',
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
