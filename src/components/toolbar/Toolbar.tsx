import React from 'react';
import { 
  Bold, Italic, Code, Hash, List, ListOrdered, Quote, 
  Link as LinkIcon, Image as ImageIcon, Download, Eye, 
  EyeOff, Clipboard, Maximize, Minimize, Table, Plus, Minus
} from 'lucide-react';

import ToolbarButton from './ToolbarButton';
import { useEditorContext } from '../../context/EditorContext';
import { exportToMarkdownFile, copyMarkdownToClipboard } from '../../utils/exporters';
import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';
import { TableToolbar } from './TableToolbar';

interface ToolbarProps {
  onInsertImage: () => void;
  onInsertLink: () => void;
}

/**
 * Type-corrected toolbar component
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
    metadata,
    toggleFormat,
    isFormatActive,
    insertTable,
    insertRow,
    insertColumn,
    deleteRow,
    deleteColumn,
    isTableActive
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
      alert('Markdown copied to clipboard!');
    } else {
      alert('Failed to copy to clipboard. Please try again.');
    }
  };
  
  // Define IconProps type for custom icons
  type IconProps = React.ComponentProps<typeof Bold>;
  
  return (
    <div className={`border-b p-2 flex justify-between items-center bg-white z-10 
      ${focusMode ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}
    >
      {/* Text formatting tools */}
      <div className="flex items-center space-x-1">
        <div className="flex">
          <ToolbarButton 
            icon={Bold} 
            isActive={isFormatActive(MarkdownFormat.Bold)}
            onClick={() => toggleFormat(MarkdownFormat.Bold)}
            title="Bold"
          />
          <ToolbarButton 
            icon={Italic} 
            isActive={isFormatActive(MarkdownFormat.Italic)}
            onClick={() => toggleFormat(MarkdownFormat.Italic)}
            title="Italic"
          />
          <ToolbarButton 
            icon={Code} 
            isActive={isFormatActive(MarkdownFormat.Code)}
            onClick={() => toggleFormat(MarkdownFormat.Code)}
            title="Code"
          />
        </div>
        
        <div className="h-full w-px bg-gray-300 mx-2" />
        
        {/* Block formatting */}
        <div className="flex">
          <ToolbarButton 
            icon={Hash} 
            isActive={isFormatActive(MarkdownElementType.Heading1, true)}
            onClick={() => toggleFormat(MarkdownElementType.Heading1, true)}
            title="Heading 1"
          />
          <ToolbarButton 
            icon={(props: IconProps) => <Hash {...props} size={16} />} 
            isActive={isFormatActive(MarkdownElementType.Heading2, true)}
            onClick={() => toggleFormat(MarkdownElementType.Heading2, true)}
            title="Heading 2"
          />
          <ToolbarButton 
            icon={(props: IconProps) => <Hash {...props} size={14} />} 
            isActive={isFormatActive(MarkdownElementType.Heading3, true)}
            onClick={() => toggleFormat(MarkdownElementType.Heading3, true)}
            title="Heading 3"
          />
          <ToolbarButton 
            icon={Quote} 
            isActive={isFormatActive(MarkdownElementType.BlockQuote, true)}
            onClick={() => toggleFormat(MarkdownElementType.BlockQuote, true)}
            title="Quote"
          />
          <ToolbarButton 
            icon={List} 
            isActive={isFormatActive(MarkdownElementType.BulletedList, true)}
            onClick={() => toggleFormat(MarkdownElementType.BulletedList, true)}
            title="Bullet List"
          />
          <ToolbarButton 
            icon={ListOrdered} 
            isActive={isFormatActive(MarkdownElementType.NumberedList, true)}
            onClick={() => toggleFormat(MarkdownElementType.NumberedList, true)}
            title="Numbered List"
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

        <div className="h-full w-px bg-gray-300 mx-2" />
        
        {/* Table tools */}
        <div className="flex">
          <ToolbarButton
            icon={Table}
            onClick={() => insertTable()}
            title="Insert Table"
          />
          {isTableActive() && (
            <>
              <ToolbarButton
                icon={Plus}
                onClick={insertRow}
                title="Insert Row"
              />
              <ToolbarButton
                icon={Plus}
                onClick={insertColumn}
                title="Insert Column"
              />
              <ToolbarButton
                icon={Minus}
                onClick={deleteRow}
                title="Delete Row"
              />
              <ToolbarButton
                icon={Minus}
                onClick={deleteColumn}
                title="Delete Column"
              />
            </>
          )}
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