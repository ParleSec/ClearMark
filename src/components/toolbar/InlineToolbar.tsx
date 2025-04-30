import React, { useEffect, useRef, useState } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Range } from 'slate';
import { Bold, Italic, Code, Link } from 'lucide-react';
import { MarkdownFormat } from '../../types/markdown';
import { wrapLink } from '../editor/plugins/withLinks';
import ToolbarButton from './ToolbarButton';

/**
 * Floating toolbar that appears when text is selected
 */
const InlineToolbar: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  
  // Track visibility state
  const [visible, setVisible] = useState(false);
  
  // Update toolbar position when selection changes
  useEffect(() => {
    const { selection } = editor;
    
    if (!selection || !ref.current || Range.isCollapsed(selection) || Editor.string(editor, selection) === '') {
      setVisible(false);
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
      
      // Position toolbar above selection
      if (ref.current) {
        ref.current.style.opacity = '1';
        ref.current.style.top = `${rect.top - ref.current.offsetHeight - 8 + window.scrollY}px`;
        ref.current.style.left = `${rect.left + rect.width / 2 - ref.current.offsetWidth / 2 + window.scrollX}px`;
        setVisible(true);
      }
    } catch (error) {
      console.error('Error positioning inline toolbar:', error);
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
  const isFormatActive = (format: MarkdownFormat) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
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
      className="absolute -top-10000 -left-10000 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex z-50 opacity-0 transition-opacity"
      style={{ transition: 'opacity 0.2s' }}
      onMouseDown={e => {
        // Prevent losing selection when clicking toolbar
        e.preventDefault();
      }}
    >
      <ToolbarButton
        icon={Bold}
        onClick={() => toggleFormat(MarkdownFormat.Bold)}
        isActive={isFormatActive(MarkdownFormat.Bold)}
        title="Bold"
      />
      
      <ToolbarButton
        icon={Italic}
        onClick={() => toggleFormat(MarkdownFormat.Italic)}
        isActive={isFormatActive(MarkdownFormat.Italic)}
        title="Italic"
      />
      
      <ToolbarButton
        icon={Code}
        onClick={() => toggleFormat(MarkdownFormat.Code)}
        isActive={isFormatActive(MarkdownFormat.Code)}
        title="Code"
      />
      
      <div className="h-full w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <ToolbarButton
        icon={Link}
        onClick={handleInsertLink}
        title="Add Link"
      />
    </div>
  );
};

export default InlineToolbar;