import React from 'react';
import { NavigationBar } from '@/components/NavigationBar.jsx';
import { AppContent } from '@/components/AppContent.jsx';
import { AppProvider } from '@/state/AppContext.jsx';

function App() {
  return (
    <div className="app">
      <AppProvider>
        <NavigationBar />
        <AppContent />
      </AppProvider>
    </div>
  );
}

export default App;
