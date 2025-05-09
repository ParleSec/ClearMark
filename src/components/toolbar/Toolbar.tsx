import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Code, Hash, List, ListOrdered, Quote, 
  Link as LinkIcon, Image as ImageIcon, FileDown, Eye, 
  EyeOff, Copy, Maximize, Minimize, Table, Plus, Minus,
  Menu, X, MoreHorizontal, ChevronRight
} from 'lucide-react';

import ToolbarButton from './ToolbarButton';
import DiagramButton from './DiagramButton';
import { useEditorContext } from '../../context/EditorContext';
import { exportToMarkdownFile, copyMarkdownToClipboard } from '../../utils/exporters';
import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';

// Define IconProps type for custom icons
type IconProps = React.ComponentProps<typeof Bold>;

// Main toolbar component with balanced design
const Toolbar: React.FC<{
  onInsertImage: () => void;
  onInsertLink: () => void;
}> = ({ 
  onInsertImage, 
  onInsertLink 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  
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

  // Close expanded group when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setExpandedGroup(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle expansion of a group
  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroup(expandedGroup === groupName ? null : groupName);
  };
  
  // Extract component for section divider to keep code DRY
  const Divider = () => <div className="h-6 w-px bg-gray-200 mx-1" />;
  
  // Create a section label component for improved organization
  const SectionLabel = ({ text }: { text: string }) => (
    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium px-1.5">
      {text}
    </div>
  );
  
  return (
    <div className={`bg-white/95 backdrop-blur-sm z-50 sticky top-0 transition-all duration-300
      ${focusMode ? 'opacity-0 hover:opacity-100' : 'shadow-sm border-b border-gray-200'}`}
    >
      {/* Mobile header */}
      <div className="flex md:hidden items-center justify-between p-1.5 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label={mobileMenuOpen ? 'Close toolbar' : 'Open toolbar'}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        
        {/* Always visible mobile view/export tools */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={Copy}
            onClick={handleCopyMarkdown}
            title="Copy Markdown"
          />
          <ToolbarButton
            icon={showMarkdown ? EyeOff : Eye}
            onClick={() => setShowMarkdown(!showMarkdown)}
            title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
          />
          <ToolbarButton
            icon={focusMode ? Minimize : Maximize}
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          />
        </div>
      </div>
      
      {/* Mobile expanded menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 
        ${mobileMenuOpen ? 'max-h-96 py-2' : 'max-h-0'}`}>
        <div className="px-2 space-y-3">
          {/* Text formatting */}
          <div>
            <SectionLabel text="Format" />
            <div className="flex flex-wrap items-center gap-0.5 mt-1">
              <ToolbarButton 
                icon={Bold} 
                isActive={isFormatActive(MarkdownFormat.Bold)}
                onClick={() => toggleFormat(MarkdownFormat.Bold)}
                title="Bold"
                keyboardShortcut="Ctrl+B"
              />
              <ToolbarButton 
                icon={Italic} 
                isActive={isFormatActive(MarkdownFormat.Italic)}
                onClick={() => toggleFormat(MarkdownFormat.Italic)}
                title="Italic"
                keyboardShortcut="Ctrl+I"
              />
              <ToolbarButton 
                icon={Code} 
                isActive={isFormatActive(MarkdownFormat.Code)}
                onClick={() => toggleFormat(MarkdownFormat.Code)}
                title="Code"
                keyboardShortcut="Ctrl+`"
              />
            </div>
          </div>
          
          {/* Block formatting */}
          <div>
            <SectionLabel text="Blocks" />
            <div className="flex flex-wrap items-center gap-0.5 mt-1">
              <ToolbarButton 
                icon={Hash} 
                isActive={isFormatActive(MarkdownElementType.Heading1, true)}
                onClick={() => toggleFormat(MarkdownElementType.Heading1, true)}
                title="Heading 1"
              />
              <ToolbarButton 
                icon={(props: IconProps) => <Hash {...props} size={15} />} 
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
              <ToolbarButton 
                icon={Quote} 
                isActive={isFormatActive(MarkdownElementType.BlockQuote, true)}
                onClick={() => toggleFormat(MarkdownElementType.BlockQuote, true)}
                title="Quote"
              />
            </div>
          </div>
          
          {/* Insert options */}
          <div>
            <SectionLabel text="Insert" />
            <div className="flex flex-wrap items-center gap-0.5 mt-1">
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
              <DiagramButton />
              <ToolbarButton
                icon={Table}
                onClick={() => insertTable()}
                title="Insert Table"
              />
            </div>
          </div>
          
          {/* Show table controls only when a table is active */}
          {isTableActive() && (
            <div>
              <SectionLabel text="Table" />
              <div className="flex flex-wrap items-center gap-0.5 mt-1">
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
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div>
            <SectionLabel text="Actions" />
            <div className="flex flex-wrap items-center gap-0.5 mt-1">
              <ToolbarButton
                icon={FileDown}
                onClick={handleExport}
                title="Export to .md File"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop toolbar */}
      <div className="hidden md:block">
        {/* Main editing toolbar on the left */}
        <div className="flex items-center p-1.5 border-b border-gray-100">
          <div className="flex items-center">
            {/* Text formatting */}
            <SectionLabel text="Format" />
            <div className="flex items-center mr-2">
              <ToolbarButton 
                icon={Bold} 
                isActive={isFormatActive(MarkdownFormat.Bold)}
                onClick={() => toggleFormat(MarkdownFormat.Bold)}
                title="Bold"
                keyboardShortcut="Ctrl+B"
              />
              <ToolbarButton 
                icon={Italic} 
                isActive={isFormatActive(MarkdownFormat.Italic)}
                onClick={() => toggleFormat(MarkdownFormat.Italic)}
                title="Italic"
                keyboardShortcut="Ctrl+I"
              />
              <ToolbarButton 
                icon={Code} 
                isActive={isFormatActive(MarkdownFormat.Code)}
                onClick={() => toggleFormat(MarkdownFormat.Code)}
                title="Code"
                keyboardShortcut="Ctrl+`"
              />
            </div>
            
            <Divider />
            
            {/* Headings */}
            <SectionLabel text="Headings" />
            <div className="flex items-center mr-2">
              <ToolbarButton 
                icon={Hash} 
                isActive={isFormatActive(MarkdownElementType.Heading1, true)}
                onClick={() => toggleFormat(MarkdownElementType.Heading1, true)}
                title="Heading 1"
              />
              <ToolbarButton 
                icon={(props: IconProps) => <Hash {...props} size={15} />} 
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
            </div>
            
            <Divider />
            
            {/* Lists & quotes */}
            <SectionLabel text="Lists" />
            <div className="flex items-center mr-2">
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
              <ToolbarButton 
                icon={Quote} 
                isActive={isFormatActive(MarkdownElementType.BlockQuote, true)}
                onClick={() => toggleFormat(MarkdownElementType.BlockQuote, true)}
                title="Quote"
              />
            </div>
            
            <Divider />
            
            {/* Insert options */}
            <SectionLabel text="Insert" />
            <div className="flex items-center mr-2">
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
              <DiagramButton />
              <ToolbarButton
                icon={Table}
                onClick={() => insertTable()}
                title="Insert Table"
              />
            </div>
            
            {/* Table controls */}
            {isTableActive() && (
              <>
                <Divider />
                <SectionLabel text="Table" />
                <div className="flex items-center mr-2">
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
                </div>
              </>
            )}
          </div>
          
          {/* Spacer to push view/export controls to right */}
          <div className="flex-grow" />
          
          {/* Right side toolbar with export and view options */}
          <div className="flex items-center h-full border-l border-gray-200 pl-3 ml-2">
            <SectionLabel text="Actions" />
            <div className="flex items-center">
              <ToolbarButton
                icon={Copy}
                onClick={handleCopyMarkdown}
                title="Copy Markdown"
              />
              <ToolbarButton
                icon={FileDown}
                onClick={handleExport}
                title="Export to .md"
              />
              <Divider />
              <ToolbarButton
                icon={showMarkdown ? EyeOff : Eye}
                onClick={() => setShowMarkdown(!showMarkdown)}
                title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
              />
              <ToolbarButton
                icon={focusMode ? Minimize : Maximize}
                onClick={() => setFocusMode(!focusMode)}
                title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;