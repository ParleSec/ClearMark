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
        p-1 mx-1 rounded hover:bg-gray-200 transition-colors 
        ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={title}
    >
      <Icon size={18} />
    </button>
  );
};

export default ToolbarButton;