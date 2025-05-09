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
}

/**
 * Enhanced toolbar button with tooltip using portals to prevent cutoff
 */
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  isActive = false, 
  onClick, 
  title,
  disabled = false,
  keyboardShortcut,
  hasDropdown = false
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
          p-1.5 rounded-md transition-all duration-150
          flex items-center justify-center
          min-w-7 min-h-7
          ${isActive 
            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
            : 'text-gray-700 hover:bg-gray-50 border border-transparent'
          }
          ${disabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'cursor-pointer'
          }
        `}
        aria-label={title}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <Icon size={16} className={isActive ? 'stroke-2' : 'stroke-[1.5px]'} />
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
          <div className="bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 whitespace-nowrap shadow-md">
            <div className="flex items-center justify-center">
              <span>{title}</span>
              {keyboardShortcut && (
                <span className="ml-1.5 bg-gray-700 px-1 py-0.5 rounded text-gray-300 text-[10px] font-mono">
                  {keyboardShortcut}
                </span>
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
              border-l-4 border-r-4 border-t-4 
              border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ToolbarButton;