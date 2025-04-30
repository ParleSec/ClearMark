import React, { useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';

interface FocusModeProps {
  children: React.ReactNode;
}

/**
 * Component that wraps editor content and provides focus mode functionality
 */
const FocusMode: React.FC<FocusModeProps> = ({ children }) => {
  const { focusMode, setFocusMode } = useEditorContext();
  
  // Handle escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusMode, setFocusMode]);
  
  // Add/remove focus mode class to body
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    
    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [focusMode]);
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };
  
  return (
    <div className={`focus-mode-container ${focusMode ? 'is-focused' : ''}`}>
      {children}
      
      <button
        onClick={toggleFocusMode}
        className="focus-mode-toggle fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow text-gray-700 dark:text-gray-200 z-50"
        title={focusMode ? "Exit focus mode" : "Enter focus mode"}
      >
        {focusMode ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      
      {focusMode && (
        <div className="focus-mode-overlay fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      )}
    </div>
  );
};

export default FocusMode;