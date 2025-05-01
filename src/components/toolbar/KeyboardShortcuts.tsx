import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Element as SlateElement } from 'slate';
import { MarkdownFormat, MarkdownElementType } from '../../types/markdown';
import { SHORTCUTS } from '../../utils/constants';
import { matchesShortcut } from '../../utils/keyboard';
import { useEditorContext } from '../../context/EditorContext';

/**
 * Component to handle keyboard shortcuts within Slate editor context
 */
const KeyboardShortcuts: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const editor = useSlate(); // This is safe because it's inside the Slate context
  const { toggleFormat } = useEditorContext();
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Loop through defined shortcuts in SHORTCUTS constant
    for (const [shortcut, action] of Object.entries(SHORTCUTS)) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        
        const { type, isBlock } = action;
        
        // Use the context's toggleFormat for consistency
        toggleFormat(type, isBlock);
        
        return true;
      }
    }
    
    return false;
  }, [editor, toggleFormat]);
  
  // Clone the child and add the keyDown handler
  return React.cloneElement(children as React.ReactElement, {
    onKeyDown: (event: React.KeyboardEvent) => {
      // First call our shortcut handler
      const handled = handleKeyDown(event);
      
      // If not handled by our shortcuts, call the original onKeyDown if it exists
      if (!handled && (children as React.ReactElement).props.onKeyDown) {
        (children as React.ReactElement).props.onKeyDown(event);
      }
    }
  });
};

export default KeyboardShortcuts;