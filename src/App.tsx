import React from 'react';
import { NotesProvider } from './context/NotesContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BlockEditor } from './components/editor/BlockEditor';
import { SearchModal } from './components/modals/SearchModal';
import { CloudSettingsModal } from './components/modals/CloudSettingsModal';
import { AuthModal } from './components/modals/AuthModal';

export const AppContent: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-notion-dark">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <BlockEditor />
        </main>
      </div>

      {/* Global Modals */}
      <SearchModal />
      <CloudSettingsModal />
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotesProvider>
        <AppContent />
      </NotesProvider>
    </AuthProvider>
  );
};

export default App;
