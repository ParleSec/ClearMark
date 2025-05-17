import React, { useEffect, useRef, useState } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Range } from 'slate';
import { Bold, Italic, Code, Link } from 'lucide-react';
import { MarkdownFormat } from '../../types/markdown';
import { wrapLink } from '../editor/plugins/withLinks';
import ToolbarButton from './ToolbarButton';

/**
 * Floating toolbar that appears when text is selected
 * Updated with fluid, water-inspired styling
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
      className="absolute -top-10000 -left-10000 bg-gradient-to-br from-white/95 to-sky-50/90 dark:from-slate-900/95 dark:to-sky-950/90 rounded-[0.35rem] shadow-lg border border-t-slate-100 border-x-slate-200/70 border-b-sky-200/70 dark:border-t-slate-800 dark:border-x-slate-800/70 dark:border-b-sky-800/60 p-1.5 flex z-50 opacity-0 transition-opacity backdrop-blur-md"
      style={{
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderTopLeftRadius: '0.4rem',
        borderTopRightRadius: '0.3rem',
        borderBottomLeftRadius: '0.3rem',
        borderBottomRightRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.08), 0 2px 4px rgba(14, 165, 233, 0.05)'
      }}
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
      
      <div className="h-6 w-px mx-1.5 bg-gradient-to-b from-sky-100/50 to-slate-200/60 dark:from-sky-800/30 dark:to-slate-700/40" />
      
      <ToolbarButton
        icon={Link}
        onClick={handleInsertLink}
        title="Add Link"
      />
    </div>
  );
};

export default InlineToolbar;