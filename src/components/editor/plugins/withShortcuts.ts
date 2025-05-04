import { Editor, Transforms, Element } from 'slate';
import { CustomEditor, CustomElement } from '../../../types/editor';
import { MarkdownFormat, MarkdownElementType } from '../../../types/markdown';
import { SHORTCUTS } from '../../../utils/constants';
import React from 'react';

/**
 * Plugin to add keyboard shortcuts to the editor
 */
export const withShortcuts = (editor: CustomEditor): CustomEditor => {
  // Store the original onKeyDown function if it exists
  const originalOnKeyDown = editor.onKeyDown;
  
  // Define our new onKeyDown handler
  editor.onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { selection } = editor;
    
    // If no selection, skip shortcut handling
    if (!selection) {
      return originalOnKeyDown?.(event);
    }
    
    // Get currently pressed key combination
    const keyCombo = getKeyCombo(event);
    
    // Check for matching shortcuts
    for (const [shortcut, action] of Object.entries(SHORTCUTS)) {
      if (keyCombo === shortcut) {
        event.preventDefault();
        
        const { type, isBlock } = action;
        
        if (isBlock) {
          toggleBlock(editor, type as MarkdownElementType);
        } else {
          toggleMark(editor, type as MarkdownFormat);
        }
        
        return;
      }
    }
    
    // No shortcut found, continue with default behavior
    return originalOnKeyDown?.(event);
  };
  
  return editor;
};

/**
 * Generate a key combo string from a keyboard event
 * e.g. "mod+b" for Ctrl/Cmd+B
 */
const getKeyCombo = (event: React.KeyboardEvent): string => {
  const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
  
  // Normalize modifier keys across platforms
  const modKey = ctrlKey || metaKey;
  
  // Build the key combination
  let combo = '';
  if (modKey) combo += 'mod+';
  if (altKey) combo += 'alt+';
  if (shiftKey) combo += 'shift+';
  
  // Add the main key (lowercase for consistency)
  combo += key.toLowerCase();
  
  return combo;
};

/**
 * Toggle a block format
 */
const toggleBlock = (editor: CustomEditor, format: MarkdownElementType): void => {
  const isActive = isBlockActive(editor, format);
  
  // Convert to paragraph if active, otherwise apply the format
  // Use explicit casting to avoid type errors
  Transforms.setNodes(
    editor,
    { type: isActive ? 'paragraph' : format } as Partial<CustomElement>,
    {
      match: (n: any) => Editor.isBlock(editor, n),
    }
  );
};

/**
 * Check if a block format is active
 */
const isBlockActive = (editor: CustomEditor, format: MarkdownElementType): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === format,
  });
  
  return !!match;
};

/**
 * Toggle a mark format
 */
const toggleMark = (editor: CustomEditor, format: MarkdownFormat): void => {
  const isActive = isMarkActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

/**
 * Check if a mark format is active
 */
const isMarkActive = (editor: CustomEditor, format: MarkdownFormat): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};// Add Element for TypeScript
const isElement = (node: any): node is Element => {
  return node && node.type && node.children;
};

