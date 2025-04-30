import React, { useState } from 'react';
import { RenderElementProps, useSlate, ReactEditor } from 'slate-react';
import { AlignLeft, AlignCenter, AlignRight, Maximize, Minimize, Edit, Trash } from 'lucide-react';
import { Path, Transforms } from 'slate';

import { CustomElement, ImageElement } from '../../types/editor';
import { setImageAlignment, setImageSize, updateImageProperties } from '../editor/plugins/withImages';

interface EditorElementProps extends RenderElementProps {
  element: CustomElement;
}

/**
 * Enhanced component for rendering Slate elements with improved visual styling
 * and interactive controls for images
 */
export const EditorElement: React.FC<EditorElementProps> = ({ attributes, children, element }) => {
  const editor = useSlate();
  const [showImageControls, setShowImageControls] = useState(false);
  
  // Helper to get element path
  const getElementPath = (): Path => {
    const path = ReactEditor.findPath(editor as ReactEditor, element);
    return path;
  };
  
  switch (element.type) {
    case 'paragraph':
      return (
        <p className="my-2 leading-relaxed" {...attributes}>
          {children}
        </p>
      );
    
    case 'heading-one':
      return (
        <h1 className="text-3xl font-bold mt-6 mb-2 text-gray-900 dark:text-gray-100" {...attributes}>
          {children}
        </h1>
      );
    
    case 'heading-two':
      return (
        <h2 className="text-2xl font-bold mt-5 mb-2 text-gray-800 dark:text-gray-200" {...attributes}>
          {children}
        </h2>
      );
    
    case 'heading-three':
      return (
        <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200" {...attributes}>
          {children}
        </h3>
      );
    
    case 'block-quote':
      return (
        <blockquote 
          className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300" 
          {...attributes}
        >
          {children}
        </blockquote>
      );
    
    case 'bulleted-list':
      return (
        <ul className="list-disc ml-6 my-2 text-gray-800 dark:text-gray-200" {...attributes}>
          {children}
        </ul>
      );
    
    case 'numbered-list':
      return (
        <ol className="list-decimal ml-6 my-2 text-gray-800 dark:text-gray-200" {...attributes}>
          {children}
        </ol>
      );
    
    case 'list-item':
      return (
        <li className="my-1" {...attributes}>
          {children}
        </li>
      );
    
    case 'code-block':
      return (
        <pre 
          className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm my-3 overflow-x-auto border border-gray-200 dark:border-gray-700" 
          {...attributes}
        >
          <code className="text-gray-800 dark:text-gray-200">{children}</code>
        </pre>
      );
    
    case 'image': {
      const imageElement = element as ImageElement;
      const { url, alt, size = 'medium', alignment = 'center' } = imageElement;
      
      // Calculate width based on size
      const getWidthClass = () => {
        switch (size) {
          case 'small': return 'max-w-xs';
          case 'medium': return 'max-w-md';  
          case 'large': return 'max-w-xl';
          case 'full': return 'max-w-full';
          default: return 'max-w-md';
        }
      };
      
      // Calculate alignment class
      const getAlignmentClass = () => {
        switch (alignment) {
          case 'left': return 'justify-start';
          case 'center': return 'justify-center';
          case 'right': return 'justify-end';
          default: return 'justify-center';
        }
      };
      
      // Delete image handler
      const handleDeleteImage = () => {
        try {
          const path = ReactEditor.findPath(editor as ReactEditor, element);

          Transforms.removeNodes(editor, { at: path });
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      };
      
      // Edit alt text handler
      const handleEditAlt = () => {
        try {
          const path = ReactEditor.findPath(editor as ReactEditor, element);

          const newAlt = prompt('Edit image description:', alt || '');
          
          if (newAlt !== null) {
            updateImageProperties(editor, path, { alt: newAlt });
          }
        } catch (error) {
          console.error('Error updating alt text:', error);
        }
      };
      
      return (
        <div 
          className="my-4 relative group" 
          {...attributes}
          onMouseEnter={() => setShowImageControls(true)}
          onMouseLeave={() => setShowImageControls(false)}
        >
          <div 
            contentEditable={false} 
            className={`flex ${getAlignmentClass()} relative`}
          >
            <div className="relative">
              <img 
                src={url} 
                alt={alt || ""} 
                className={`${getWidthClass()} rounded border border-gray-200 dark:border-gray-700 shadow-sm`}
              />
              
              {/* Image controls that appear on hover */}
              {showImageControls && (
                <>
                  {/* Top toolbar for alignment and sizing */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10">
                    {/* Alignment controls */}
                    <button 
                      className={`p-1 rounded ${alignment === 'left' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setImageAlignment(editor, getElementPath(), 'left')}
                      title="Align left"
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button 
                      className={`p-1 rounded ${alignment === 'center' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setImageAlignment(editor, getElementPath(), 'center')}
                      title="Align center"
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button 
                      className={`p-1 rounded ${alignment === 'right' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setImageAlignment(editor, getElementPath(), 'right')}
                      title="Align right"
                    >
                      <AlignRight size={16} />
                    </button>
                    
                    <div className="h-full w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                    
                    {/* Size controls */}
                    <button 
                      className={`p-1 rounded ${size === 'small' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setImageSize(editor, getElementPath(), 'small')}
                      title="Small size"
                    >
                      <Minimize size={16} />
                    </button>
                    <button 
                      className={`p-1 rounded ${size === 'medium' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setImageSize(editor, getElementPath(), 'medium')}
                      title="Medium size"
                    >
                      <AlignCenter size={16} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <button 
                      className={`p-1 rounded ${size === 'large' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setImageSize(editor, getElementPath(), 'large')}
                      title="Large size"
                    >
                      <Maximize size={16} />
                    </button>
                    
                    <div className="h-full w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                    
                    {/* Additional controls */}
                    <button 
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleEditAlt}
                      title="Edit description"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      onClick={handleDeleteImage}
                      title="Remove image"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </>
              )}
              
              {/* Image caption/alt display */}
              {alt && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                  {alt}
                </div>
              )}
            </div>
          </div>
          {children}
        </div>
      );
    }
    
    case 'link':
      return (
        <a 
          href={element.url} 
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline" 
          {...attributes}
        >
          {children}
        </a>
      );
    
    default:
      // Default to paragraph for unknown types
      return (
        <p className="my-2 leading-relaxed" {...attributes}>
          {children}
        </p>
      );
  }
};

export default EditorElement;