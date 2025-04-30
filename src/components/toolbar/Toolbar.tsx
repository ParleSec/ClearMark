import React from 'react';
import { useSlate } from 'slate-react';
import { 
  Bold, Italic, Code, Hash, List, Link as LinkIcon, 
  Image as ImageIcon, AlignLeft, Download, Eye, EyeOff, 
  Clipboard, Maximize, Minimize, AlignJustify
} from 'lucide-react';

import FormatButton from './FormatButton';
import ToolbarButton from './ToolbarButton';
import { useEditorContext } from '../../context/EditorContext';
import { exportToMarkdownFile, copyMarkdownToClipboard } from '../../utils/exporters';
import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';

interface ToolbarProps {
  onInsertImage: () => void;
  onInsertLink: () => void;
}

/**
 * Main editor toolbar component
 */
const Toolbar: React.FC<ToolbarProps> = ({ 
  onInsertImage, 
  onInsertLink 
}) => {
  const {
    editorState,
    showMarkdown,
    setShowMarkdown,
    focusMode,
    setFocusMode,
    metadata
  } = useEditorContext();
  
  // Handle exporting to markdown file
  const handleExport = () => {
    const filename = metadata.title || 'blog-post';
    exportToMarkdownFile(editorState, filename, metadata);
  };
  
  // Handle copying markdown to clipboard
  const handleCopyMarkdown = async () => {
    const success = await copyMarkdownToClipboard(editorState, metadata);
    
    if (success) {
      // Show a success message
      alert('Markdown copied to clipboard!');
    } else {
      // Show an error message
      alert('Failed to copy to clipboard. Please try again.');
    }
  };
  
  return (
    <div className={`border-b p-2 flex justify-between items-center bg-white z-10 
      ${focusMode ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}
    >
      {/* Text formatting tools */}
      <div className="flex items-center space-x-1">
        <div className="flex">
          <FormatButton format={MarkdownFormat.Bold} icon={Bold} />
          <FormatButton format={MarkdownFormat.Italic} icon={Italic} />
          <FormatButton format={MarkdownFormat.Code} icon={Code} />
        </div>
        
        <div className="h-full w-px bg-gray-300 mx-2" />
        
        {/* Block formatting */}
        <div className="flex">
          <FormatButton 
            format={MarkdownElementType.HeadingOne} 
            icon={Hash} 
            isBlock={true} 
          />
          <FormatButton 
            format={MarkdownElementType.HeadingTwo} 
            icon={Hash} 
            isBlock={true} 
            small
          />
          <FormatButton 
            format={MarkdownElementType.HeadingThree} 
            icon={Hash} 
            isBlock={true} 
            smaller
          />
          <FormatButton 
            format={MarkdownElementType.BlockQuote} 
            icon={AlignLeft} 
            isBlock={true} 
          />
          <FormatButton 
            format={MarkdownElementType.BulletedList} 
            icon={List} 
            isBlock={true} 
          />
        </div>
        
        <div className="h-full w-px bg-gray-300 mx-2" />
        
        {/* Insert elements */}
        <div className="flex">
          <ToolbarButton 
            icon={ImageIcon} 
            onClick={onInsertImage} 
            title="Insert Image" 
          />
          <ToolbarButton 
            icon={LinkIcon} 
            onClick={onInsertLink} 
            title="Insert Link" 
          />
        </div>
      </div>
      
      {/* Actions and view options */}
      <div className="flex items-center">
        <ToolbarButton
          icon={showMarkdown ? EyeOff : Eye}
          onClick={() => setShowMarkdown(!showMarkdown)}
          title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
        />
        <ToolbarButton
          icon={Clipboard}
          onClick={handleCopyMarkdown}
          title="Copy Markdown"
        />
        <ToolbarButton
          icon={Download}
          onClick={handleExport}
          title="Export to .md File"
        />
        <ToolbarButton
          icon={focusMode ? Minimize : Maximize}
          onClick={() => setFocusMode(!focusMode)}
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        />
      </div>
    </div>
  );
};

export default Toolbar;