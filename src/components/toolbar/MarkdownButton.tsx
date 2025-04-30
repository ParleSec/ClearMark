import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ToolbarButton from './ToolbarButton';
import { useEditorContext } from '../../context/EditorContext';

interface MarkdownButtonProps {
  className?: string;
}

/**
 * Button to toggle markdown preview
 */
const MarkdownButton: React.FC<MarkdownButtonProps> = ({ className }) => {
  const { showMarkdown, setShowMarkdown } = useEditorContext();
  
  const handleToggleMarkdown = () => {
    setShowMarkdown(!showMarkdown);
  };
  
  return (
    <ToolbarButton
      icon={showMarkdown ? EyeOff : Eye}
      onClick={handleToggleMarkdown}
      title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
      isActive={showMarkdown}
    />
  );
};

export default MarkdownButton;