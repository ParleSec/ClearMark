import React, { useCallback } from 'react';
import { Slate, Editable } from 'slate-react';

import { useEditorContext } from '../../context/EditorContext';
import EditorElement from './EditorElement';
import EditorLeaf from './EditorLeaf';
import Toolbar from '../toolbar/Toolbar';
import StatusBar from '../ui/StatusBar';
import MarkdownPreview from '../ui/MarkdownPreview';
import Modal from '../ui/Modal';
import FloatingToolbar from '../toolbar/FloatingToolbar';
import KeyboardShortcuts from '../toolbar/KeyboardShortcuts';

/**
 * Main Editor component with properly structured keyboard shortcuts
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
  } = useEditorContext();
  
  // Modal state for insert dialogs
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  
  // Form values for modals
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageAlt, setImageAlt] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkText, setLinkText] = React.useState('');
  
  // Custom rendering functions for Slate
  const renderElement = useCallback((props: any) => <EditorElement {...props} />, []);
  const renderLeaf = useCallback((props: any) => <EditorLeaf {...props} />, []);
  
  // Handle image insertion
  const handleInsertImage = () => {
    setShowImageModal(true);
  };
  
  const handleImageSubmit = () => {
    if (imageUrl) {
      insertImage(imageUrl, imageAlt);
      setImageUrl('');
      setImageAlt('');
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
        {/* Top toolbar */}
        <Toolbar 
          onInsertImage={handleInsertImage} 
          onInsertLink={handleInsertLink} 
        />
        
        {/* Floating toolbar for selected text */}
        <FloatingToolbar />
        
        {/* Main editor area with keyboard shortcuts */}
        <div className="flex flex-1 h-full">
          <div className={`transition-all duration-300 ${showMarkdown ? 'w-1/2' : 'w-full'}`}>
            <div className={`max-w-3xl mx-auto px-8 py-6 ${focusMode ? 'mt-12' : ''}`}>
              {/* Use KeyboardShortcuts to safely add keyboard shortcuts within the Slate context */}
              <KeyboardShortcuts>
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Start writing your blog post here..."
                  spellCheck={true}
                  autoFocus={true}
                  className="outline-none min-h-screen prose prose-lg"
                />
              </KeyboardShortcuts>
            </div>
          </div>
          
          {/* Markdown preview pane */}
          {showMarkdown && <MarkdownPreview />}
        </div>
        
        {/* Status bar */}
        <StatusBar />
      </Slate>
      
      {/* Image insertion modal */}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Image description"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={!imageUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Link insertion modal */}
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
              type="text"
              id="linkUrl"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Click here"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLinkSubmit}
              disabled={!linkUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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