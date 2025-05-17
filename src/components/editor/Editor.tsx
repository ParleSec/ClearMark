import React, { useCallback, useEffect } from 'react';
import { Slate, Editable } from 'slate-react';
import { X, MinusCircle, ChevronUp } from 'lucide-react';

import { useEditorContext } from '../../context/EditorContext';
import EditorElement from './EditorElement';
import EditorLeaf from './EditorLeaf';
import Toolbar from '../toolbar/Toolbar';
import StatusBar from '../ui/StatusBar';
import MarkdownPreview from '../ui/MarkdownPreview';
import { Modal } from '../ui/Modal';
import FloatingToolbar from '../toolbar/FloatingToolbar';
import ImageToolbar from '../toolbar/ImageToolbar';
import KeyboardShortcuts from '../toolbar/KeyboardShortcuts';
import SaveStatus from '../ui/SaveStatus';

/**
 * Main Editor component with mobile-optimized features
 */
const Editor: React.FC = () => {
  const {
    editor,
    editorState,
    setEditorState,
    showMarkdown,
    focusMode,
    insertImage,
    insertLink,
    setFocusMode,
  } = useEditorContext();
  
  // Modal state for insert dialogs
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  
  // Form values for modals
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageAlt, setImageAlt] = React.useState('');
  const [imageSize, setImageSize] = React.useState<'small' | 'medium' | 'large' | 'full'>('medium');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkText, setLinkText] = React.useState('');
  
  // State for mobile-specific behavior
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showScrollToTop, setShowScrollToTop] = React.useState(false);
  
  // Handle scrolling behavior for mobile devices
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide the scroll-to-top button based on scroll position
      setShowScrollToTop(window.scrollY > 300);
      
      // Track if page is scrolled for toolbar transparency
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle scroll to top for mobile
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Custom rendering functions for Slate
  const renderElement = useCallback((props: any) => <EditorElement {...props} />, []);
  const renderLeaf = useCallback((props: any) => <EditorLeaf {...props} />, []);
  
  // Handle image insertion
  const handleInsertImage = () => {
    setShowImageModal(true);
  };
  
  const handleImageSubmit = () => {
    if (imageUrl) {
      insertImage(imageUrl, imageAlt, imageSize);
      setImageUrl('');
      setImageAlt('');
      setImageSize('medium');
      setShowImageModal(false);
    }
  };
  
  // Handle link insertion
  const handleInsertLink = () => {
    setShowLinkModal(true);
  };
  
  const handleLinkSubmit = () => {
    if (linkUrl) {
      insertLink(linkUrl, linkText);
      setLinkUrl('');
      setLinkText('');
      setShowLinkModal(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <Slate
        editor={editor}
        initialValue={editorState}
        onChange={value => setEditorState(value)}
      >
        {/* Top toolbar - visible on hover in focus mode */}
        <div 
          className={`${focusMode ? 'toolbar' : ''} sticky top-0 z-50 ${
            isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm' : 'bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex justify-between items-center px-2 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-800">
            <Toolbar 
              onInsertImage={handleInsertImage} 
              onInsertLink={handleInsertLink} 
            />
            <SaveStatus />
          </div>
        </div>
        
        {/* Exit focus mode button - enhanced for mobile */}
        {focusMode && (
          <button
            onClick={() => setFocusMode(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-full shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all"
            title="Exit focus mode"
          >
            <span className="hidden sm:inline">Exit Focus Mode</span>
            <X size={20} className="sm:hidden" />
          </button>
        )}
        
        {/* Floating toolbar - completely hidden in focus mode and on small screens */}
        {!focusMode && !showMarkdown && <FloatingToolbar />}
        
        {/* Floating image toolbar - shown when an image is selected */}
        {!focusMode && !showMarkdown && <ImageToolbar mode="floating" showControls="basic" />}
        
        {/* Main editor area with keyboard shortcuts */}
        <div className={`flex flex-col lg:flex-row flex-1 h-full ${focusMode ? 'main-content' : ''}`}>
          <div className={`transition-all duration-300 ${showMarkdown && !focusMode ? 'w-full lg:w-1/2' : 'w-full'}`}>
            <div className={`max-w-3xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 ${focusMode ? 'mt-12' : ''}`}>
              {/* Use KeyboardShortcuts to safely add keyboard shortcuts within the Slate context */}
              <KeyboardShortcuts>
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder={focusMode ? "Write your thoughts..." : "Start writing your blog post here..."}
                  spellCheck={true}
                  autoFocus={true}
                  className={`outline-none min-h-screen prose prose-sm sm:prose-base lg:prose-lg prose-slate dark:prose-invert ${
                    focusMode ? 'focus-mode-editor' : ''
                  } touch-manipulation`}
                />
              </KeyboardShortcuts>
            </div>
          </div>
          
          {/* Markdown preview pane - completely hidden in focus mode, stacked on mobile */}
          {showMarkdown && !focusMode && (
            <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
              <MarkdownPreview />
            </div>
          )}
        </div>
        
        {/* Status bar - completely hidden in focus mode */}
        {!focusMode && <StatusBar />}
        
        {/* Scroll to top button - only visible on mobile when scrolled down */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-50 p-3 bg-flow-600 text-white rounded-full shadow-lg hover:bg-flow-700 transition-all lg:hidden"
            aria-label="Scroll to top"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </Slate>
      
      {/* Image insertion modal - mobile optimized */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Insert Image"
      >
        <div className="space-y-4 p-4">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-flow-500 focus:ring-flow-500 p-2 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          
          <div>
            <label htmlFor="imageAlt" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Alt Text (optional)
            </label>
            <input
              type="text"
              id="imageAlt"
              value={imageAlt}
              onChange={e => setImageAlt(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-flow-500 focus:ring-flow-500 p-2 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Image description"
            />
          </div>
          
          <div>
            <label htmlFor="imageSize" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Image Size
            </label>
            <select
              id="imageSize"
              value={imageSize}
              onChange={e => setImageSize(e.target.value as 'small' | 'medium' | 'large' | 'full')}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-flow-500 focus:ring-flow-500 p-2 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="full">Full Width</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={!imageUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-flow-600 hover:bg-flow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Link insertion modal - mobile optimized */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Insert Link"
      >
        <div className="space-y-4 p-4">
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Link URL
            </label>
            <input
              type="url"
              id="linkUrl"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-flow-500 focus:ring-flow-500 p-2 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="https://example.com"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          
          <div>
            <label htmlFor="linkText" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Link Text (optional)
            </label>
            <input
              type="text"
              id="linkText"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-flow-500 focus:ring-flow-500 p-2 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Click here"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLinkSubmit}
              disabled={!linkUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-flow-600 hover:bg-flow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Editor;