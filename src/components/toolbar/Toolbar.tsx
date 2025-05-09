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

// Main toolbar component with mobile and tablet optimization
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
  // Track device orientation for better iPad layout
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );
  
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
  
  // Monitor orientation changes for iPad-specific layout
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

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

  // Close mobile menu when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mobileMenuOpen]);

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
  
  // Detect if device is likely an iPad
  const isTablet = typeof window !== 'undefined' && 
    window.navigator.userAgent.includes('iPad') || 
    (window.navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);
  
  return (
    <div className={`bg-white/95 backdrop-blur-sm z-50 sticky top-0 transition-all duration-300
      ${focusMode ? 'opacity-0 hover:opacity-100' : 'shadow-sm border-b border-gray-200'}`}
    >
      {/* Mobile header - hidden on iPad in landscape mode */}
      <div className={`flex lg:hidden ${isTablet && isLandscape ? 'hidden' : 'flex'} items-center justify-between p-2 border-b border-gray-100`}>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 touch-manipulation"
          aria-label={mobileMenuOpen ? 'Close toolbar' : 'Open toolbar'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="ml-1 text-sm font-medium">
            {mobileMenuOpen ? 'Close' : 'Format'}
          </span>
        </button>
        
        {/* Always visible mobile view/export tools with better spacing */}
        <div className="flex items-center gap-1.5">
          <ToolbarButton
            icon={Copy}
            onClick={handleCopyMarkdown}
            title="Copy Markdown"
            mobileFriendly
          />
          <ToolbarButton
            icon={showMarkdown ? EyeOff : Eye}
            onClick={() => setShowMarkdown(!showMarkdown)}
            title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
            mobileFriendly
          />
          <ToolbarButton
            icon={focusMode ? Minimize : Maximize}
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
            mobileFriendly
          />
        </div>
      </div>
      
      {/* Mobile expanded menu - iPad-optimized layout */}
      <div className={`lg:hidden ${isTablet && isLandscape ? 'hidden' : ''} overflow-hidden transition-all duration-300 
        ${mobileMenuOpen ? 'max-h-[70vh] overflow-y-auto pb-4' : 'max-h-0'}`}>
        <div className="px-3 space-y-4 pt-2">
          {/* Frequently used formatting tools - grid layout for iPad */}
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className={`grid ${isTablet ? 'grid-cols-8' : 'grid-cols-6'} gap-1.5 justify-items-center`}>
              <ToolbarButton 
                icon={Bold} 
                isActive={isFormatActive(MarkdownFormat.Bold)}
                onClick={() => toggleFormat(MarkdownFormat.Bold)}
                title="Bold"
                keyboardShortcut="Ctrl+B"
                mobileFriendly
              />
              <ToolbarButton 
                icon={Italic} 
                isActive={isFormatActive(MarkdownFormat.Italic)}
                onClick={() => toggleFormat(MarkdownFormat.Italic)}
                title="Italic"
                keyboardShortcut="Ctrl+I"
                mobileFriendly
              />
              <ToolbarButton 
                icon={Code} 
                isActive={isFormatActive(MarkdownFormat.Code)}
                onClick={() => toggleFormat(MarkdownFormat.Code)}
                title="Code"
                keyboardShortcut="Ctrl+`"
                mobileFriendly
              />
              <ToolbarButton 
                icon={Hash} 
                isActive={isFormatActive(MarkdownElementType.Heading1, true)}
                onClick={() => toggleFormat(MarkdownElementType.Heading1, true)}
                title="Heading 1"
                mobileFriendly
              />
              <ToolbarButton 
                icon={List} 
                isActive={isFormatActive(MarkdownElementType.BulletedList, true)}
                onClick={() => toggleFormat(MarkdownElementType.BulletedList, true)}
                title="Bullet List"
                mobileFriendly
              />
              <ToolbarButton 
                icon={Quote} 
                isActive={isFormatActive(MarkdownElementType.BlockQuote, true)}
                onClick={() => toggleFormat(MarkdownElementType.BlockQuote, true)}
                title="Quote"
                mobileFriendly
              />
              {isTablet && (
                <>
                  <ToolbarButton
                    icon={ImageIcon}
                    onClick={onInsertImage}
                    title="Insert Image"
                    mobileFriendly
                  />
                  <ToolbarButton
                    icon={LinkIcon}
                    onClick={onInsertLink}
                    title="Insert Link"
                    mobileFriendly
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Remaining controls with iPad-optimized layout */}
          <div className={`grid ${isTablet ? 'grid-cols-2 gap-6' : 'grid-cols-1 gap-0'}`}>
            {/* Text formatting */}
            <div>
              <SectionLabel text="Format" />
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <ToolbarButton 
                  icon={Bold} 
                  isActive={isFormatActive(MarkdownFormat.Bold)}
                  onClick={() => toggleFormat(MarkdownFormat.Bold)}
                  title="Bold"
                  keyboardShortcut="Ctrl+B"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={Italic} 
                  isActive={isFormatActive(MarkdownFormat.Italic)}
                  onClick={() => toggleFormat(MarkdownFormat.Italic)}
                  title="Italic"
                  keyboardShortcut="Ctrl+I"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={Code} 
                  isActive={isFormatActive(MarkdownFormat.Code)}
                  onClick={() => toggleFormat(MarkdownFormat.Code)}
                  title="Code"
                  keyboardShortcut="Ctrl+`"
                  mobileFriendly
                />
              </div>
            </div>
            
            {/* Block formatting */}
            <div>
              <SectionLabel text="Blocks" />
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <ToolbarButton 
                  icon={Hash} 
                  isActive={isFormatActive(MarkdownElementType.Heading1, true)}
                  onClick={() => toggleFormat(MarkdownElementType.Heading1, true)}
                  title="Heading 1"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={(props: IconProps) => <Hash {...props} size={15} />} 
                  isActive={isFormatActive(MarkdownElementType.Heading2, true)}
                  onClick={() => toggleFormat(MarkdownElementType.Heading2, true)}
                  title="Heading 2"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={(props: IconProps) => <Hash {...props} size={14} />} 
                  isActive={isFormatActive(MarkdownElementType.Heading3, true)}
                  onClick={() => toggleFormat(MarkdownElementType.Heading3, true)}
                  title="Heading 3"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={List} 
                  isActive={isFormatActive(MarkdownElementType.BulletedList, true)}
                  onClick={() => toggleFormat(MarkdownElementType.BulletedList, true)}
                  title="Bullet List"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={ListOrdered} 
                  isActive={isFormatActive(MarkdownElementType.NumberedList, true)}
                  onClick={() => toggleFormat(MarkdownElementType.NumberedList, true)}
                  title="Numbered List"
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={Quote} 
                  isActive={isFormatActive(MarkdownElementType.BlockQuote, true)}
                  onClick={() => toggleFormat(MarkdownElementType.BlockQuote, true)}
                  title="Quote"
                  mobileFriendly
                />
              </div>
            </div>
            
            {/* Insert options */}
            <div>
              <SectionLabel text="Insert" />
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <ToolbarButton 
                  icon={ImageIcon} 
                  onClick={onInsertImage} 
                  title="Insert Image" 
                  mobileFriendly
                />
                <ToolbarButton 
                  icon={LinkIcon} 
                  onClick={onInsertLink} 
                  title="Insert Link" 
                  mobileFriendly
                />
                <DiagramButton />
                <ToolbarButton
                  icon={Table}
                  onClick={() => insertTable()}
                  title="Insert Table"
                  mobileFriendly
                />
              </div>
            </div>
            
            {/* Show table controls only when a table is active */}
            {isTableActive() && (
              <div>
                <SectionLabel text="Table" />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <ToolbarButton
                    icon={Plus}
                    onClick={insertRow}
                    title="Insert Row"
                    mobileFriendly
                  />
                  <ToolbarButton
                    icon={Plus}
                    onClick={insertColumn}
                    title="Insert Column"
                    mobileFriendly
                  />
                  <ToolbarButton
                    icon={Minus}
                    onClick={deleteRow}
                    title="Delete Row"
                    mobileFriendly
                  />
                  <ToolbarButton
                    icon={Minus}
                    onClick={deleteColumn}
                    title="Delete Column"
                    mobileFriendly
                  />
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div>
              <SectionLabel text="Actions" />
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <ToolbarButton
                  icon={FileDown}
                  onClick={handleExport}
                  title="Export to .md File"
                  mobileFriendly
                />
              </div>
            </div>
          </div>

          {/* Close button at bottom for easy access */}
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 touch-manipulation"
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
      
      {/* iPad-specific toolbar for landscape mode */}
      <div className={`${isTablet && isLandscape ? 'flex' : 'hidden'} lg:hidden items-center px-2 py-1.5 border-b border-gray-100`}>
        <div className="flex items-center flex-1">
          <div className="flex items-center mr-3 space-x-0.5">
            <ToolbarButton 
              icon={Bold} 
              isActive={isFormatActive(MarkdownFormat.Bold)}
              onClick={() => toggleFormat(MarkdownFormat.Bold)}
              title="Bold"
              keyboardShortcut="Ctrl+B"
              mobileFriendly
            />
            <ToolbarButton 
              icon={Italic} 
              isActive={isFormatActive(MarkdownFormat.Italic)}
              onClick={() => toggleFormat(MarkdownFormat.Italic)}
              title="Italic"
              keyboardShortcut="Ctrl+I"
              mobileFriendly
            />
            <ToolbarButton 
              icon={Code} 
              isActive={isFormatActive(MarkdownFormat.Code)}
              onClick={() => toggleFormat(MarkdownFormat.Code)}
              title="Code"
              keyboardShortcut="Ctrl+`"
              mobileFriendly
            />
          </div>
          
          <Divider />
          
          <div className="flex items-center mr-3 space-x-0.5">
            <ToolbarButton 
              icon={Hash} 
              isActive={isFormatActive(MarkdownElementType.Heading1, true)}
              onClick={() => toggleFormat(MarkdownElementType.Heading1, true)}
              title="Heading 1"
              mobileFriendly
            />
            <ToolbarButton 
              icon={(props: IconProps) => <Hash {...props} size={15} />} 
              isActive={isFormatActive(MarkdownElementType.Heading2, true)}
              onClick={() => toggleFormat(MarkdownElementType.Heading2, true)}
              title="Heading 2"
              mobileFriendly
            />
            <ToolbarButton 
              icon={(props: IconProps) => <Hash {...props} size={14} />} 
              isActive={isFormatActive(MarkdownElementType.Heading3, true)}
              onClick={() => toggleFormat(MarkdownElementType.Heading3, true)}
              title="Heading 3"
              mobileFriendly
            />
          </div>
          
          <Divider />
          
          <div className="flex items-center mr-3 space-x-0.5">
            <ToolbarButton 
              icon={List} 
              isActive={isFormatActive(MarkdownElementType.BulletedList, true)}
              onClick={() => toggleFormat(MarkdownElementType.BulletedList, true)}
              title="Bullet List"
              mobileFriendly
            />
            <ToolbarButton 
              icon={ListOrdered} 
              isActive={isFormatActive(MarkdownElementType.NumberedList, true)}
              onClick={() => toggleFormat(MarkdownElementType.NumberedList, true)}
              title="Numbered List"
              mobileFriendly
            />
            <ToolbarButton 
              icon={Quote} 
              isActive={isFormatActive(MarkdownElementType.BlockQuote, true)}
              onClick={() => toggleFormat(MarkdownElementType.BlockQuote, true)}
              title="Quote"
              mobileFriendly
            />
          </div>
          
          <Divider />
          
          <div className="flex items-center space-x-0.5">
            <ToolbarButton 
              icon={ImageIcon} 
              onClick={onInsertImage} 
              title="Insert Image" 
              mobileFriendly
            />
            <ToolbarButton 
              icon={LinkIcon} 
              onClick={onInsertLink} 
              title="Insert Link" 
              mobileFriendly
            />
            <DiagramButton />
            <ToolbarButton
              icon={Table}
              onClick={() => insertTable()}
              title="Insert Table"
              mobileFriendly
            />
          </div>
          
          {isTableActive() && (
            <>
              <Divider />
              <div className="flex items-center space-x-0.5">
                <ToolbarButton
                  icon={Plus}
                  onClick={insertRow}
                  title="Insert Row"
                  mobileFriendly
                />
                <ToolbarButton
                  icon={Plus}
                  onClick={insertColumn}
                  title="Insert Column"
                  mobileFriendly
                />
                <ToolbarButton
                  icon={Minus}
                  onClick={deleteRow}
                  title="Delete Row"
                  mobileFriendly
                />
                <ToolbarButton
                  icon={Minus}
                  onClick={deleteColumn}
                  title="Delete Column"
                  mobileFriendly
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center h-full border-l border-gray-200 pl-3 ml-2">
          <div className="flex items-center">
            <ToolbarButton
              icon={Copy}
              onClick={handleCopyMarkdown}
              title="Copy Markdown"
              mobileFriendly
            />
            <ToolbarButton
              icon={FileDown}
              onClick={handleExport}
              title="Export to .md"
              mobileFriendly
            />
            <Divider />
            <ToolbarButton
              icon={showMarkdown ? EyeOff : Eye}
              onClick={() => setShowMarkdown(!showMarkdown)}
              title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
              mobileFriendly
            />
            <ToolbarButton
              icon={focusMode ? Minimize : Maximize}
              onClick={() => setFocusMode(!focusMode)}
              title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              mobileFriendly
            />
          </div>
        </div>
      </div>
      
      {/* Desktop toolbar */}
      <div className="hidden lg:block">
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