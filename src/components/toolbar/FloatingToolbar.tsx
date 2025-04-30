import React, { useEffect, useRef, useState } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
import { Bold, Italic, Code, Link, Quote, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';

import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';
import { wrapLink } from '../editor/plugins/withLinks';
import ToolbarButton from './ToolbarButton';
import { CustomEditor } from '../../types/editor';

/**
 * Enhanced floating toolbar that appears when text is selected
 * with more formatting options and better positioning
 */
const FloatingToolbar: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  
  // Track visibility and animation state
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Update toolbar position when selection changes
  useEffect(() => {
    const { selection } = editor;
    
    if (!selection || !ref.current || Range.isCollapsed(selection) || Editor.string(editor, selection) === '') {
      if (visible && !animating) {
        // Start fade out animation
        setAnimating(true);
        setTimeout(() => {
          setVisible(false);
          setAnimating(false);
        }, 150); // Match transition duration
      }
      return;
    }
    
    try {
      // Get selection rectangle
      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setVisible(false);
        return;
      }
      
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      
      // Position toolbar above selection with smooth animation
      if (ref.current) {
        const toolbarWidth = ref.current.offsetWidth;
        const editorWidth = document.querySelector('[data-slate-editor]')?.getBoundingClientRect().width || window.innerWidth;
        
        // Calculate horizontal position (ensure it stays within viewport)
        let leftPosition = rect.left + rect.width / 2 - toolbarWidth / 2;
        if (leftPosition < 10) leftPosition = 10;
        if (leftPosition + toolbarWidth > editorWidth - 10) {
          leftPosition = editorWidth - toolbarWidth - 10;
        }
        
        ref.current.style.left = `${leftPosition}px`;
        ref.current.style.top = `${rect.top - ref.current.offsetHeight - 8 + window.scrollY}px`;
        
        if (!visible && !animating) {
          // Prepare for fade in animation
          ref.current.style.opacity = '0';
          ref.current.style.transform = 'translateY(8px)';
          setVisible(true);
          
          // Start animation after a brief delay (allows DOM to update)
          setTimeout(() => {
            if (ref.current) {
              ref.current.style.opacity = '1';
              ref.current.style.transform = 'translateY(0)';
            }
          }, 10);
        }
      }
    } catch (error) {
      console.error('Error positioning floating toolbar:', error);
      setVisible(false);
    }
  });
  
  // Toggle format buttons
  const toggleFormat = (format: MarkdownFormat) => {
    const isActive = isFormatActive(format);
    
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };
  
  // Check if format is active
  const isFormatActive = (format: MarkdownFormat): boolean => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };
  
  // Check if block format is active
  const isBlockActive = (format: MarkdownElementType): boolean => {
    const [match] = Editor.nodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        'type' in n &&
        (n as { type?: string }).type === format,
    });
    return !!match;
  };
  
  // Toggle block format
  const toggleBlock = (format: MarkdownElementType) => {
    const isActive = isBlockActive(format);
    
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : format },
      { match: (n: any) => Editor.isBlock(editor, n) }
    );
  };
  
  // Insert link
  const handleInsertLink = () => {
    const url = prompt('Enter link URL:');
    
    if (!url) return;
    
    if (editor.selection) {
      wrapLink(editor, url);
    }
  };
  
  // If not visible, don't render
  if (!visible) {
    return null;
  }
  
  return (
    <div
      ref={ref}
      className="absolute -top-10000 -left-10000 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex z-50 items-center"
      style={{
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        opacity: 0, // Initial state for animation
      }}
      onMouseDown={e => {
        // Prevent losing selection when clicking toolbar
        e.preventDefault();
      }}
    >
      {/* Text formatting options */}
      <div className="flex items-center">
        <ToolbarButton
          icon={Bold}
          onClick={() => toggleFormat(MarkdownFormat.Bold)}
          isActive={isFormatActive(MarkdownFormat.Bold)}
          title="Bold (Ctrl+B)"
        />
        
        <ToolbarButton
          icon={Italic}
          onClick={() => toggleFormat(MarkdownFormat.Italic)}
          isActive={isFormatActive(MarkdownFormat.Italic)}
          title="Italic (Ctrl+I)"
        />
        
        <ToolbarButton
          icon={Code}
          onClick={() => toggleFormat(MarkdownFormat.Code)}
          isActive={isFormatActive(MarkdownFormat.Code)}
          title="Code (Ctrl+`)"
        />
      </div>
      
      <div className="h-full w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      
      {/* Block formatting options */}
      <div className="flex items-center">
        <ToolbarButton
          icon={Heading1}
          onClick={() => toggleBlock(MarkdownElementType.HeadingOne)}
          isActive={isBlockActive(MarkdownElementType.HeadingOne)}
          title="Heading 1 (Ctrl+1)"
        />
        
        <ToolbarButton
          icon={Heading2}
          onClick={() => toggleBlock(MarkdownElementType.HeadingTwo)}
          isActive={isBlockActive(MarkdownElementType.HeadingTwo)}
          title="Heading 2 (Ctrl+2)"
        />
        
        <ToolbarButton
          icon={Quote}
          onClick={() => toggleBlock(MarkdownElementType.BlockQuote)}
          isActive={isBlockActive(MarkdownElementType.BlockQuote)}
          title="Quote (Ctrl+Shift+.)"
        />
      </div>

      <div className="h-full w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      
      {/* List options */}
      <div className="flex items-center">
        <ToolbarButton
          icon={List}
          onClick={() => toggleBlock(MarkdownElementType.BulletedList)}
          isActive={isBlockActive(MarkdownElementType.BulletedList)}
          title="Bullet List (Ctrl+Shift+8)"
        />
        
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => toggleBlock(MarkdownElementType.NumberedList)}
          isActive={isBlockActive(MarkdownElementType.NumberedList)}
          title="Numbered List (Ctrl+Shift+7)"
        />
      </div>
      
      <div className="h-full w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      
      {/* Insert link */}
      <ToolbarButton
        icon={Link}
        onClick={handleInsertLink}
        title="Add Link"
      />
    </div>
  );
};

export default FloatingToolbar;