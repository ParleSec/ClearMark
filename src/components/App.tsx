import React from 'react';
import { EditorProvider } from '../context/EditorContext';
import Editor from './editor/Editor';
import { useEditorContext } from '../context/EditorContext';

/**
 * Main application component
 */
const App: React.FC = () => {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
};

/**
 * Inner app content that has access to the EditorContext
 */
const AppContent: React.FC = () => {
  const { focusMode } = useEditorContext();

  return (
    <div className="app min-h-screen bg-gray-50">
      {!focusMode && (
        <header className="bg-white border-b shadow-sm py-3 sm:py-4">
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ClearMark</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Distraction-free Markdown Editor</p>
          </div>
        </header>
      )}
      
      <main className={`w-full max-w-6xl mx-auto ${focusMode ? 'mt-0' : 'mt-2 sm:mt-4'} bg-white shadow-sm rounded-md overflow-hidden`}>
        <Editor />
      </main>
      
      {!focusMode && (
        <footer className="py-4 sm:py-6 text-center text-gray-500 text-xs sm:text-sm">
          <p>ClearMark &copy; {new Date().getFullYear()} - Distraction-free Markdown Editor</p>
        </footer>
      )}
    </div>
  );
};

export default App;