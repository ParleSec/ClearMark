import React from 'react';
import { EditorProvider } from '../context/EditorContext';
import Editor from './editor/Editor';

/**
 * Main application component
 */
const App: React.FC = () => {
  return (
    <div className="app min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800">ClearMark</h1>
          <p className="text-gray-500 text-sm">Distraction-free Markdown Editor</p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto mt-4 bg-white shadow-sm rounded-md overflow-hidden">
        <EditorProvider>
          <Editor />
        </EditorProvider>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>ClearMark &copy; {new Date().getFullYear()} - Distraction-free Markdown Editor</p>
      </footer>
    </div>
  );
};

export default App;