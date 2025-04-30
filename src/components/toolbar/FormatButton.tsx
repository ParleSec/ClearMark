import React from 'react';
import { useSlate } from 'slate-react';
import { LucideIcon } from 'lucide-react';
import { Editor, Element, Transforms } from 'slate';

import ToolbarButton from './ToolbarButton';
import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';

interface FormatButtonProps {
  format: MarkdownFormat | MarkdownElementType;
  icon: LucideIcon;
  isBlock?: boolean;
  small?: boolean;
  smaller?: boolean;
}

/**
 * Format button component for text and block formatting
 */
const FormatButton: React.FC<FormatButtonProps> = ({ 
  format, 
  icon, 
  isBlock = false,
  small = false,
  smaller = false
}) => {
  const editor = useSlate();
  
  // Check if the current selection has the format
  const isFormatActive = (): boolean => {
    if (isBlock) {
      const [match] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === format,
      });
      return !!match;
    } else {
      const marks = Editor.marks(editor);
      // Use safer type checking when checking for marks
      if (!marks) return false;
      
      // Use type assertion with the specific format
      switch (format) {
        case MarkdownFormat.Bold:
          return !!marks.bold;
        case MarkdownFormat.Italic:
          return !!marks.italic;
        case MarkdownFormat.Code:
          return !!marks.code;
        default:
          return false;
      }
    }
  };
  
  // Toggle the format
  const toggleFormat = (): void => {
    if (isBlock) {
      const isActive = isFormatActive();
      
      Transforms.setNodes(
        editor,
        { type: isActive ? 'paragraph' : format } as Partial<Element>,
        { match: n => Editor.isBlock(editor, n as any) }
      );
    } else {
      if (isFormatActive()) {
        Editor.removeMark(editor, format);
      } else {
        Editor.addMark(editor, format, true);
      }
    }
  };
  
  // Format the title for display
  const formatTitle = (): string => {
    let title = format.toString();
    
    // Remove the prefix if it's a heading
    if (title.startsWith('heading-')) {
      const level = title.charAt(title.length - 1);
      title = `Heading ${level}`;
    } else {
      // Convert from kebab-case to Title Case
      title = title
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return title;
  };
  
  // Render button with size variation for headings
  const Icon = icon;
  const isActive = isFormatActive();
  
  return (
    <ToolbarButton
      icon={(props: any) => (
        <Icon 
          {...props} 
          size={smaller ? 14 : small ? 16 : 18} 
        />
      )}
      isActive={isActive}
      onClick={toggleFormat}
      title={formatTitle()}
    />
  );
};

export default FormatButton;