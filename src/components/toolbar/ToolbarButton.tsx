import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon | ((props: any) => JSX.Element);
  isActive?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

/**
 * Basic toolbar button component
 */
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  isActive = false, 
  onClick, 
  title,
  disabled = false
}) => {
  return (
    <button 
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        p-1 sm:p-1.5 mx-0.5 sm:mx-1 rounded hover:bg-gray-200 transition-colors 
        min-w-[36px] min-h-[36px] flex items-center justify-center
        ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={title}
    >
      <Icon size={16} className="sm:size-[18px]" />
    </button>
  );
};

export default ToolbarButton;