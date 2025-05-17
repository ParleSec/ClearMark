import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Code, Hash, List, ListOrdered, Quote, 
  Link as LinkIcon, Image as ImageIcon, FileDown, Eye, 
  EyeOff, Copy, Maximize, Minimize, Table, Plus, Minus,
  Menu, X, MoreHorizontal, ChevronRight, ImagePlus,
  Settings, Sun, Moon
} from 'lucide-react';

import ToolbarButton from './ToolbarButton';
import DiagramButton from './DiagramButton';
import { useEditorContext } from '../../context/EditorContext';
import { exportToMarkdownFile, copyMarkdownToClipboard } from '../../utils/exporters';
import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';
import { Editor, Element as SlateElement } from 'slate';
import ImageToolbar from './ImageToolbar';

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
  // State for filename dialog
  const [showFilenameDialog, setShowFilenameDialog] = useState(false);
  const [exportFilename, setExportFilename] = useState('');
  
  const {
    editor,
    editorState,
    showMarkdown,
    setShowMarkdown,
    focusMode,
    setFocusMode,
    darkMode,
    toggleDarkMode,
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
  
  // Add state to track if image submenu is open
  const [showImageSubmenu, setShowImageSubmenu] = useState(false);
  
  // Function to check if an image is currently selected
  const isImageSelected = () => {
    if (!editor.selection) return false;
    
    try {
      const [match] = Editor.nodes(editor, {
        match: n => 
          !Editor.isEditor(n) && 
          SlateElement.isElement(n) && 
          (n as any).type === 'image',
        at: editor.selection
      });
      
      return !!match;
    } catch (error) {
      return false;
    }
  };
  
  // Handle exporting to markdown file
  const handleExport = () => {
    // Set initial filename value
    setExportFilename(metadata.title || 'blog-post');
    // Show filename dialog
    setShowFilenameDialog(true);
  };
  
  // Handle actual export after filename confirmation
  const handleExportConfirm = () => {
    // Use the user-provided filename or fallback to a default
    const filename = exportFilename.trim() || 'blog-post';
    exportToMarkdownFile(editorState, filename, metadata);
    setShowFilenameDialog(false);
  };
  
  // Handle closing the dialog
  const handleExportCancel = () => {
    setShowFilenameDialog(false);
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
  
  // Handle keydown events in the filename dialog
  const handleFilenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExportConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleExportCancel();
    }
  };
  
  // Handle click outside to close the dialog
  const handleDialogBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the backdrop itself was clicked (not the dialog content)
    if (e.target === e.currentTarget) {
      handleExportCancel();
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
    <div className={`bg-white/90 dark:bg-slate-900/95 backdrop-blur-md z-50 sticky top-0 transition-all duration-300
      ${focusMode ? 'opacity-0 hover:opacity-100' : 'shadow-[0_1px_4px_rgba(14,165,233,0.07)] border-b border-sky-100/80 dark:border-sky-900/50'}`}
    >
      {/* Mobile header - hidden on iPad in landscape mode */}
      <div className={`flex lg:hidden ${isTablet && isLandscape ? 'hidden' : 'flex'} items-center justify-between p-2 border-b border-sky-100/50 dark:border-sky-900/60`}>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-[0.35rem] text-slate-700 dark:text-slate-200 bg-gradient-to-b from-slate-50 to-sky-50/40 dark:from-slate-800 dark:to-sky-900/30 hover:from-sky-50 hover:to-cyan-50/40 dark:hover:from-sky-900/30 dark:hover:to-cyan-900/20 border border-t-transparent border-x-sky-100/60 border-b-sky-200/80 dark:border-t-transparent dark:border-x-sky-800/30 dark:border-b-sky-700/50 touch-manipulation shadow-sm"
          aria-label={mobileMenuOpen ? 'Close toolbar' : 'Open toolbar'}
          style={{
            borderTopLeftRadius: '0.4rem',
            borderTopRightRadius: '0.3rem',
            borderBottomLeftRadius: '0.3rem',
            borderBottomRightRadius: '0.5rem',
          }}
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
          <ToolbarButton
            icon={darkMode ? Sun : Moon}
            onClick={toggleDarkMode}
            title={darkMode ? "Light Mode" : "Dark Mode"}
            mobileFriendly
          />
        </div>
      </div>
      
      {/* Mobile expanded menu - iPad-optimized layout */}
      {mobileMenuOpen && (
        <div className={`py-3 px-2 bg-gradient-to-b from-slate-50 to-blue-50/20 dark:from-slate-900 dark:to-blue-950/30 border-b border-sky-100 dark:border-sky-900/50 overflow-auto ${isLandscape ? 'max-h-[40vh]' : 'max-h-[60vh]'}`}>
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
                      onClick={() => isImageSelected() ? setShowImageSubmenu(!showImageSubmenu) : onInsertImage()}
                      title={isImageSelected() ? "Image Options" : "Insert Image"}
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
                    onClick={() => isImageSelected() ? setShowImageSubmenu(!showImageSubmenu) : onInsertImage()}
                    title={isImageSelected() ? "Image Options" : "Insert Image"}
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
      )}
      
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
              onClick={() => isImageSelected() ? setShowImageSubmenu(!showImageSubmenu) : onInsertImage()}
              title={isImageSelected() ? "Image Options" : "Insert Image"}
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
            <ToolbarButton
              icon={darkMode ? Sun : Moon}
              onClick={toggleDarkMode}
              title={darkMode ? "Light Mode" : "Dark Mode"}
              mobileFriendly
            />
          </div>
        </div>
      </div>
      
      {/* Desktop toolbar */}
      <div className="hidden lg:block">
        {/* Main editing toolbar on the left */}
        <div className="flex items-center p-1.5 border-b border-sky-100/70 dark:border-sky-900/60 bg-gradient-to-r from-slate-50/60 to-blue-50/10 dark:from-slate-900/80 dark:to-blue-950/20">
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
                onClick={() => isImageSelected() ? setShowImageSubmenu(!showImageSubmenu) : onInsertImage()}
                title={isImageSelected() ? "Image Options" : "Insert Image"}
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
              <ToolbarButton
                icon={darkMode ? Sun : Moon}
                onClick={toggleDarkMode}
                title={darkMode ? "Light Mode" : "Dark Mode"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filename Dialog */}
      {showFilenameDialog && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={handleDialogBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Export File</h3>
            <div className="mb-4">
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
                Filename
              </label>
              <input
                type="text"
                id="filename"
                value={exportFilename}
                onChange={e => setExportFilename(e.target.value)}
                onKeyDown={handleFilenameKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter filename"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">.md extension will be added automatically if not included</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleExportCancel}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 
                  bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportConfirm}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md
                  text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2
                  focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Submenu */}
      {showImageSubmenu && (
        <div className="absolute left-0 mt-1 z-50 bg-white rounded shadow-lg border border-gray-200 p-1 whitespace-nowrap" 
             onMouseLeave={() => setShowImageSubmenu(false)}>
          <button
            className="flex items-center space-x-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 rounded-sm"
            onClick={() => {
              onInsertImage();
              setShowImageSubmenu(false);
            }}
          >
            <ImagePlus size={16} />
            <span>Insert New Image</span>
          </button>
          <button
            className="flex items-center space-x-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 rounded-sm"
            onClick={() => {
              setShowImageSubmenu(false);
              // The ImageToolbar will handle showing the image toolbar
            }}
          >
            <Settings size={16} />
            <span>Edit Current Image</span>
          </button>
        </div>
      )}

      {/* Image toolbar in floating mode */}
      <ImageToolbar mode="floating" showControls="basic" />
    </div>
  );
};

export default Toolbar;