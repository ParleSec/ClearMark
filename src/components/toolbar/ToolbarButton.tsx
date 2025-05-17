import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon | ((props: any) => JSX.Element);
  isActive?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  keyboardShortcut?: string;
  hasDropdown?: boolean;
  mobileFriendly?: boolean;
}

/**
 * Enhanced toolbar button with tooltip using portals to prevent cutoff
 * Updated with fluid, water-inspired styling
 */
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  isActive = false, 
  onClick, 
  title,
  disabled = false,
  keyboardShortcut,
  hasDropdown = false,
  mobileFriendly = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Update tooltip position when button position changes
  useEffect(() => {
    if (showTooltip && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8, // Position above button with some margin
        left: rect.left + rect.width / 2
      });
    }
  }, [showTooltip]);
  
  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          ${mobileFriendly 
            ? 'p-2 m-0.5' 
            : 'p-1.5'
          }
          rounded-[0.35rem] transition-all duration-300
          flex items-center justify-center
          ${mobileFriendly 
            ? 'min-w-9 min-h-9' 
            : 'min-w-7 min-h-7'
          }
          ${isActive 
            ? 'bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-sky-900/50 dark:to-cyan-900/60 text-cyan-700 dark:text-cyan-300 border-b-2 border-t border-x border-b-cyan-400 dark:border-b-cyan-600 border-t-sky-100 dark:border-t-sky-800 border-x-cyan-200 dark:border-x-cyan-800 shadow-[0_1px_2px_rgba(0,176,209,0.15)]' 
            : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-b hover:from-sky-50/80 hover:to-slate-50/80 dark:hover:from-sky-900/20 dark:hover:to-slate-800/30 border border-transparent hover:border-b-sky-200 dark:hover:border-b-sky-800 hover:border-t-transparent dark:hover:border-t-transparent hover:border-x-slate-100/80 dark:hover:border-x-slate-700/50'
          }
          ${disabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'cursor-pointer'
          }
          ${mobileFriendly ? 'touch-manipulation' : ''}
          backdrop-blur-[1px]
        `}
        style={{
          borderTopLeftRadius: '0.4rem',
          borderTopRightRadius: '0.3rem',
          borderBottomLeftRadius: '0.3rem',
          borderBottomRightRadius: '0.5rem',
        }}
        aria-label={title}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <Icon size={mobileFriendly ? 18 : 16} className={isActive ? 'stroke-2' : 'stroke-[1.5px]'} />
        {hasDropdown && <ChevronDown size={12} className="ml-0.5" />}
      </button>
      
      {/* Tooltip rendered in portal to avoid cutoff */}
      {showTooltip && !disabled && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: tooltipPosition.top, 
            left: tooltipPosition.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-900 text-white text-xs rounded-[0.35rem] py-1.5 px-2.5 whitespace-nowrap shadow-md border-b border-sky-500/30 backdrop-blur-sm"
            style={{
              borderTopLeftRadius: '0.4rem',
              borderTopRightRadius: '0.3rem',
              borderBottomLeftRadius: '0.5rem',
              borderBottomRightRadius: '0.3rem',
            }}>
            <div className="flex items-center justify-center">
              <span>{title}</span>
              {keyboardShortcut && (
                <span className="ml-1.5 bg-gradient-to-r from-sky-800/50 to-slate-800/80 px-1 py-0.5 rounded text-sky-200 text-[10px] font-mono">
                  {keyboardShortcut}
                </span>
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
              border-l-4 border-r-4 border-t-4 
              border-l-transparent border-r-transparent border-t-slate-900"></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ToolbarButton;