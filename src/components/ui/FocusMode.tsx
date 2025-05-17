import React, { useEffect, useState } from 'react';
import { Maximize, Minimize, Timer, Volume2, VolumeX, Moon, Sun, Droplet } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';

interface FocusModeProps {
  children: React.ReactNode;
}

/**
 * Component that wraps editor content and provides focus mode functionality
 * with a fluid, flowing design aesthetic
 */
const FocusMode: React.FC<FocusModeProps> = ({ children }) => {
  const { focusMode, setFocusMode } = useEditorContext();
  const [isMuted, setIsMuted] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [theme, setTheme] = useState('light');
  const [rippleEffect, setRippleEffect] = useState<{x: number, y: number, id: number} | null>(null);
  
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
  
  // Toggle focus mode with ripple effect
  const toggleFocusMode = (e: React.MouseEvent) => {
    if (!focusMode) {
      // Create ripple effect when entering focus mode
      createRipple(e);
    }
    setFocusMode(!focusMode);
  };
  
  // Toggle sound
  const toggleSound = () => {
    setIsMuted(!isMuted);
    // You can add ambient rain sounds here if desired
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.toggle('dark');
  };
  
  // Create ripple effect
  const createRipple = (event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const rippleId = Date.now();
    setRippleEffect({ x, y, id: rippleId });
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRippleEffect(null);
    }, 1000);
  };
  
  return (
    <div 
      className={`focus-mode-container ${focusMode ? 'is-focused' : ''}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (focusMode) {
          setTimeout(() => setShowControls(false), 2000);
        }
      }}
    >
      {children}
      
      {focusMode && (
        <>
          <div className="focus-mode-overlay" />
          
          {/* Focus mode controls */}
          <div 
            className={`fixed bottom-6 right-6 flex items-center space-x-3 z-50 transition-all duration-500 ease-in-out ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {showTimer && (
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-flow text-sm text-slate-800 dark:text-slate-100 border border-flow-100 dark:border-slate-700 flex items-center">
                <Timer size={16} className="inline-block mr-2 text-flow-600 dark:text-flow-300" />
                {formatTime(focusTime)}
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="focus-mode-toggle bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-flow-700 dark:text-flow-300 hover:text-flow-800 dark:hover:text-flow-200"
              title={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span className="sr-only">{theme === 'light' ? "Dark mode" : "Light mode"}</span>
            </button>
            
            <button
              onClick={toggleSound}
              className="focus-mode-toggle bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-flow-700 dark:text-flow-300 hover:text-flow-800 dark:hover:text-flow-200"
              title={isMuted ? "Unmute ambient sounds" : "Mute ambient sounds"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="focus-mode-toggle bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-flow-700 dark:text-flow-300 hover:text-flow-800 dark:hover:text-flow-200"
              title={showTimer ? "Hide timer" : "Show focus timer"}
            >
              <Timer size={18} />
              <span className="sr-only">{showTimer ? "Hide timer" : "Show timer"}</span>
            </button>
            
            <button
              onClick={toggleFocusMode}
              className="focus-mode-toggle bg-gradient-to-r from-flow-500 to-flow-600 text-white hover:from-flow-600 hover:to-flow-700 hover:shadow-flow-lg"
              title="Exit focus mode"
            >
              <Minimize size={18} />
              <span className="sr-only">Exit focus mode</span>
            </button>
          </div>
          
          {/* Exit button for mobile */}
          <button
            onClick={() => setFocusMode(false)}
            className="focus-mode-exit"
          >
            <Minimize size={16} className="mr-1" />
            <span>Exit Focus Mode</span>
          </button>
        </>
      )}
      
      {!focusMode && (
        <button
          onClick={toggleFocusMode}
          className="focus-mode-toggle bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 backdrop-blur-sm group relative"
          title="Enter focus mode"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-flow-500/20 to-flow-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Droplet size={20} className="text-flow-600 dark:text-flow-300 group-hover:text-flow-700 dark:group-hover:text-flow-200 transition-colors duration-300" />
          <span className="sr-only">Enter focus mode</span>
          
          {rippleEffect && (
            <span 
              className="absolute rounded-full bg-flow-500/30 animate-ripple"
              style={{
                width: '120px',
                height: '120px',
                left: rippleEffect.x - 60,
                top: rippleEffect.y - 60,
              }}
              key={rippleEffect.id}
            />
          )}
        </button>
      )}
    </div>
  );
};

export default FocusMode;