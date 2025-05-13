import React, { useCallback, useEffect } from 'react';
import { Slate, Editable } from 'slate-react';
import { X, MinusCircle, ChevronUp } from 'lucide-react';

import { useEditorContext } from '../../context/EditorContext';
import EditorElement from './EditorElement';
import EditorLeaf from './EditorLeaf';
import Toolbar from '../toolbar/Toolbar';
import StatusBar from '../ui/StatusBar';
import MarkdownPreview from '../ui/MarkdownPreview';
import Modal from '../ui/Modal';
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
    <div className="min-h-screen bg-white flex flex-col">
      <Slate
        editor={editor}
        initialValue={editorState}
        onChange={value => setEditorState(value)}
      >
        {/* Top toolbar - visible on hover in focus mode */}
        <div 
          className={`${focusMode ? 'toolbar' : ''} sticky top-0 z-50 ${
            isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-center px-2 sm:px-4 py-2 border-b">
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
            className="fixed top-4 right-4 z-50 p-2 bg-white/90 rounded-full shadow-md backdrop-blur-sm hover:bg-white transition-all"
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
                  className={`outline-none min-h-screen prose prose-sm sm:prose-base lg:prose-lg ${
                    focusMode ? 'focus-mode-editor' : ''
                  } touch-manipulation`}
                />
              </KeyboardShortcuts>
            </div>
          </div>
          
          {/* Markdown preview pane - completely hidden in focus mode, stacked on mobile */}
          {showMarkdown && !focusMode && (
            <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200">
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
            className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all lg:hidden"
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
        <div className="space-y-4">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base"
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          
          <div>
            <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700">
              Alt Text (optional)
            </label>
            <input
              type="text"
              id="imageAlt"
              value={imageAlt}
              onChange={e => setImageAlt(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base"
              placeholder="Image description"
            />
          </div>
          
          <div>
            <label htmlFor="imageSize" className="block text-sm font-medium text-gray-700">
              Image Size
            </label>
            <select
              id="imageSize"
              value={imageSize}
              onChange={e => setImageSize(e.target.value as 'small' | 'medium' | 'large' | 'full')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base"
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={!imageUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="space-y-4">
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">
              Link URL
            </label>
            <input
              type="url"
              id="linkUrl"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base"
              placeholder="https://example.com"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          
          <div>
            <label htmlFor="linkText" className="block text-sm font-medium text-gray-700">
              Link Text (optional)
            </label>
            <input
              type="text"
              id="linkText"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base"
              placeholder="Click here"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLinkSubmit}
              disabled={!linkUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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