import React, { useEffect, useState } from 'react';
import { Maximize, Minimize, Timer, Volume2, VolumeX } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';

interface FocusModeProps {
  children: React.ReactNode;
}

/**
 * Component that wraps editor content and provides focus mode functionality
 */
const FocusMode: React.FC<FocusModeProps> = ({ children }) => {
  const { focusMode, setFocusMode } = useEditorContext();
  const [isMuted, setIsMuted] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
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
      // Start focus timer
      const timer = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
      
      return () => {
        clearInterval(timer);
        document.body.classList.remove('focus-mode');
      };
    } else {
      document.body.classList.remove('focus-mode');
      setFocusTime(0);
    }
  }, [focusMode]);
  
  // Format focus time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };
  
  // Toggle sound
  const toggleSound = () => {
    setIsMuted(!isMuted);
    // You can add ambient sound here if desired
  };
  
  return (
    <div 
      className={`focus-mode-container ${focusMode ? 'is-focused' : ''}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {children}
      
      {focusMode && (
        <>
          <div className="focus-mode-overlay" />
          
          {/* Focus mode controls */}
          <div className={`fixed bottom-4 right-4 flex items-center space-x-4 z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {showTimer && (
              <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm text-sm text-gray-700 border border-gray-200">
                <Timer size={16} className="inline-block mr-2" />
                {formatTime(focusTime)}
              </div>
            )}
            
            <button
              onClick={toggleSound}
              className="focus-mode-toggle"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="focus-mode-toggle"
              title={showTimer ? "Hide timer" : "Show timer"}
            >
              <Timer size={20} />
            </button>
            
            <button
              onClick={toggleFocusMode}
              className="focus-mode-toggle"
              title="Exit focus mode"
            >
              <Minimize size={20} />
            </button>
          </div>
        </>
      )}
      
      {!focusMode && (
        <button
          onClick={toggleFocusMode}
          className="focus-mode-toggle"
          title="Enter focus mode"
        >
          <Maximize size={20} />
        </button>
      )}
    </div>
  );
};

export default FocusMode;